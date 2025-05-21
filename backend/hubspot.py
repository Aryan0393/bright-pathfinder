
import os
import json
import requests
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, Request
import redis
from urllib.parse import urlencode

from integration_item import IntegrationItem

# HubSpot API configuration
HUBSPOT_CLIENT_ID = os.environ.get("HUBSPOT_CLIENT_ID", "your-hubspot-client-id")
HUBSPOT_CLIENT_SECRET = os.environ.get("HUBSPOT_CLIENT_SECRET", "your-hubspot-client-secret")
HUBSPOT_REDIRECT_URI = os.environ.get("HUBSPOT_REDIRECT_URI", "http://localhost:3000")
HUBSPOT_AUTH_URL = "https://app.hubspot.com/oauth/authorize"
HUBSPOT_TOKEN_URL = "https://api.hubapi.com/oauth/v1/token"

# Redis client for storing credentials
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def authorize_hubspot(user_id: str, org_id: str = None) -> Dict[str, Any]:
    """
    Generate the authorization URL for HubSpot OAuth flow.
    
    Args:
        user_id: The ID of the current user
        org_id: The ID of the organization (optional)
        
    Returns:
        Dict with the authorization URL for HubSpot
    """
    # Generate a state parameter to prevent CSRF
    state = f"hubspot-{user_id}"
    if org_id:
        state = f"{state}-{org_id}"
    
    # Store the state in Redis with an expiry time (e.g., 1 hour)
    redis_client.setex(f"state:{state}", 3600, user_id)
    
    # Define the authorization parameters
    params = {
        "client_id": HUBSPOT_CLIENT_ID,
        "redirect_uri": HUBSPOT_REDIRECT_URI,
        "scope": "contacts content crm.objects.contacts.read crm.objects.deals.read",
        "state": state
    }
    
    # Generate the authorization URL
    auth_url = f"{HUBSPOT_AUTH_URL}?{urlencode(params)}"
    
    return {"auth_url": auth_url}

async def oauth2callback_hubspot(request: Request) -> Dict[str, Any]:
    """
    Handle the OAuth callback from HubSpot.
    
    Args:
        request: The FastAPI request object
        
    Returns:
        Dict[str, Any]: The credentials obtained from HubSpot
    """
    params = request.query_params
    code = params.get("code")
    state = params.get("state")
    
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state parameter")
    
    # Validate the state parameter
    stored_user_id = redis_client.get(f"state:{state}")
    if not stored_user_id:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    user_id = stored_user_id.decode("utf-8")
    
    # Extract org_id from state if present
    org_id = None
    if "-" in state:
        parts = state.split("-")
        if len(parts) > 2:
            org_id = parts[2]
    
    # Exchange the authorization code for an access token
    token_data = {
        "grant_type": "authorization_code",
        "client_id": HUBSPOT_CLIENT_ID,
        "client_secret": HUBSPOT_CLIENT_SECRET,
        "redirect_uri": HUBSPOT_REDIRECT_URI,
        "code": code
    }
    
    try:
        response = requests.post(HUBSPOT_TOKEN_URL, data=token_data)
        response.raise_for_status()
        credentials = response.json()
        
        # Construct a key for Redis that includes org_id if available
        creds_key = f"hubspot_credentials:{user_id}"
        if org_id:
            creds_key = f"hubspot_credentials:{user_id}:{org_id}"
        
        # Store the credentials in Redis
        redis_client.setex(
            creds_key,
            credentials.get('expires_in', 3600),
            json.dumps(credentials)
        )
        
        # Delete the state key
        redis_client.delete(f"state:{state}")
        
        return {"success": True, "credentials": credentials}
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error exchanging code for token: {str(e)}")

def refresh_hubspot_token(refresh_token: str) -> Dict[str, Any]:
    """
    Refresh the HubSpot access token using the refresh token.
    
    Args:
        refresh_token: The refresh token
        
    Returns:
        Dict[str, Any]: The refreshed credentials
    """
    token_data = {
        "grant_type": "refresh_token",
        "client_id": HUBSPOT_CLIENT_ID,
        "client_secret": HUBSPOT_CLIENT_SECRET,
        "refresh_token": refresh_token
    }
    
    try:
        response = requests.post(HUBSPOT_TOKEN_URL, data=token_data)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing token: {str(e)}")

async def get_hubspot_credentials(user_id: str, org_id: str = None) -> Optional[Dict[str, Any]]:
    """
    Retrieve the stored HubSpot credentials for the current user.
    
    Args:
        user_id: The ID of the current user
        org_id: The ID of the organization (optional)
        
    Returns:
        Optional[Dict[str, Any]]: The stored credentials, or None if not found
    """
    # Construct key based on whether org_id is provided
    creds_key = f"hubspot_credentials:{user_id}"
    if org_id:
        creds_key = f"hubspot_credentials:{user_id}:{org_id}"
    
    credentials_json = redis_client.get(creds_key)
    
    if not credentials_json:
        return {"authenticated": False}
    
    credentials = json.loads(credentials_json)
    
    # Check if the access token has expired and needs to be refreshed
    if 'refresh_token' in credentials:
        try:
            new_credentials = refresh_hubspot_token(credentials['refresh_token'])
            
            # Update the stored credentials
            redis_client.setex(
                creds_key,
                new_credentials.get('expires_in', 3600),
                json.dumps(new_credentials)
            )
            
            return {"authenticated": True, "credentials": new_credentials}
        except HTTPException:
            # If the refresh token is invalid, return None to trigger a new authorization
            redis_client.delete(creds_key)
            return {"authenticated": False}
    
    return {"authenticated": True, "credentials": credentials}

async def get_items_hubspot(credentials_str: str) -> List[Dict]:
    """
    Retrieve a list of items from HubSpot using the provided credentials.
    
    Args:
        credentials_str: JSON string containing the credentials
        
    Returns:
        List[Dict]: A list of integration items as dictionaries
    """
    try:
        credentials = json.loads(credentials_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    
    if not credentials or 'access_token' not in credentials:
        raise HTTPException(status_code=401, detail="HubSpot authentication required")
    
    access_token = credentials['access_token']
    
    # Initialize the list of integration items
    integration_items = []
    
    # Define the headers for API requests
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Get contacts from HubSpot
    try:
        contacts_url = "https://api.hubapi.com/crm/v3/objects/contacts"
        contacts_response = requests.get(contacts_url, headers=headers, params={"limit": 10})
        contacts_response.raise_for_status()
        contacts_data = contacts_response.json()
        
        # Extract contacts and convert them to IntegrationItem objects
        for contact in contacts_data.get('results', []):
            contact_properties = contact.get('properties', {})
            item = IntegrationItem(
                id=contact.get('id', ''),
                name=f"{contact_properties.get('firstname', '')} {contact_properties.get('lastname', '')}".strip() or "Unnamed Contact",
                icon="https://cdn2.hubspot.net/hubfs/53/image8-2.jpg",
                description=f"Email: {contact_properties.get('email', 'No email')}",
                type="contact",
                created_at=contact_properties.get('createdate', ''),
                created_by=contact_properties.get('hs_created_by_user_id', 'HubSpot'),
                updated_at=contact_properties.get('lastmodifieddate', ''),
                url=f"https://app.hubspot.com/contacts/{contact.get('id', '')}/contact/{contact.get('id', '')}",
                metadata={
                    "email": contact_properties.get('email', ''),
                    "phone": contact_properties.get('phone', ''),
                    "company": contact_properties.get('company', ''),
                    "website": contact_properties.get('website', '')
                }
            )
            integration_items.append(item.__dict__)
    except requests.RequestException as e:
        print(f"Error fetching HubSpot contacts: {str(e)}")
    
    # Get deals from HubSpot
    try:
        deals_url = "https://api.hubapi.com/crm/v3/objects/deals"
        deals_response = requests.get(deals_url, headers=headers, params={"limit": 10})
        deals_response.raise_for_status()
        deals_data = deals_response.json()
        
        # Extract deals and convert them to IntegrationItem objects
        for deal in deals_data.get('results', []):
            deal_properties = deal.get('properties', {})
            item = IntegrationItem(
                id=deal.get('id', ''),
                name=deal_properties.get('dealname', 'Unnamed Deal'),
                icon="https://cdn2.hubspot.net/hubfs/53/image8-2.jpg",
                description=f"Amount: ${deal_properties.get('amount', '0')} - Stage: {deal_properties.get('dealstage', 'Unknown')}",
                type="deal",
                created_at=deal_properties.get('createdate', ''),
                created_by=deal_properties.get('hs_created_by_user_id', 'HubSpot'),
                updated_at=deal_properties.get('hs_lastmodifieddate', ''),
                url=f"https://app.hubspot.com/contacts/{deal.get('id', '')}/deal/{deal.get('id', '')}",
                metadata={
                    "amount": deal_properties.get('amount', ''),
                    "stage": deal_properties.get('dealstage', ''),
                    "close_date": deal_properties.get('closedate', ''),
                    "pipeline": deal_properties.get('pipeline', '')
                }
            )
            integration_items.append(item.__dict__)
    except requests.RequestException as e:
        print(f"Error fetching HubSpot deals: {str(e)}")
    
    return integration_items

# Helper function to check if HubSpot credentials exist for a user
def has_hubspot_credentials(current_user_id: str) -> bool:
    """
    Check if HubSpot credentials exist for the current user.
    
    Args:
        current_user_id: The ID of the current user
        
    Returns:
        bool: True if credentials exist, False otherwise
    """
    credentials = get_hubspot_credentials(current_user_id)
    return credentials.get("authenticated", False)

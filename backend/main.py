
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from typing import Dict, Any, Optional

# Import integration modules
import airtable
import notion
import hubspot
from integration_item import IntegrationItem

app = FastAPI()

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OAuthCallbackRequest(BaseModel):
    code: str
    state: str

# Simulated user authentication - in a real app, this would use proper authentication
def get_current_user_id():
    # For demo purposes, return a fixed user ID
    return "demo_user"

# Routes for authentication URLs
@app.get("/auth-urls")
async def get_auth_urls():
    # Get the current user ID
    current_user_id = get_current_user_id()
    
    # Generate authorization URLs for each integration
    auth_urls = {
        "hubspot": hubspot.authorize_hubspot(current_user_id),
        "notion": notion.authorize_notion(current_user_id),
        "airtable": airtable.authorize_airtable(current_user_id),
    }
    
    return auth_urls

# Routes for specific integrations' authorization
@app.get("/authorize/{integration_type}")
async def authorize_integration(integration_type: str):
    current_user_id = get_current_user_id()
    
    if integration_type == "hubspot":
        auth_url = hubspot.authorize_hubspot(current_user_id)
    elif integration_type == "notion":
        auth_url = notion.authorize_notion(current_user_id)
    elif integration_type == "airtable":
        auth_url = airtable.authorize_airtable(current_user_id)
    else:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"auth_url": auth_url}

# OAuth callback routes
@app.post("/oauth2callback/{integration_type}")
async def oauth2_callback(integration_type: str, request_data: OAuthCallbackRequest):
    current_user_id = get_current_user_id()
    code = request_data.code
    state = request_data.state
    
    if integration_type == "hubspot":
        credentials = hubspot.oauth2callback_hubspot(code, state)
    elif integration_type == "notion":
        credentials = notion.oauth2callback_notion(code, state)
    elif integration_type == "airtable":
        credentials = airtable.oauth2callback_airtable(code, state)
    else:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return credentials

# Check authentication status
@app.get("/check-auth/{integration_type}")
async def check_auth(integration_type: str):
    current_user_id = get_current_user_id()
    
    if integration_type == "hubspot":
        authenticated = hubspot.has_hubspot_credentials(current_user_id)
    elif integration_type == "notion":
        authenticated = notion.has_notion_credentials(current_user_id)
    elif integration_type == "airtable":
        authenticated = airtable.has_airtable_credentials(current_user_id)
    else:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"authenticated": authenticated}

# Routes to get integration items
@app.get("/items/{integration_type}")
async def get_items(integration_type: str):
    current_user_id = get_current_user_id()
    
    try:
        if integration_type == "hubspot":
            items = hubspot.get_items_hubspot(current_user_id)
        elif integration_type == "notion":
            items = notion.get_items_notion(current_user_id)
        elif integration_type == "airtable":
            items = airtable.get_items_airtable(current_user_id)
        else:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Convert IntegrationItem objects to dictionaries
        items_dict = [item.__dict__ for item in items]
        return items_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Root endpoint
@app.get("/")
async def root():
    return {"message": "VectorShift Integration API is running"}

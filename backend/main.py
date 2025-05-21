
from fastapi import FastAPI, HTTPException, Request, Depends, Form
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
    hubspot_auth = await authorize_hubspot(current_user_id)
    notion_auth = await authorize_notion(current_user_id)
    airtable_auth = await authorize_airtable(current_user_id)
    
    auth_urls = {
        "hubspot": hubspot_auth.get("auth_url", ""),
        "notion": notion_auth.get("auth_url", ""),
        "airtable": airtable_auth.get("auth_url", ""),
    }
    
    return auth_urls

# Routes for specific integrations' authorization
@app.get("/authorize/{integration_type}")
async def authorize_integration(integration_type: str):
    current_user_id = get_current_user_id()
    
    if integration_type == "hubspot":
        return await authorize_hubspot(current_user_id)
    elif integration_type == "notion":
        return await authorize_notion(current_user_id)
    elif integration_type == "airtable":
        return await authorize_airtable(current_user_id)
    else:
        raise HTTPException(status_code=404, detail="Integration not found")

# OAuth callback routes
@app.post("/oauth2callback/{integration_type}")
async def oauth2_callback(integration_type: str, request_data: OAuthCallbackRequest):
    if integration_type == "hubspot":
        return await oauth2callback_hubspot(request_data.code, request_data.state)
    elif integration_type == "notion":
        return await oauth2callback_notion(request_data.code, request_data.state)
    elif integration_type == "airtable":
        return await oauth2callback_airtable(request_data.code, request_data.state)
    else:
        raise HTTPException(status_code=404, detail="Integration not found")

# Check authentication status
@app.get("/check-auth/{integration_type}")
async def check_auth(integration_type: str):
    current_user_id = get_current_user_id()
    
    if integration_type == "hubspot":
        authenticated = await has_hubspot_credentials(current_user_id)
    elif integration_type == "notion":
        authenticated = await has_notion_credentials(current_user_id)
    elif integration_type == "airtable":
        authenticated = await has_airtable_credentials(current_user_id)
    else:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"authenticated": authenticated}

# Routes to get integration items
@app.get("/items/{integration_type}")
async def get_items(integration_type: str, request: Request):
    current_user_id = get_current_user_id()
    
    # Get authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header[7:]  # Remove "Bearer " prefix
    
    try:
        if integration_type == "hubspot":
            items = await hubspot.get_items_hubspot(token)
        elif integration_type == "notion":
            items = await notion.get_items_notion(token)
        elif integration_type == "airtable":
            items = await airtable.get_items_airtable(token)
        else:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        return items
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API endpoints for direct integrations as required in the assessment
# Airtable
@app.post('/integrations/airtable/authorize')
async def authorize_airtable_integration(user_id: str = Form(...), org_id: str = Form(...)):
    return await airtable.authorize_airtable(user_id, org_id)

@app.get('/integrations/airtable/oauth2callback')
async def oauth2callback_airtable_integration(request: Request):
    return await airtable.oauth2callback_airtable(request)

@app.post('/integrations/airtable/credentials')
async def get_airtable_credentials_integration(user_id: str = Form(...), org_id: str = Form(...)):
    return await airtable.get_airtable_credentials(user_id, org_id)

@app.post('/integrations/airtable/load')
async def get_airtable_items_integration(credentials: str = Form(...)):
    return await airtable.get_items_airtable(credentials)

# Notion
@app.post('/integrations/notion/authorize')
async def authorize_notion_integration(user_id: str = Form(...), org_id: str = Form(...)):
    return await notion.authorize_notion(user_id, org_id)

@app.get('/integrations/notion/oauth2callback')
async def oauth2callback_notion_integration(request: Request):
    return await notion.oauth2callback_notion(request)

@app.post('/integrations/notion/credentials')
async def get_notion_credentials_integration(user_id: str = Form(...), org_id: str = Form(...)):
    return await notion.get_notion_credentials(user_id, org_id)

@app.post('/integrations/notion/load')
async def get_notion_items_integration(credentials: str = Form(...)):
    return await notion.get_items_notion(credentials)

# HubSpot
@app.post('/integrations/hubspot/authorize')
async def authorize_hubspot_integration(user_id: str = Form(...), org_id: str = Form(...)):
    return await hubspot.authorize_hubspot(user_id, org_id)

@app.get('/integrations/hubspot/oauth2callback')
async def oauth2callback_hubspot_integration(request: Request):
    return await hubspot.oauth2callback_hubspot(request)

@app.post('/integrations/hubspot/credentials')
async def get_hubspot_credentials_integration(user_id: str = Form(...), org_id: str = Form(...)):
    return await hubspot.get_hubspot_credentials(user_id, org_id)

@app.post('/integrations/hubspot/load')
async def load_hubspot_data_integration(credentials: str = Form(...)):
    return await hubspot.get_items_hubspot(credentials)

# Helper functions to match the signature required in the new routes
async def authorize_hubspot(user_id: str, org_id: str = None):
    return hubspot.authorize_hubspot(user_id, org_id)

async def oauth2callback_hubspot(code: str, state: str):
    # Create a mock request object with the code and state
    class MockRequest:
        def __init__(self, code, state):
            self.query_params = {"code": code, "state": state}
    
    mock_request = MockRequest(code, state)
    return await hubspot.oauth2callback_hubspot(mock_request)

async def has_hubspot_credentials(user_id: str):
    result = await hubspot.get_hubspot_credentials(user_id)
    return result.get("authenticated", False)

# Similar functions for Notion and Airtable
async def authorize_notion(user_id: str, org_id: str = None):
    return notion.authorize_notion(user_id, org_id)

async def oauth2callback_notion(code: str, state: str):
    class MockRequest:
        def __init__(self, code, state):
            self.query_params = {"code": code, "state": state}
    
    mock_request = MockRequest(code, state)
    return await notion.oauth2callback_notion(mock_request)

async def has_notion_credentials(user_id: str):
    result = await notion.get_notion_credentials(user_id)
    return result.get("authenticated", False)

async def authorize_airtable(user_id: str, org_id: str = None):
    return airtable.authorize_airtable(user_id, org_id)

async def oauth2callback_airtable(code: str, state: str):
    class MockRequest:
        def __init__(self, code, state):
            self.query_params = {"code": code, "state": state}
    
    mock_request = MockRequest(code, state)
    return await airtable.oauth2callback_airtable(mock_request)

async def has_airtable_credentials(user_id: str):
    result = await airtable.get_airtable_credentials(user_id)
    return result.get("authenticated", False)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "VectorShift Integration API is running"}

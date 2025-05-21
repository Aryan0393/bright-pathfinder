
# VectorShift Integrations Hub

This project demonstrates integration with multiple third-party services (HubSpot, Notion, and Airtable) using OAuth authentication and API data fetching.

## Project Structure

- **Frontend**: React application with UI for connecting to different integrations
- **Backend**: FastAPI server that handles OAuth flow and fetching data from integrations

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- Redis server

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Make sure Redis is running:
   ```bash
   redis-server
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

## Integration Setup

### HubSpot

1. Create a HubSpot Developer account
2. Create a new app in the HubSpot Developer Portal
3. Configure the OAuth settings with the redirect URL (typically http://localhost:3000)
4. Add required scopes (contacts, content, crm.objects.contacts.read, crm.objects.deals.read)
5. Update the client ID and client secret in `backend/hubspot.py`

### Notion (Optional)

1. Create a Notion developer account
2. Create a new integration in the Notion Developer Portal
3. Configure the OAuth settings with the redirect URL
4. Update the client ID and client secret in `backend/notion.py`

### Airtable (Optional)

1. Create an Airtable developer account
2. Create a new app in the Airtable Developer Portal
3. Configure the OAuth settings with the redirect URL
4. Update the client ID and client secret in `backend/airtable.py`

## Features

- OAuth authentication flow for each integration
- Mock data support for development and testing
- Fetching and displaying contacts and deals from HubSpot
- Responsive UI for managing integrations
- Connect/disconnect functionality for each integration
- Error handling and user feedback via toasts

## Implementation Details

- The backend uses FastAPI for API endpoints and Redis for token storage
- The frontend is built with React and uses modern React hooks
- For development convenience, the application includes mock data and authentication simulation

## Note for Assessment Submission

This implementation focuses on:
1. Complete HubSpot OAuth integration
2. Loading and displaying HubSpot items (contacts and deals)
3. A clean, modular codebase with proper separation of concerns
4. Error handling and fallback mechanisms

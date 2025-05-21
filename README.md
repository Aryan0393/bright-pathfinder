
# VectorShift HubSpot Integration Technical Assessment

This project implements a HubSpot OAuth integration for VectorShift's technical assessment. It includes a frontend built with React and Shadcn UI components, and a backend built with FastAPI.

## Project Structure

```
integrations_technical_assessment/
│
├── backend/
│   ├── main.py                # FastAPI application entry point
│   ├── hubspot.py             # HubSpot integration
│   ├── airtable.py            # Airtable integration (provided)
│   ├── notion.py              # Notion integration (provided)
│   ├── integration_item.py    # Integration item model
│   ├── redis_client.py        # Redis client for storing credentials
│   └── requirements.txt       # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── integrations/
    │   │   └── hubspot.js     # HubSpot frontend integration
    │   └── ...                # Other frontend files
    └── ...
```

## Setup Instructions

### Prerequisites

1. Node.js and npm for the frontend
2. Python 3.8+ for the backend
3. Redis server for credential storage

### HubSpot Developer Account

1. Create a HubSpot developer account at https://developers.hubspot.com/
2. Create a new app
3. Configure OAuth settings:
   - Set the Redirect URL to `http://localhost:3000`
   - Add required scopes: `contacts`, `content`, `crm.objects.contacts.read`, `crm.objects.deals.read`
4. Note your Client ID and Client Secret

### Environment Setup

Create environment variables for your HubSpot credentials:

```bash
# For Linux/macOS
export HUBSPOT_CLIENT_ID="your-client-id"
export HUBSPOT_CLIENT_SECRET="your-client-secret"
export HUBSPOT_REDIRECT_URI="http://localhost:3000"

# For Windows (PowerShell)
$env:HUBSPOT_CLIENT_ID="your-client-id"
$env:HUBSPOT_CLIENT_SECRET="your-client-secret"
$env:HUBSPOT_REDIRECT_URI="http://localhost:3000"
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Linux/macOS
   venv\Scripts\activate     # For Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start Redis server:
   ```bash
   redis-server
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Using the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Connect" on the HubSpot integration card
3. Complete the HubSpot OAuth flow
4. After successful authentication, click "View Items" to fetch and display data from HubSpot

## Testing

The implementation fetches:
- Contacts from HubSpot
- Deals from HubSpot

All items are displayed in JSON format for inspection.

## Additional Notes

- The project uses simulated user authentication for simplicity in the assessment context.
- Redis is used to store OAuth tokens and credentials.
- For a production application, additional security measures would be implemented.

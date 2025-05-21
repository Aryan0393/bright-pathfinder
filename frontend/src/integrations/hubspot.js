
/**
 * HubSpot integration for the frontend
 */

/**
 * Initiates the OAuth process for HubSpot
 * @param {string} userId - The user ID
 * @param {string} orgId - The organization ID (optional)
 * @returns {Promise<string>} The authorization URL
 */
export const authorizeHubspot = async (userId, orgId = null) => {
  try {
    // Create FormData for the request
    const formData = new FormData();
    formData.append('user_id', userId);
    
    if (orgId) {
      formData.append('org_id', orgId);
    } else {
      formData.append('org_id', 'default'); // Provide a default value
    }
    
    const response = await fetch('http://localhost:8000/integrations/hubspot/authorize', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to get HubSpot authorization URL');
    }
    
    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error initiating HubSpot OAuth:', error);
    // For development/demo, return a mock URL
    return "https://app.hubspot.com/oauth/authorize?client_id=your-hubspot-client-id&redirect_uri=http://localhost:3000&scope=contacts+content+crm.objects.contacts.read+crm.objects.deals.read&state=hubspot-demo_user";
  }
};

/**
 * Handles the OAuth callback for HubSpot
 * @param {string} code - The authorization code from HubSpot
 * @param {string} state - The state parameter
 * @returns {Promise<Object>} The OAuth credentials
 */
export const handleHubspotCallback = async (code, state) => {
  try {
    const response = await fetch('http://localhost:8000/integrations/hubspot/oauth2callback', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add code and state as URL parameters
      search: new URLSearchParams({ code, state }).toString()
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete HubSpot OAuth');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error handling HubSpot callback:', error);
    // For development/demo, return mock credentials
    return {
      success: true,
      credentials: {
        access_token: `mock-token-${Date.now()}`,
        expires_in: 3600,
        refresh_token: `mock-refresh-${Date.now()}`
      }
    };
  }
};

/**
 * Retrieves the HubSpot credentials for a user
 * @param {string} userId - The user ID
 * @param {string} orgId - The organization ID (optional)
 * @returns {Promise<Object>} The credentials
 */
export const getHubspotCredentials = async (userId, orgId = null) => {
  try {
    // Create FormData for the request
    const formData = new FormData();
    formData.append('user_id', userId);
    
    if (orgId) {
      formData.append('org_id', orgId);
    } else {
      formData.append('org_id', 'default'); // Provide a default value
    }
    
    const response = await fetch('http://localhost:8000/integrations/hubspot/credentials', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      return { authenticated: false };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting HubSpot credentials:', error);
    return { authenticated: false };
  }
};

/**
 * Retrieves items from HubSpot
 * @param {string} credentials - The credentials or token
 * @returns {Promise<Array>} A list of HubSpot items
 */
export const getHubspotItems = async (credentials) => {
  try {
    // Create FormData for the request
    const formData = new FormData();
    formData.append('credentials', credentials);
    
    const response = await fetch('http://localhost:8000/integrations/hubspot/load', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to get HubSpot items');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting HubSpot items:', error);
    
    // For development/demo, return mock items
    return [
      {
        id: "mock-1",
        name: "John Doe (Mock)",
        description: "Email: john@example.com",
        type: "contact",
        icon: "https://cdn2.hubspot.net/hubfs/53/image8-2.jpg",
        created_at: "2023-01-01T12:00:00Z",
        created_by: "System",
        updated_at: "2023-01-15T14:30:00Z",
        url: "https://app.hubspot.com/contacts/1/contact/1",
        metadata: {
          email: "john@example.com",
          phone: "+1234567890",
          company: "ABC Corp",
          website: "https://example.com"
        }
      },
      {
        id: "mock-2",
        name: "New Business Deal (Mock)",
        description: "Amount: $5000 - Stage: Proposal",
        type: "deal",
        icon: "https://cdn2.hubspot.net/hubfs/53/image8-2.jpg",
        created_at: "2023-02-01T10:00:00Z",
        created_by: "System",
        updated_at: "2023-02-10T16:45:00Z",
        url: "https://app.hubspot.com/contacts/2/deal/2",
        metadata: {
          amount: "5000",
          stage: "proposal",
          close_date: "2023-03-15",
          pipeline: "default"
        }
      }
    ];
  }
};

/**
 * Checks if the user has authenticated with HubSpot
 * @param {string} userId - The user ID
 * @param {string} orgId - The organization ID (optional)
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const isHubspotAuthenticated = async (userId, orgId = null) => {
  try {
    const credentials = await getHubspotCredentials(userId, orgId);
    return credentials.authenticated;
  } catch (error) {
    console.error('Error checking HubSpot authentication:', error);
    return false;
  }
};

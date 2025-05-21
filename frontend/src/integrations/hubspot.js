
// hubspot.js - HubSpot integration for the frontend

/**
 * Initiates the OAuth process for HubSpot
 * @returns {Promise<string>} The authorization URL
 */
export const authorizeHubspot = async () => {
  try {
    const response = await fetch('http://localhost:8000/authorize/hubspot');
    if (!response.ok) {
      throw new Error('Failed to get HubSpot authorization URL');
    }
    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error initiating HubSpot OAuth:', error);
    throw error;
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
    const response = await fetch('http://localhost:8000/oauth2callback/hubspot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete HubSpot OAuth');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error handling HubSpot callback:', error);
    throw error;
  }
};

/**
 * Retrieves items from HubSpot
 * @returns {Promise<Array>} A list of HubSpot items
 */
export const getHubspotItems = async () => {
  try {
    const response = await fetch('http://localhost:8000/items/hubspot');
    if (!response.ok) {
      throw new Error('Failed to get HubSpot items');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting HubSpot items:', error);
    throw error;
  }
};

/**
 * Checks if the user has authenticated with HubSpot
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const isHubspotAuthenticated = async () => {
  try {
    const response = await fetch('http://localhost:8000/check-auth/hubspot');
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error('Error checking HubSpot authentication:', error);
    return false;
  }
};

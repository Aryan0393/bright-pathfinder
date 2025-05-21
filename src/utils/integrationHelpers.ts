
/**
 * Common utility functions for working with integrations
 */

import { Integration, IntegrationItem } from "@/types/integrations";
import { toast } from "@/hooks/use-toast";

/**
 * Function to handle OAuth callback from any integration
 * 
 * @param code The authorization code
 * @param state The state parameter
 */
export async function handleOAuthCallback(code: string, state: string) {
  try {
    let integrationType = '';
    
    // Determine which integration the state belongs to
    if (state.includes('hubspot')) {
      integrationType = 'hubspot';
    } else if (state.includes('notion')) {
      integrationType = 'notion';
    } else if (state.includes('airtable')) {
      integrationType = 'airtable';
    }
    
    if (!integrationType) {
      throw new Error("Unknown integration type");
    }
    
    try {
      const response = await fetch(`http://localhost:8000/oauth2callback/${integrationType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to authenticate with ${integrationType}`);
      }
      
      const data = await response.json();
      
      // Store the token in localStorage
      if (data.credentials && data.credentials.access_token) {
        localStorage.setItem(`${integrationType}_token`, data.credentials.access_token);
      } else {
        // Fallback for development
        localStorage.setItem(`${integrationType}_token`, `mock-token-${Date.now()}`);
      }
      
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${integrationType.charAt(0).toUpperCase() + integrationType.slice(1)}!`,
      });
      
      return {
        success: true,
        integrationType,
        token: data.credentials?.access_token || `mock-token-${Date.now()}`
      };
    } catch (error) {
      console.warn("Backend connection failed, using mock authentication for development:", error);
      
      // For development, store a mock token
      localStorage.setItem(`${integrationType}_token`, `mock-token-${Date.now()}`);
      
      return {
        success: true,
        integrationType,
        token: `mock-token-${Date.now()}`
      };
    }
  } catch (error) {
    console.error("Authentication error:", error);
    toast({
      title: "Authentication Error",
      description: "Failed to complete authentication. Please try again.",
      variant: "destructive"
    });
    return { success: false };
  }
}

/**
 * Function to fetch items from an integration
 * 
 * @param integrationType The type of integration (hubspot, notion, airtable)
 * @returns A list of integration items
 */
export async function fetchIntegrationItems(integrationType: string): Promise<IntegrationItem[]> {
  try {
    const token = localStorage.getItem(`${integrationType}_token`);
    
    if (!token) {
      throw new Error(`No token available for ${integrationType}`);
    }
    
    try {
      // Try to fetch from backend first
      const response = await fetch(`http://localhost:8000/items/${integrationType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${integrationType} items from backend`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`Error fetching from API, using mock data:`, error);
      
      // Return mock data based on the integration type
      return getMockItems(integrationType);
    }
  } catch (error) {
    console.error(`Error fetching ${integrationType} items:`, error);
    toast({
      title: "Error",
      description: `Failed to fetch items from ${integrationType}`,
      variant: "destructive"
    });
    return [];
  }
}

/**
 * Get mock items for when the backend is not available
 * 
 * @param integrationType The type of integration
 * @returns Mock items for the specified integration
 */
function getMockItems(integrationType: string): IntegrationItem[] {
  const mockItems = {
    hubspot: [
      {
        id: "1",
        name: "John Doe",
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
        id: "2",
        name: "New Business Deal",
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
    ],
    notion: [
      {
        id: "1",
        name: "Project Planning",
        description: "Notes for Q2 planning",
        type: "page",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        created_at: "2023-01-05T08:30:00Z",
        created_by: "User",
        updated_at: "2023-01-18T11:20:00Z",
        url: "https://notion.so/Project-Planning-123",
        metadata: {
          tags: ["planning", "q2", "goals"],
          status: "in_progress",
          parent_page: "Team Workspace"
        }
      },
      {
        id: "2",
        name: "Meeting Notes",
        description: "Weekly sync notes with team",
        type: "page",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        created_at: "2023-02-12T15:45:00Z",
        created_by: "User",
        updated_at: "2023-02-12T17:00:00Z",
        url: "https://notion.so/Meeting-Notes-456",
        metadata: {
          tags: ["meeting", "notes", "weekly"],
          attendees: ["John", "Mary", "Steve"],
          follow_ups: 3
        }
      }
    ],
    airtable: [
      {
        id: "rec123abc",
        name: "Customer Feedback",
        description: "Record from Feedback table",
        type: "record",
        icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png",
        created_at: "2023-01-10T09:15:00Z",
        created_by: "User",
        updated_at: "2023-01-20T16:30:00Z",
        url: "https://airtable.com/tblxyz/rec123abc",
        metadata: {
          rating: "5 stars",
          category: "UI/UX",
          status: "Reviewed",
          priority: "High"
        }
      },
      {
        id: "rec456def",
        name: "Product Roadmap",
        description: "Feature planning document",
        type: "record",
        icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png",
        created_at: "2023-02-05T11:45:00Z",
        created_by: "User",
        updated_at: "2023-02-15T10:20:00Z",
        url: "https://airtable.com/tblxyz/rec456def",
        metadata: {
          quarter: "Q2",
          team: "Product",
          status: "In Progress",
          dependencies: 2
        }
      }
    ]
  };
  
  return mockItems[integrationType as keyof typeof mockItems] || [];
}

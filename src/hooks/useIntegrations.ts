
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Integration, IntegrationItem } from "@/types/integrations";

export function useIntegrations() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      name: "HubSpot",
      description: "Connect your HubSpot account to access contacts, deals, and more.",
      isConnected: false,
      icon: "https://cdn2.hubspot.net/hubfs/53/image8-2.jpg"
    },
    {
      name: "Notion",
      description: "Connect Notion to access your workspaces and documents.",
      isConnected: false,
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
    },
    {
      name: "Airtable",
      description: "Connect Airtable to access your bases and tables.",
      isConnected: false,
      icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png"
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<IntegrationItem[]>([]);

  useEffect(() => {
    // Check if any integrations are connected based on tokens in localStorage
    const updatedIntegrations = integrations.map(integration => {
      const token = localStorage.getItem(`${integration.name.toLowerCase()}_token`);
      return {
        ...integration,
        isConnected: !!token
      };
    });
    
    setIntegrations(updatedIntegrations);
    
    // Fetch auth URLs for integrations
    fetchAuthUrls();

    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const fetchAuthUrls = async () => {
    try {
      // For demo/testing purposes in development environment
      const mockAuthUrls = {
        hubspot: "https://app.hubspot.com/oauth/authorize?client_id=your-hubspot-client-id&redirect_uri=http://localhost:3000&scope=contacts+content+crm.objects.contacts.read+crm.objects.deals.read&state=hubspot-demo_user",
        notion: "https://api.notion.com/v1/oauth/authorize?client_id=your-notion-client-id&redirect_uri=http://localhost:3000&response_type=code&owner=user&state=notion-demo_user",
        airtable: "https://airtable.com/oauth2/v1/authorize?client_id=your-airtable-client-id&redirect_uri=http://localhost:3000&response_type=code&state=airtable-demo_user"
      };

      // Try to fetch from backend, fallback to mock for development
      let data;
      try {
        const response = await fetch('http://localhost:8000/auth-urls');
        if (!response.ok) {
          throw new Error('Backend not available');
        }
        data = await response.json();
        console.log("Successfully fetched auth URLs from backend:", data);
      } catch (error) {
        console.warn("Using mock auth URLs due to backend connection error:", error);
        data = mockAuthUrls;
      }
      
      const updatedIntegrations = integrations.map(integration => {
        const name = integration.name.toLowerCase();
        return {
          ...integration,
          authUrl: data[name] || '#'
        };
      });
      
      setIntegrations(updatedIntegrations);
    } catch (error) {
      console.error("Error setting up auth URLs:", error);
      toast({
        title: "Connection Error",
        description: "Failed to setup authentication. Using mock data for development.",
        variant: "destructive"
      });
    }
  };

  const fetchItems = async (integrationType: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem(`${integrationType}_token`);
      
      if (!token) {
        throw new Error(`No token available for ${integrationType}`);
      }
      
      // Mock data for development/testing
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

      let data;
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
        
        data = await response.json();
      } catch (backendError) {
        console.warn(`Using mock data for ${integrationType} due to backend error:`, backendError);
        // Fallback to mock data for development
        data = mockItems[integrationType as keyof typeof mockItems] || [];
      }
      
      setItems(data);
      toast({
        title: "Success",
        description: `Fetched ${data.length} items from ${integrationType}`,
      });
    } catch (error) {
      console.error(`Error fetching ${integrationType} items:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch items from ${integrationType}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (integration: Integration) => {
    if (integration.authUrl) {
      // For development/demo purposes, we'll simulate the auth flow
      // In production, you would redirect to the actual auth URL
      console.log(`Connecting to ${integration.name} with URL: ${integration.authUrl}`);
      
      // Actually redirect in production
      // window.location.href = integration.authUrl;
      
      // For demo, simulate successful authentication
      simulateSuccessfulAuth(integration.name.toLowerCase());
    } else {
      toast({
        title: "Connection Error",
        description: "Authentication URL not available. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  // Function to simulate successful authentication for demo purposes
  const simulateSuccessfulAuth = (integrationType: string) => {
    // Store a mock token
    const mockToken = `mock-${integrationType}-token-${Date.now()}`;
    localStorage.setItem(`${integrationType}_token`, mockToken);
    
    // Update the integration status
    const updatedIntegrations = integrations.map(integration => {
      if (integration.name.toLowerCase() === integrationType) {
        return { ...integration, isConnected: true };
      }
      return integration;
    });
    
    setIntegrations(updatedIntegrations);
    
    toast({
      title: "Connection Successful",
      description: `Successfully connected to ${integrationType.charAt(0).toUpperCase() + integrationType.slice(1)}!`,
    });
    
    // Automatically fetch items after successful connection
    fetchItems(integrationType);
  };

  const handleDisconnect = (integration: Integration) => {
    const integrationType = integration.name.toLowerCase();
    localStorage.removeItem(`${integrationType}_token`);
    
    const updatedIntegrations = integrations.map(i => {
      if (i.name === integration.name) {
        return { ...i, isConnected: false };
      }
      return i;
    });
    
    setIntegrations(updatedIntegrations);
    setItems([]);
    
    toast({
      title: "Disconnected",
      description: `Successfully disconnected from ${integration.name}.`,
    });
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);
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
      } catch (error) {
        console.warn("Backend connection failed, using mock authentication for development:", error);
        // For development, store a mock token
        localStorage.setItem(`${integrationType}_token`, `mock-token-${Date.now()}`);
      }
      
      // Update the integration status
      const updatedIntegrations = integrations.map(integration => {
        if (integration.name.toLowerCase() === integrationType) {
          return { ...integration, isConnected: true };
        }
        return integration;
      });
      
      setIntegrations(updatedIntegrations);
      
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${integrationType.charAt(0).toUpperCase() + integrationType.slice(1)}!`,
      });
      
      // Automatically fetch items after successful connection
      fetchItems(integrationType);
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to complete authentication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewItems = (integration: Integration) => {
    fetchItems(integration.name.toLowerCase());
  };

  return {
    integrations,
    isLoading,
    items,
    handleConnect,
    handleDisconnect,
    handleViewItems,
    handleOAuthCallback
  };
}

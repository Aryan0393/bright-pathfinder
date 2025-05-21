
import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

interface Integration {
  name: string;
  description: string;
  isConnected: boolean;
  icon: string;
  authUrl?: string;
}

const Index = () => {
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
  const [items, setItems] = useState<any[]>([]);

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
        notion: [],
        airtable: []
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

  const handleViewItems = (integration: Integration) => {
    fetchItems(integration.name.toLowerCase());
  };

  // Check if we have an auth code in the URL, which means we're returning from OAuth flow
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      // Handle the OAuth callback
      handleOAuthCallback(code, state);
      
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          VectorShift Integrations Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Connect and manage your third-party integrations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src={integration.icon} 
                    alt={`${integration.name} logo`} 
                    className="w-8 h-8 object-contain" 
                  />
                  <CardTitle>{integration.name}</CardTitle>
                </div>
                {integration.isConnected && (
                  <CheckCircle className="text-green-500 h-5 w-5" />
                )}
              </div>
              <CardDescription className="mt-2">
                {integration.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {integration.isConnected ? (
                  <>
                    <Button 
                      onClick={() => handleViewItems(integration)}
                      className="w-full"
                    >
                      View Items
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDisconnect(integration)}
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => handleConnect(integration)}
                    className="w-full"
                  >
                    Connect <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Integration Items</h2>
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default Index;

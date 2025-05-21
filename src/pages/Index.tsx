
import React, { useEffect } from "react";
import IntegrationCard from "@/components/IntegrationCard";
import ItemsDisplay from "@/components/ItemsDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useIntegrations } from "@/hooks/useIntegrations";

const Index = () => {
  const { 
    integrations, 
    isLoading, 
    items, 
    handleConnect, 
    handleDisconnect, 
    handleViewItems,
    handleOAuthCallback
  } = useIntegrations();

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
          <IntegrationCard 
            key={integration.name}
            integration={integration} 
            onConnect={handleConnect}
            onViewItems={handleViewItems}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>

      <ItemsDisplay items={items} />

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default Index;

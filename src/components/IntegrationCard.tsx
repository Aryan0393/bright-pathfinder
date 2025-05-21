
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Integration } from "@/types/integrations";

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integration: Integration) => void;
  onViewItems: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ 
  integration, 
  onConnect, 
  onViewItems, 
  onDisconnect 
}) => {
  return (
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
                onClick={() => onViewItems(integration)}
                className="w-full"
              >
                View Items
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onDisconnect(integration)}
                className="w-full"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => onConnect(integration)}
              className="w-full"
            >
              Connect <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;

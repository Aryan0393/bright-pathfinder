
export interface Integration {
  name: string;
  description: string;
  isConnected: boolean;
  icon: string;
  authUrl?: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  url: string;
  metadata: Record<string, any>;
}

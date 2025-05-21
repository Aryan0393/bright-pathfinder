
from typing import Dict, Any, Optional

class IntegrationItem:
    """
    Represents an integration item retrieved from external services like HubSpot, Notion, or Airtable.
    """
    
    def __init__(
        self,
        id: str,
        name: str,
        icon: str,
        description: str,
        type: str,
        created_at: str,
        created_by: str,
        updated_at: str,
        url: str,
        metadata: Dict[str, Any] = None
    ):
        self.id = id
        self.name = name
        self.icon = icon
        self.description = description
        self.type = type
        self.created_at = created_at
        self.created_by = created_by
        self.updated_at = updated_at
        self.url = url
        self.metadata = metadata or {}

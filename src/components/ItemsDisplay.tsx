
import React from "react";

interface ItemsDisplayProps {
  items: any[];
}

const ItemsDisplay: React.FC<ItemsDisplayProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
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
  );
};

export default ItemsDisplay;

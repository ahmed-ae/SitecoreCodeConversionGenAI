import React from "react";

interface CollapsibleMessageHistoryProps {
  messages: string[];
}

const CollapsibleMessageHistory: React.FC<CollapsibleMessageHistoryProps> = ({
  messages,
}) => {
  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div key={index} className="bg-gray-600 rounded p-2 text-sm">
          {message}
        </div>
      ))}
    </div>
  );
};

export default CollapsibleMessageHistory;

import React from "react";
import { X } from "lucide-react"; // Import the X icon from lucide-react

interface CollapsibleMessageHistoryProps {
  messages: string[];
  onDeleteMessage: (index: number) => void; // New prop for delete function
}

const CollapsibleMessageHistory: React.FC<CollapsibleMessageHistoryProps> = ({
  messages,
  onDeleteMessage,
}) => {
  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div
          key={index}
          className="bg-gray-600 rounded p-2 text-sm flex justify-between items-center"
        >
          <span>{message}</span>
          <button
            onClick={() => onDeleteMessage(index)}
            className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
            aria-label="Delete message"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CollapsibleMessageHistory;

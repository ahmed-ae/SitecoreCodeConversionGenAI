import React from "react";
import { X } from "lucide-react";

interface OutOfTriesModalProps {
  onClose: () => void;
}

const OutOfTriesModal: React.FC<OutOfTriesModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-gray-100 rounded-xl p-6 relative border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Limit Reached!</h2>
        <p className="mb-6">
          Sorry! but you ran out of free tries, You can still clone the{" "}
          <a
            href="https://github.com/ahmed-ae/SitecoreCodeConversionGenAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-400 transition duration-300"
          >
            open source repository
          </a>{" "}
          (For Free!) and use your own OpenAI/Claude API Key
        </p>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default OutOfTriesModal;

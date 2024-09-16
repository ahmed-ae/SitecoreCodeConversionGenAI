import React from "react";
import { X } from "lucide-react";

interface LoginPromptProps {
  onClose: () => void;
  onSignIn: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onClose, onSignIn }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-gray-100 rounded-xl p-6 relative border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="mb-6">To enforce usage quotas an account is required.</p>
        <button
          onClick={onSignIn}
          className="bg-red-400 text-gray-800 px-4 py-2 rounded-md hover:bg-red-300 transition duration-300"
        >
          Sign in with Google
        </button>
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

export default LoginPrompt;

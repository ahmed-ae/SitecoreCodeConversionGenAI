import React from "react";
import { X, ChevronDown } from "lucide-react";

interface SettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onSaveAndConvert: (e: React.FormEvent<Element>) => void;
  onModelChange: (value: string) => void;
  onSetCustomInstructions: (value: string) => void;
  customInstructions: string;
  model: string;
}

const SettingModal: React.FC<SettingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveAndConvert,
  onModelChange,
  onSetCustomInstructions,
  customInstructions,
  model,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-gray-100 rounded-xl w-full max-w-2xl p-6 relative border border-gray-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>
        <div className="mb-6 flex items-center space-x-4">
          <label
            htmlFor="model-select"
            className="text-gray-300 font-medium w-1/4"
          >
            Model:
          </label>
          <div className="relative w-3/4">
            <select
              id="model-select"
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#BE6420]"
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
            >
              <option value="claude3opus">Claude 3 Opus</option>
              <option value="claude3sonnet">Claude 3.5 Sonnet</option>
              <option value="gpt4">GPT-4 turbo</option>
              <option value="gpt4o">GPT-4 Omni</option>
              {/* <option value="gemini">Gemini 1.5 Pro</option> */}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <label
            htmlFor="customInstructions"
            className="text-gray-300 font-medium w-1/4 pt-2"
          >
            Custom Instructions:
          </label>
          <textarea
            id="customInstructions"
            value={customInstructions}
            onChange={(e) => onSetCustomInstructions(e.target.value)}
            className="w-3/4 h-40 px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#BE6420]"
            placeholder="Enter your custom instructions here..."
          />
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-100 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#BE6420] text-sm transition duration-300"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
          >
            Save
          </button>
          <button
            onClick={onSaveAndConvert}
            className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
          >
            Save and Convert
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingModal;

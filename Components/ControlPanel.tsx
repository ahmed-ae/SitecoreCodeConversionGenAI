import React from "react";
import { Settings } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

interface ControlPanelProps {
  language: string;
  onLanguageChange: (value: string) => void;
  onSettingsClick: () => void;
  onStopClick: () => void;
  onConvertClick: (e: React.FormEvent<Element>) => Promise<void>;
  isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  language,
  onLanguageChange,
  onSettingsClick,
  onStopClick,
  onConvertClick,
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center mb-6 space-y-4 sm:space-y-0">
      <div className="w-full sm:w-1/3 pr-0 sm:pr-2 mb-4 sm:mb-0">
        <LanguageSelector language={language} onChange={onLanguageChange} />
      </div>
      <div className="w-full sm:w-2/3 pl-0 sm:pl-2 flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          className="bg-gray-600 text-gray-100 px-4 py-2 rounded-md hover:bg-gray-500 transition duration-300 text-sm flex items-center justify-center"
          onClick={onSettingsClick}
        >
          <Settings className="mr-1" size={16} />
          Settings
        </button>
        <button
          className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
          onClick={onStopClick}
          disabled={!isLoading}
        >
          Stop
        </button>
        <button
          className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
          onClick={onConvertClick}
          disabled={isLoading}
        >
          {isLoading ? "Converting..." : "Convert"}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;

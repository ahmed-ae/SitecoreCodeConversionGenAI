import React from 'react';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  language: string;
  onChange: (value: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onChange }) => {
  return (
    <div className="relative">
      <select
        className="w-full bg-gray-700 text-gray-100 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#BE6420]"
        value={language}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="razor">ASP.NET MVC Razor</option>
        <option value="scriban">Sitecore SXA Scriban</option>
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={16}
      />
    </div>
  );
};

export default LanguageSelector;
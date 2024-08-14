import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-center mt-8 sm:mt-12 text-gray-400">
      <p className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <span className="hidden sm:inline">|</span>
        <a
          href="https://github.com/ahmed-ae/SitecoreCodeConversionGenAI"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:text-red-400 transition duration-300"
        >
          Github
        </a>
        <span className="hidden sm:inline">|</span>
      </p>
    </footer>
  );
};

export default Footer;
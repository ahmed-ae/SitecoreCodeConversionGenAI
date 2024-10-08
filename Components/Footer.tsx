import React from "react";
import { Github } from "lucide-react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="text-center mt-8 sm:mt-12 text-gray-400">
      <p className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Link
          href="/terms-of-use"
          className="text-red-400 hover:text-red-300 transition duration-300 text-sm sm:text-base font-semibold"
        >
          Terms of Use
        </Link>
        <span className="hidden sm:inline">|</span>
        <Link
          href="/privacy-policy"
          className="text-red-400 hover:text-red-300 transition duration-300 text-sm sm:text-base font-semibold"
        >
          Privacy Policy
        </Link>
        <span className="hidden sm:inline">|</span>

        <a
          href="https://github.com/ahmed-ae/SitecoreCodeConversionGenAI"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:text-red-400 transition duration-300"
        >
          <Github size={20} className="inline-block mr-2" />
        </a>
      </p>
    </footer>
  );
};

export default Footer;

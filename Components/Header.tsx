import React from "react";
import type { Session } from "next-auth";
import Navigation from "./Navigation";

interface HeaderProps {
  session: Session | null;
  maxTries: number;
  CountUsage: number;
  disableLoginAndMaxTries: boolean;
}

const Header: React.FC<HeaderProps> = ({
  session,
  maxTries,
  CountUsage,
  disableLoginAndMaxTries,
}) => {
  return (
    <header className="bg-gray-800 w-full py-2 px-3 sm:px-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className="h-6 sm:h-7"
          >
            {/* SVG content remains unchanged */}
          </svg>
          <h1 className="font-mono text-base px-4 sm:text-lg font-bold mr-2 sm:mr-3 relative">
            <span className="text-green-500">&gt;_</span>
            <span className="relative">
              <span className="relative z-10 text-white">Sitecore JSS V0</span>
              <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-red-500 opacity-75 transform translate-x-px -translate-y-px">
                  Sitecore JSS V0
                </span>
              </span>
            </span>
          </h1>
        </div>

        <Navigation session={session} />
      </div>
    </header>
  );
};

export default Header;
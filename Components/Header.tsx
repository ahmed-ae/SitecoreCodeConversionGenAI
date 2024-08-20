import React from "react";
import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

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
    <header className="bg-gray-800 w-full py-2 px-3 sm:px-4 flex flex-wrap items-center justify-between">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="h-6 sm:h-7"
        >
          <circle cx="100" cy="100" r="90" fill="#FF0000" />
          <path d="M100 30 A70 70 0 0 1 170 100 L100 100 Z" fill="#FFFFFF" />
          <path
            d="M170 100 A70 70 0 0 1 100 170 L100 100 Z"
            fill="#FFFFFF"
            opacity="0.7"
          />
          <path
            d="M100 170 A70 70 0 0 1 30 100 L100 100 Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
          <text
            x="100"
            y="105"
            fontFamily="Arial, sans-serif"
            fontSize="24"
            fill="#FF0000"
            textAnchor="middle"
          >
            &lt;/&gt;
          </text>
        </svg>
        <h1 className="text-base px-4 sm:text-lg font-semibold mr-2 sm:mr-3">
          Sitecore Code Conversion using GenAI
        </h1>
      </div>
      {!disableLoginAndMaxTries ? (
        <div className="flex items-center mt-2 sm:mt-0">
          {session ? (
            <>
              <span className="text-xs sm:text-sm mr-2">
                Hi, {session.user?.name}
              </span>
              <span className="text-xs sm:text-sm mr-2">
                ({maxTries - CountUsage} tries left)
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-400 text-gray-800 px-2 py-1 rounded-md hover:bg-red-300 transition duration-300 text-xs sm:text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-red-400 text-gray-800 px-2 py-1 rounded-md hover:bg-red-300 transition duration-300 text-xs sm:text-sm"
            >
              Sign in with Google
            </button>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </header>
  );
};

export default Header;
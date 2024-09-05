import React, { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/image", label: "Image To Code" },
  ];

  return (
    <header className="bg-gray-800 w-full py-2 px-3 sm:px-4">
      <div className="flex items-center justify-between flex-wrap">
        {/* Logo and title */}
        <div className="flex items-center flex-shrink-0">
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
          <h1 className="font-mono text-base px-4 sm:text-lg font-bold mr-2 sm:mr-3 relative">
            <span className="text-green-500">&gt;_</span>
            <span className="relative">
              <span className="relative z-10">Sitecore JSS V0</span>
              <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-red-500 opacity-75 transform translate-x-px -translate-y-px">
                  Sitecore JSS V0
                </span>
              </span>
              <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-blue-500 opacity-75 transform -translate-x-px translate-y-px">
                  Sitecore JSS V0
                </span>
              </span>
            </span>
            <span className="animate-pulse">|</span>
          </h1>
        </div>

        {/* Desktop Navigation and Login/Logout */}
        <div className="hidden sm:flex items-center justify-between flex-grow ml-4">
          <nav className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-red-400 transition duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!disableLoginAndMaxTries && (
            <div className="flex items-center">
              {session ? (
                <>
                  <span className="text-xs sm:text-sm text-white mr-2">
                    Hi, {session.user?.name}
                  </span>
                  <span className="text-xs sm:text-sm text-white mr-2">
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
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={toggleMenu}
          className="sm:hidden text-white focus:outline-none"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden mt-2">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-red-400 transition duration-300"
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {!disableLoginAndMaxTries && (
            <div className="mt-4">
              {session ? (
                <>
                  <span className="text-xs text-white block mb-2">
                    Hi, {session.user?.name}
                  </span>
                  <span className="text-xs text-white block mb-2">
                    ({maxTries - CountUsage} tries left)
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-400 text-gray-800 px-2 py-1 rounded-md hover:bg-red-300 transition duration-300 text-xs w-full"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="bg-red-400 text-gray-800 px-2 py-1 rounded-md hover:bg-red-300 transition duration-300 text-xs w-full"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

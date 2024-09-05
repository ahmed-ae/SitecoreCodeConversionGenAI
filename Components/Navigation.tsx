import React, { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface NavigationProps {
  session: Session | null;
}

const Navigation: React.FC<NavigationProps> = ({ session }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/image', label: 'Image converstion' },
  ];

  return (
    <>
      {/* Hamburger menu for mobile */}
      <div className="lg:hidden">
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation for desktop */}
      <nav className="hidden lg:flex space-x-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="text-white hover:text-gray-300">
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User authentication section for desktop */}
      <div className="hidden lg:block">
        {session ? (
              <button
              onClick={() => signOut()}
              className="bg-red-400 text-gray-800 px-2 py-1 rounded-md hover:bg-red-300 transition duration-300 text-xs sm:text-sm"
            >
              Sign out
            </button>
        ) : (
          <button
          onClick={() => signIn("google")}
          className="bg-red-400 text-gray-800 px-2 py-1 rounded-md hover:bg-red-300 transition duration-300 text-xs sm:text-sm"
        >
          Sign in with Google
        </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden mt-2">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-white hover:text-gray-300">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2">
            {session ? (
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
              >
                Sign Out
              </button>
            ) : (
              <button
              onClick={() => signIn("google")}
              className="bg-red-400 text-gray-800 px-2 py-1 rounded-md hover:bg-red-300 transition duration-300 text-xs sm:text-sm"
            >
              Sign in with Google
            </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
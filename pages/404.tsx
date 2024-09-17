import React from "react";
import Link from "next/link";
import Head from "next/head";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const Custom404: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white">
      <Head>
        <title>404 - Page Not Found | Sitecore JSS Copilot</title>
      </Head>
      <Header
        session={null}
        maxTries={0}
        CountUsage={0}
        disableLoginAndMaxTries={true}
      />
      <main className="flex-grow flex flex-col items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" className="mb-8">
          <rect x="40" y="40" width="120" height="140" rx="10" fill="#4B5563" />
          <rect x="50" y="50" width="100" height="80" rx="5" fill="#1F2937" />
          <text
            x="100"
            y="100"
            fontFamily="monospace"
            fontSize="24"
            fill="#EF4444"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            404
          </text>
          <line
            x1="70"
            y1="150"
            x2="130"
            y2="150"
            stroke="#9CA3AF"
            strokeWidth="4"
          />
          <circle cx="60" cy="170" r="10" fill="#EF4444" />
          <circle cx="140" cy="170" r="10" fill="#EF4444" />
          <path
            d="M80 140 Q100 160 120 140"
            stroke="#9CA3AF"
            strokeWidth="4"
            fill="none"
          />
        </svg>
        <h1 className="text-4xl font-bold mb-4">Oops! Page not found</h1>
        <p className="text-xl mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
        >
          Go back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Custom404;

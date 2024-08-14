import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useCompletion } from "ai/react";
import { parseCode } from "@/lib/util";
import { Settings, X, Code, ChevronDown } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

const SettingModal = ({
  isOpen,
  onClose,
  onSave,
  onSaveAndConvert,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onSaveAndConvert: () => void;
  children: React.ReactNode;
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
        {children}
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

const Stream = () => {
  const [language, setLanguage] = useState<string>("scriban");
  const [model, setModel] = useState<string>("claude3sonnet");
  const [sourceCode, setSourceCode] = useState<string>(
    "<!--paste your source code that you want to convert here -->"
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const { data: session } = useSession() as { data: Session | null };
  const [CountUsage, setCountUsage] = useState<number>(0);
  const [maxTries, setMaxTries] = useState<number>(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [showOutOfTriesModal, setShowOutOfTriesModal] = useState<boolean>(false);

  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/chat/Convert",
  });

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user preferences
      fetch(`/api/user/userPreferences?userId=${session.user.id}`)
        .then((response) => response.json())
        .then((data) => {
          setLanguage(data.language);
          setModel(data.model);
          setCustomInstructions(data.customInstructions);
          if (data.lastCodeUsed !== undefined && data.lastCodeUsed !== "") {
            setSourceCode(data.lastCodeUsed);
          }
          setCountUsage(data.CountUsage);
          setMaxTries(data.maxTries);
        });
    }
  }, [session]);

  const savePreferences = async () => {
    if (session?.user?.id) {
      await fetch("/api/user/userPreferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          language: language,
          model: model,
          customInstructions: customInstructions,
        }),
      });
    }
  };

  const updateUsageCount = async () => {
    var newCount = CountUsage + 1;
    setCountUsage(newCount);
    if (session?.user?.id) {
      await fetch("/api/user/usageCount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          lastCodeUsed: sourceCode,
          CountUsage: newCount,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setCountUsage(data.CountUsage);
        });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setSourceCode(value);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const convertCode = async () => {
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    if (maxTries - CountUsage <= 0) {
      setShowOutOfTriesModal(true);
      return;
    }
    try {
      const message = {
        language,
        sourceCode,
        model,
        customInstructions,
      };
      await complete(JSON.stringify(message));
      await updateUsageCount();
      closeModal();
    } catch (error) {
      console.error("Error converting code:", error);
      alert("Failed to convert code.");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch((err) => console.error("Error copying text to clipboard", err));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
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
      </header>
      <div className="container mx-auto py-6 sm:py-12 px-4 max-w-full w-full sm:w-[95%]">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
          <div className="flex flex-col sm:flex-row items-center mb-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/3 pr-0 sm:pr-2 mb-4 sm:mb-0">
              <div className="relative">
                <select
                  className="w-full bg-gray-700 text-gray-100 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#BE6420]"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="razor">ASP.NET MVC Razor</option>
                  <option value="scriban">Sitecore SXA Scriban</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>
            <div className="w-full sm:w-2/3 pl-0 sm:pl-2 flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                className="bg-gray-600 text-gray-100 px-4 py-2 rounded-md hover:bg-gray-500 transition duration-300 text-sm flex items-center justify-center"
                onClick={openModal}
              >
                <Settings className="mr-1" size={16} />
                Settings
              </button>
              <button
                className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
                onClick={stop}
                disabled={!isLoading}
              >
                Stop
              </button>
              <button
                // className="bg-teal-400 hover:bg-teal-300 text-gray-800 px-6 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
                className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
                onClick={convertCode}
                disabled={isLoading}
              >
                {isLoading ? "Converting..." : "Convert"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <MonacoEditor
                defaultLanguage={language === "scriban" ? "html" : language}
                value={sourceCode}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{ minimap: { enabled: false } }}
                className="h-[300px] sm:h-[600px] rounded-md border border-gray-700 overflow-hidden"
              />
            </div>
            <div className="relative">
              <MonacoEditor
                defaultLanguage="typescript"
                value={parseCode(completion)}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false } }}
                className="h-[300px] sm:h-[600px] rounded-md border border-gray-700 overflow-hidden"
              />
              <button
                className="absolute top-2 right-2 bg-gray-700 text-gray-100 px-3 py-1 rounded-md text-xs hover:bg-gray-600 transition duration-300"
                onClick={() => copyToClipboard(parseCode(completion))}
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="fixed top-0 left-0 w-full p-4 bg-red-600 text-white text-center errorBox">
            {error.message}
            <button
              className="absolute top-1 right-2 text-white"
              onClick={() => document.getElementById("errorBox")?.remove()}
            >
              ✕
            </button>
          </div>
        )}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-gray-100 rounded-xl p-6 relative border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="mb-6">Please log in to convert code.</p>
              <button
                onClick={() => signIn("google")}
                className="bg-red-400 text-gray-800 px-4 py-2 rounded-md hover:bg-red-300 transition duration-300"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
        {showOutOfTriesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-gray-100 rounded-xl p-6 relative border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Limit Reached!</h2>
              <p className="mb-6">
                Sorry! but you ran out of free tries, You can still clone the {' '}
                
                <a
                  href="https://github.com/ahmed-ae/SitecoreCodeConversionGenAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400 transition duration-300"
                >
                  open source repository
                </a>
                {' '}(For Free!) and use your own OpenAI/Claude API Key
              </p>

              <button
                onClick={() => setShowOutOfTriesModal(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
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
      </div>

      <SettingModal
        isOpen={showModal}
        onClose={closeModal}
        onSaveAndConvert={() => {
          savePreferences();
          convertCode();
          closeModal();
        }}
        onSave={() => {
          savePreferences();
          closeModal();
        }}
      >
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
              onChange={(e) => setModel(e.target.value)}
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
            onChange={(e) => setCustomInstructions(e.target.value)}
            className="w-3/4 h-40 px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#BE6420]"
            placeholder="Enter your custom instructions here..."
          />
        </div>
      </SettingModal>
    </div>
  );
};

export default Stream;

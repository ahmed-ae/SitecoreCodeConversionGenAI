import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useCompletion } from "ai/react";
import { parseCode } from "@/lib/util";
import { Settings, X,Code, ChevronDown   } from "lucide-react";

const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

const CustomModal = ({
  isOpen,
  onClose,
  onSave,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
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
            className="px-4 py-2 bg-[#BE6420] text-white rounded-md hover:bg-[#A85A1B] focus:outline-none focus:ring-2 focus:ring-[#BE6420] text-sm transition duration-300"
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

  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/chat/Convert",
  });

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setSourceCode(value);
    }
  };

  const handleCustomInstructionsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCustomInstructions(e.target.value);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const convertCode = async () => {
    try {
      const message = {
        language,
        sourceCode,
        model,
        customInstructions,
      };
      complete(JSON.stringify(message));
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
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="container mx-auto py-12 px-4 max-w-full w-[95%]">
        <header className="text-center mb-12">
          
          <h1 className="text-6xl font-bold mb-6 text-[#BE6420]">
            Sitecore Code Conversion Tool
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Harness the power of GenAI to transform your Sitecore development workflow
          </p>
        </header>

        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
          <div className="flex flex-wrap items-center mb-6 space-y-4 md:space-y-0">
            <div className="w-full md:w-1/3 pr-2">
              <div className="relative">
                <select
                  className="w-full bg-gray-700 text-gray-100 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#BE6420]"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="razor">ASP.NET MVC Razor</option>
                  <option value="scriban">Sitecore SXA Scriban</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div className="w-full md:w-2/3 pl-2 flex justify-end space-x-3">
              <button
                className="bg-gray-700 text-gray-100 px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 text-sm flex items-center"
                onClick={openModal}
              >
                <Settings className="mr-1" size={16} />
                Settings
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300 text-sm"
                onClick={stop}
                disabled={!isLoading}
              >
                Stop
              </button>
              <button
                className="bg-[#BE6420] hover:bg-[#A85A1B] text-white px-6 py-2 rounded-md transition duration-300 text-sm"
                onClick={convertCode}
                disabled={isLoading}
              >
                {isLoading ? "Converting..." : "Convert"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <MonacoEditor
                defaultLanguage={language === "scriban" ? "html" : language}
                defaultValue={sourceCode}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{ minimap: { enabled: false } }}
                className="h-[600px] rounded-md border border-gray-700 overflow-hidden"
              />
            </div>
            <div className="relative">
              <MonacoEditor
                defaultLanguage="typescript"
                value={parseCode(completion)}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false } }}
                className="h-[600px] rounded-md border border-gray-700 overflow-hidden"
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
          <div className="fixed top-0 left-0 w-full p-4 bg-red-600 text-white text-center">
            {error.message}
            <button
              className="absolute top-1 right-2 text-white"
              onClick={() => document.getElementById("errorBox")?.remove()}
            >
              ✕
            </button>
          </div>
        )}

        <footer className="text-center mt-12 text-gray-400">
          <p>
            Created by:{" "}
            <a
              href="https://github.com/ahmed-ae"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition duration-300"
            >
              Ahmed Okour
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/ahmed-ae/SitecoreCodeConversionGenAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition duration-300"
            >
              Github Repo
            </a>{" "}
            |{" "}
            <a
              href="https://twitter.com/aokour86"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition duration-300"
            >
              Twitter
            </a>
          </p>
        </footer>
      </div>

      <CustomModal isOpen={showModal} onClose={closeModal} onSave={convertCode}>
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
              <option value="claude3sonnet">Claude 3 Sonnet</option>
              <option value="gpt4">GPT-4 turbo</option>
              <option value="gpt4o">GPT-4 Omni</option>
              <option value="gemini">Gemini 1.5 Pro</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
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
      </CustomModal>
    </div>
  );
};

export default Stream;

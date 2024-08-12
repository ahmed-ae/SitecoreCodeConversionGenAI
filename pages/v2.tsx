import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useCompletion } from "ai/react";
import { parseCode } from "@/lib/util";
import { Settings, X } from "lucide-react";

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
      <div className="bg-[#2A2A2A] text-[#E0E0E0] rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#E0E0E0] hover:text-white focus:outline-none"
        >
          <X size={24} />
        </button>
        {children}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#383838] text-[#E0E0E0] rounded hover:bg-[#424242] focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[#9B8AFB] text-white rounded hover:bg-[#8B7FF8] focus:outline-none focus:ring-2 focus:ring-[#8B7FF8]"
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
    <div
      className="min-h-screen bg-[#1E1E1E] text-[#E0E0E0] font-sans"
      style={{ fontFamily: "'Söhne', sans-serif" }}
    >
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-[#FFFFFF]">
            Sitecore Code Conversion Tool
          </h1>
          <p className="text-xl text-[#B0B0B0] max-w-2x2 mx-auto">
            Use GenAI with different LLMs (GPT, Claude Opus/Sonnet, Gemini Pro)
            to convert your Sitecore SXA Scriban scripts or Sitecore MVC Razor
            files into Sitecore Jss Next components
          </p>
        </header>

        <div className="bg-[#2A2A2A] rounded-lg p-6 shadow-md border border-[#3A3A3A]">
          <div className="flex flex-wrap items-center mb-6 space-y-4 md:space-y-0">
            <div className="w-full md:w-1/3 pr-2">
              <label
                htmlFor="language-select"
                className="block mb-2 text-sm font-medium text-[#E0E0E0]"
              >
                Source Language:
              </label>
              <select
                id="language-select"
                className="w-full bg-[#383838] border border-[#4A4A4A] text-[#E0E0E0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="razor">ASP.NET MVC Razor</option>
                <option value="scriban">Sitecore SXA Scriban</option>
              </select>
            </div>
            <div className="w-full md:w-2/3 pl-2 flex justify-end space-x-2">
              <button
                className="bg-[#383838] text-[#E0E0E0] border border-[#4A4A4A] px-3 py-2 rounded hover:bg-[#424242] focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
                onClick={openModal}
              >
                <Settings className="inline-block mr-1" size={16} />
                Settings
              </button>
              <button
                className="bg-[#6B2B2D] hover:bg-[#7F3436] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FF7875]"
                onClick={stop}
                disabled={!isLoading}
              >
                Stop
              </button>
              <button
                className="bg-[#9B8AFB] hover:bg-[#8B7FF8] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8B7FF8]"
                onClick={convertCode}
                disabled={isLoading}
              >
                {isLoading ? "Converting..." : "Convert"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <MonacoEditor
                defaultLanguage={language === "scriban" ? "html" : language}
                defaultValue={sourceCode}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{ minimap: { enabled: false } }}
                className="h-[600px] rounded border border-[#4A4A4A]"
              />
            </div>
            <div className="relative">
              <MonacoEditor
                defaultLanguage="typescript"
                value={parseCode(completion)}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false } }}
                className="h-[600px] rounded border border-[#4A4A4A]"
              />
              <button
                className="absolute top-2 right-2 bg-[#383838] text-[#E0E0E0] border border-[#4A4A4A] px-3 py-1 rounded text-sm hover:bg-[#424242] focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
                onClick={() => copyToClipboard(parseCode(completion))}
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="fixed top-0 left-0 w-full p-4 bg-[#6B2B2D] text-white text-center">
            {error.message}
            <button
              className="absolute top-1 right-2 text-white"
              onClick={() => document.getElementById("errorBox")?.remove()}
            >
              ✕
            </button>
          </div>
        )}

        <footer className="text-center mt-8 text-[#B0B0B0]">
          Created by:{" "}
          <a
            href="https://github.com/ahmed-ae"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9B8AFB] hover:text-[#8B7FF8]"
          >
            Ahmed Okour
          </a>{" "}
          |{" "}
          <a
            href="https://github.com/ahmed-ae/SitecoreCodeConversionGenAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9B8AFB] hover:text-[#8B7FF8]"
          >
            Github Repo
          </a>{" "}
          |{" "}
          <a
            href="https://twitter.com/aokour86"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9B8AFB] hover:text-[#8B7FF8]"
          >
            Twitter
          </a>
        </footer>
      </div>

      <CustomModal isOpen={showModal} onClose={closeModal} onSave={convertCode}>
        <h2 className="text-2xl font-bold mb-6 text-[#FFFFFF]">Settings</h2>
        <div className="mb-6 flex items-center space-x-4">
          <label
            htmlFor="model-select"
            className="text-[#E0E0E0] font-medium w-1/4"
          >
            Model:
          </label>
          <select
            id="model-select"
            className="w-3/4 bg-[#383838] border border-[#4A4A4A] text-[#E0E0E0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="claude3opus">Claude 3 Opus</option>
            <option value="claude3sonnet">Claude 3 Sonnet</option>
            <option value="gpt4">GPT-4 turbo</option>
            <option value="gpt4o">GPT-4 Omni</option>
            <option value="gemini">Gemini 1.5 Pro</option>
          </select>
        </div>
        <div className="flex items-start space-x-4">
          <label
            htmlFor="customInstructions"
            className="text-[#E0E0E0] font-medium w-1/4 pt-2"
          >
            Custom Instructions:
          </label>
          <textarea
            id="customInstructions"
            value={customInstructions}
            onChange={handleCustomInstructionsChange}
            className="w-3/4 h-40 px-3 py-2 text-[#E0E0E0] bg-[#383838] border border-[#4A4A4A] rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
            placeholder="Enter your custom instructions here..."
          />
        </div>
      </CustomModal>
    </div>
  );
};

export default Stream;

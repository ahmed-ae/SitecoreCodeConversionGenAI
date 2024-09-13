"use client";
import React, { useEffect, useState, useRef } from "react";
import {  useCompletion } from "ai/react";
import { extractCodeSection } from "@/lib/util";
import {  
  X,
  MessageCircle,
  Upload,
  Send,
  Maximize2,
  LayoutTemplate,
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Header from "@/Components/Header";
import SettingModal from "@/Components/SettingModal";
import Footer from "@/Components/Footer";
import CodeEditor from "@/Components/CodeEditor";
import ControlPanel from "@/Components/ControlPanel";
import LoginPrompt from "@/Components/LoginPrompt";
import OutOfTriesModal from "@/Components/OutOfTriesModal";
import CollapsibleMessageHistory from "@/Components/CollapsibleMessageHistory";
import {
  savePreferences,
  updateUsageCount,
  getPreferences,
  UserPreferences,
} from "../services/userPreferences.ts";
import CodePreview from "@/Components/preview";

import posthog from "posthog-js";
import ImageUpload from '@/Components/ImageUpload';

const Stream = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "typescript",
    model: "claude3sonnet",
    customInstructions: "",
    lastCodeUsed: "",
    CountUsage: 0,
    maxTries: 0,
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const { data: session } = useSession() as { data: Session | null };
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [showOutOfTriesModal, setShowOutOfTriesModal] =
    useState<boolean>(false);
  const disableLoginAndMaxTries =
    process.env.NEXT_PUBLIC_DISABLE_LOGIN_AND_MAX_TRIES === "true";
  const [file, setFile] = useState<File | null>(null);
  const [additionalInstructions, setAdditionalInstructions] =
    useState<string>("");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  const [isMessageHistoryOpen, setIsMessageHistoryOpen] = useState(false);
  const [suggestions] = useState<string[]>([
    "Use styled components instead of tailwind",
    "Use CSS modules instead of tailwind",
  ]);
  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/image/Convert",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);

  const [cssModule, setCssModule] = useState("");
  const [cssModuleFilename, setCssModuleFilename] = useState(
    "component.module.css"
  );
  const [firstComponent, setFirstComponent] = useState("");
  const [firstComponentFilename, setFirstComponentFilename] =
    useState("Component.tsx");
  const [secondComponent, setSecondComponent] = useState("");
  const [secondComponentFilename, setSecondComponentFilename] = useState(
    "SitecoreComponent.tsx"
  );
  const [activeTab, setActiveTab] = useState<string>("Component.tsx");
  const [previouslyGeneratedCode, setPreviouslyGeneratedCode] =
    useState<string>("");
  useEffect(() => {
    const loadPreferences = async () => {
      const loadedPreferences = await getPreferences(session);
      setPreferences((prevPreferences) => ({
        ...prevPreferences,
        ...loadedPreferences,
      }));
    };

    loadPreferences();
  }, [session?.user?.id]); // Only depend on the user ID

  useEffect(() => {
    if (completion) {
      const cssModuleSection = extractCodeSection(completion, "css module");
      const firstComponentSection = extractCodeSection(
        completion,
        "first component"
      );
      const secondComponentSection = extractCodeSection(
        completion,
        "second component"
      );

      setCssModule(cssModuleSection.content);
      setCssModuleFilename(cssModuleSection.filename);
      setFirstComponent(firstComponentSection.content);
      setFirstComponentFilename(firstComponentSection.filename);
      setSecondComponent(secondComponentSection.content);
      setSecondComponentFilename(secondComponentSection.filename);
    }
  }, [completion]);

  useEffect(() => {
    if (!isLoading) {
      setPreviouslyGeneratedCode(completion);
    }
  }, [isLoading]);

  const closeModal = () => setShowModal(false);

  const handleConvertImage = async (e: React.FormEvent<Element>) => {
    e.preventDefault();
    if (!session && !disableLoginAndMaxTries) {
      setShowLoginPrompt(true);
      return;
    }
    if (
      !disableLoginAndMaxTries &&
      preferences.maxTries - preferences.CountUsage <= 0
    ) {
      setShowOutOfTriesModal(true);
      return;
    }
    if (!file) {
      alert("Please upload an image first.");
      return;
    }
    try {
      setActiveTab("Component.tsx");
      // Add the message to history and clear the input
      if (additionalInstructions.trim() !== "") {
        setMessageHistory((prev) => [...prev, additionalInstructions]);
      }
      const allInstructions = [...messageHistory, additionalInstructions].join(
        " , "
      );
      setAdditionalInstructions("");
      const message = {
        model: preferences.model,
        customInstructions: preferences.customInstructions,
        additionalInstructions: additionalInstructions,
        messageHistory: messageHistory,
        previouslyGeneratedCode: previouslyGeneratedCode,
      };

      const base64Files = await convertToBase64(file);
      await complete(JSON.stringify(message), { body: { image: base64Files } });
      posthog.capture("Converting Image", { userId: session?.user?.email });
      const newCount = await updateUsageCount(
        session,
        preferences.lastCodeUsed,
        preferences.CountUsage
      );
      setPreferences((prev) => ({ ...prev, CountUsage: newCount }));

      closeModal();
    } catch (error) {
      console.error("Error converting image:", error);
      alert("Failed to convert image.");
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (file: File) => {
    setFile(file);
    setAdditionalInstructions("");
    setMessageHistory([]);
    setPreviouslyGeneratedCode("");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch((err) => console.error("Error copying text to clipboard", err));
  };
  const handleSavePreferences = async () => {
    await savePreferences(session, preferences);
    closeModal();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAdditionalInstructions(suggestion);
  };
  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConvertImage(e);
    }
  };

  // Add this new function to handle message deletion
  const handleDeleteMessage = (index: number) => {
    setMessageHistory((prevHistory) =>
      prevHistory.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <div>
        <Header
          CountUsage={preferences.CountUsage}
          maxTries={preferences.maxTries}
          session={session}
          disableLoginAndMaxTries={disableLoginAndMaxTries}
        />
      </div>
      <div className="container mx-auto py-6 sm:py-12 px-4 max-w-full w-full sm:w-[95%]">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
          <ControlPanel
            onLanguageChange={(lang) =>
              setPreferences((prev) => ({ ...prev, language: lang }))
            }
            onSettingsClick={() => setShowModal(true)}
            onConvertClick={handleConvertImage}
            onStopClick={stop}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Left side - Image upload (33%) */}
            <div className="flex flex-col h-full">
              <ImageUpload onFileChange={handleFileChange} />
            </div>

            {/* Right side - Code editors, suggestions, and input (67%) */}
            <div className="sm:col-span-2">
              <div className="mb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700">
                  <div className="flex flex-wrap gap-1 mb-0 sm:mb-0">
                    {cssModule && (
                      <button
                        className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 border-t border-l border-r border-dotted ${
                          activeTab === "component.module.css"
                            ? "bg-gray-700 text-white border-gray-500"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-gray-600"
                        }`}
                        onClick={() => setActiveTab("component.module.css")}
                      >
                        {cssModuleFilename}
                      </button>
                    )}
                    <button
                      className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 border-t border-l border-r border-dotted ${
                        activeTab === "Component.tsx"
                          ? "bg-gray-700 text-white border-gray-500"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-gray-600"
                      }`}
                      onClick={() => setActiveTab("Component.tsx")}
                    >
                      {firstComponentFilename}
                    </button>
                    {secondComponent && (
                      <button
                        className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 border-t border-l border-r border-dotted ${
                          activeTab === "SitecoreComponent.tsx"
                            ? "bg-gray-700 text-white border-gray-500"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-gray-600"
                        }`}
                        onClick={() => setActiveTab("SitecoreComponent.tsx")}
                      >
                        {secondComponentFilename}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPreview(true)}
                    className={`px-3 py-1.5 rounded-md sm:rounded-t-md text-xs font-medium transition-colors duration-200 border border-gray-600 inline-flex items-center space-x-1 mt-0 sm:-mt-1.5 ${
                      isLoading || !completion
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    }`}
                    disabled={isLoading || !completion}
                  >
                    <LayoutTemplate size={14} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
              {/* Code editors */}
              <div className="mb-4">
                {activeTab === "component.module.css" && cssModule && (
                  <CodeEditor
                    language="css"
                    value={cssModule}
                    readOnly={true}
                    onCopy={() => copyToClipboard(cssModule)}
                    enableDownload={true}
                    filename={cssModuleFilename}
                  />
                )}
                {activeTab === "Component.tsx" && (
                  <CodeEditor
                    language="typescript"
                    value={firstComponent}
                    readOnly={true}
                    onCopy={() => copyToClipboard(firstComponent)}
                    enableDownload={true}
                    filename={firstComponentFilename}
                  />
                )}
                {activeTab === "SitecoreComponent.tsx" && secondComponent && (
                  <CodeEditor
                    language="typescript"
                    value={secondComponent}
                    readOnly={true}
                    onCopy={() => copyToClipboard(secondComponent)}
                    enableDownload={true}
                    filename={secondComponentFilename}
                  />
                )}
              </div>

              {/* Suggestion bubbles */}
              <div className="flex flex-wrap gap-2 mb-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-full text-sm transition duration-300 flex items-center justify-center min-h-[40px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Input for additional instructions */}
              <div className="relative">
                <textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  onKeyPress={handleInputKeyPress}
                  name="additionalInstructions"
                  className="bg-gray-700 text-gray-100 rounded-md px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 pr-20 resize-none"
                  placeholder="How would you like to customize the code?"
                  rows={2}
                />
                <button
                  onClick={handleConvertImage}
                  className="absolute right-10 top-3 text-gray-400 hover:text-gray-200"
                >
                  <Send size={20} />
                </button>
                {messageHistory.length > 0 && (
                  <button
                    onClick={() => setIsMessageHistoryOpen(true)}
                    className="absolute right-2 top-3 text-gray-400 hover:text-gray-200"
                  >
                    <MessageCircle size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            id="errorBox"
            className="fixed bottom-0 left-0 w-full p-4 bg-red-400 text-white text-center errorBox"
          >
            {error.message}
            <button className="absolute top-1 right-2 text-white"></button>
          </div>
        )}
        {showLoginPrompt && (
          <LoginPrompt
            onClose={() => setShowLoginPrompt(false)}
            onSignIn={() => signIn("google")}
          />
        )}
        {showOutOfTriesModal && (
          <OutOfTriesModal
            onClose={() => setShowOutOfTriesModal(false)}
          ></OutOfTriesModal>
        )}
        <Footer></Footer>
      </div>

      {showPreview && (
        <div
          className={`fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 ${
            isFullscreen ? "" : "p-4"
          }`}
        >
          <div
            className={`bg-gray-800 rounded-lg ${
              isFullscreen ? "w-full h-full" : "w-11/12 h-5/6"
            } overflow-hidden flex flex-col`}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Preview (Beta)</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <Maximize2 size={24} />
                </button>{" "}
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-hidden">
              <CodePreview code={firstComponent} cssModule={cssModule} />
            </div>
          </div>
        </div>
      )}

      {isMessageHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Previous Instructions</h2>
              <button
                onClick={() => setIsMessageHistoryOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <CollapsibleMessageHistory
              messages={messageHistory}
              onDeleteMessage={handleDeleteMessage}
            />
          </div>
        </div>
      )}

      <SettingModal
        isOpen={showModal}
        onClose={closeModal}
        onSaveAndConvert={(e: React.FormEvent<Element>) => {
          handleSavePreferences();
          handleConvertImage(e);
          closeModal();
        }}
        onSave={() => {
          handleSavePreferences();
          closeModal();
        }}
        onModelChange={(value) =>
          setPreferences((prev) => ({ ...prev, model: value }))
        }
        onSetCustomInstructions={(value) =>
          setPreferences((prev) => ({ ...prev, customInstructions: value }))
        }
        customInstructions={preferences.customInstructions}
        model={preferences.model}
      ></SettingModal>
    </div>
  );
};

export default Stream;

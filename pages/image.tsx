"use client";
import React, { useEffect, useState, useRef } from "react";
import { useChat, useCompletion } from "ai/react";
import { parseCode, parseCodeForPreview, extractCodeSection } from "@/lib/util";
import {
  Settings,
  X,
  Code,
  ChevronUp,
  ChevronDown,
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
import imageCompression from "browser-image-compression";

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
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const { data: session } = useSession() as { data: Session | null };
  const [CountUsage, setCountUsage] = useState<number>(0);
  const [maxTries, setMaxTries] = useState<number>(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showOutOfTriesModal, setShowOutOfTriesModal] =
    useState<boolean>(false);
  const disableLoginAndMaxTries =
    process.env.NEXT_PUBLIC_DISABLE_LOGIN_AND_MAX_TRIES === "true";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [additionalInstructions, setAdditionalInstructions] =
    useState<string>("");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  const [isMessageHistoryOpen, setIsMessageHistoryOpen] = useState(false);
  const [suggestions] = useState<string[]>([
    "Use styled components instead of tailwind",
  ]);
  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/image/Convert",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    const loadPreferences = async () => {
      const loadedPreferences = await getPreferences(session);
      setPreferences((prevPreferences) => ({
        ...prevPreferences,
        ...loadedPreferences,
      }));
    };

    loadPreferences();
  }, [session]);

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

  const closeModal = () => setShowModal(false);

  const handleConvertImage = async (e: React.FormEvent<Element>) => {
    e.preventDefault();
    if (!session && !disableLoginAndMaxTries) {
      setShowLoginPrompt(true);
      return;
    }
    if (!disableLoginAndMaxTries && maxTries - CountUsage <= 0) {
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
        additionalInstructions: allInstructions,
      };

      const base64Files = await convertToBase64(file);
      await complete(JSON.stringify(message), { body: { image: base64Files } });

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

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Error compressing image:", error);
      return file; // Return original file if compression fails
    }
  };

  const processFile = async (file: File) => {
    const compressedFile = await compressImage(file);
    setFile(compressedFile);
    setAdditionalInstructions("");
    setMessageHistory([]);
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(compressedFile);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          await processFile(file);
        }
        break;
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
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
  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col h-full">
              {/* Image upload area */}
              <div
                className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 mb-4"
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                tabIndex={0}
              >
                <p className="mt-6 text-sm text-gray-400 text-center">
                  Upload an image/wireframe/screenshot for your component design
                  to convert it into Sitecore JSS (Nextjs) component.
                </p>
                {imagePreview ? (
                  <div className="mb-4 flex-grow flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-[calc(100%-2rem)] rounded-lg"
                    />
                  </div>
                ) : (
                  <Upload className="w-24 h-24 text-gray-400 mb-8" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                  ref={fileInputRef}
                />
                <label
                  htmlFor="image-upload"
                  className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
                >
                  {file ? "Change Image" : "Upload Image"}
                </label>
                {file && (
                  <p className="mt-4 text-sm text-gray-400">{file.name}</p>
                )}
                <p className="mt-6 text-sm text-gray-400 text-center">
                  Or <b>drag / paste</b> an image here.
                </p>
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
              <div className="relative mb-4">
                <input
                  type="text"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  onKeyPress={handleInputKeyPress}
                  name="additionalInstructions"
                  className="bg-gray-700 text-gray-100 rounded-md px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 pr-20"
                  placeholder="How would you like to customize the code?"
                />
                <button
                  onClick={handleConvertImage}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  <Send size={20} />
                </button>
                {messageHistory.length > 0 && (
                  <button
                    onClick={() => setIsMessageHistoryOpen(true)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    <MessageCircle size={20} />
                  </button>
                )}
              </div>

              {/* Popup Message History Overlay */}
              {isMessageHistoryOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">
                        Previous Instructions
                      </h2>
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
            </div>

            <div className="relative">
              <div className="mb-4">
                <div className="flex justify-between items-center border-b border-gray-700">
                  <div className="flex gap-1">
                    {cssModule && (
                      <button
                        className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 ${
                          activeTab === "component.module.css"
                            ? "bg-gray-700 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("component.module.css")}
                      >
                        {cssModuleFilename}
                      </button>
                    )}
                    <button
                      className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 ${
                        activeTab === "Component.tsx"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("Component.tsx")}
                    >
                      {firstComponentFilename}
                    </button>
                    {secondComponent && (
                      <button
                        className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 ${
                          activeTab === "SitecoreComponent.tsx"
                            ? "bg-gray-700 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("SitecoreComponent.tsx")}
                      >
                        {secondComponentFilename}
                      </button>
                    )}
                  </div>
                  {!isLoading && completion && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-t-md text-xs font-medium transition-colors duration-200 border border-gray-600 inline-flex items-center space-x-1"
                    >
                      <LayoutTemplate size={14} />
                      <span>Preview</span>
                    </button>
                  )}
                </div>
              </div>
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

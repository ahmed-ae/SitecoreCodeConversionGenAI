"use client";
import React, { useEffect, useState, useRef } from "react";
import { useCompletion } from "ai/react";
import { extractCodeSection } from "@/lib/util";
import {
  X,
  MessageCircle,
  Send,
  Maximize2,
  LayoutTemplate,
  ChevronDown,
  HelpCircle,
  FileJson,
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
import CodePreview from "@/Components/previewV2";
import posthog from "posthog-js";
import ImageUpload from "@/Components/ImageUpload";
import Head from "next/head";

// Add this function at the top of your file, outside of the Stream component
function minimizeJSON(json: string): string {
  return JSON.stringify(JSON.parse(json));
}

const Stream = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "typescript",
    model: "claude3sonnet",
    customInstructions: "",
    lastCodeUsed: "",
    CountUsage: 0,
    maxTries: 0,
    framework: "nextjs",
    styling: "tailwind",
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
  const [showTooltip1, setShowTooltip1] = useState(false);
  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/design/Convert",
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
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [fileType, setFileType] = useState<"image" | "json" | null>(null);

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

  useEffect(() => {
    if (completion && !isLoading) {
      setIsPreviewReady(true);
      const timer = setTimeout(() => setIsPreviewReady(false), 1000); // Stop flashing after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [completion, isLoading]);

  const closeModal = () => setShowModal(false);

  const handleConvertFile = async (e: React.FormEvent<Element>) => {
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
      alert("Please upload an image or JSON file first.");
      return;
    }
    try {
      setActiveTab("Component.tsx");
      if (additionalInstructions.trim() !== "") {
        setMessageHistory((prev) => [...prev, additionalInstructions]);
      }
      setAdditionalInstructions("");
      const message = {
        model: preferences.model,
        customInstructions: preferences.customInstructions,
        additionalInstructions: additionalInstructions,
        messageHistory: messageHistory,
        framework: preferences.framework,
        styling: preferences.styling,
        fileType: fileType,
        previouslyGeneratedCode: previouslyGeneratedCode,
      };

      if (fileType === "json") {
        const jsonContent = await file.text();
        const minimizedJSON = minimizeJSON(jsonContent);
        await complete(JSON.stringify(message), {
          body: { json: minimizedJSON },
        });
      } else {
        const base64Files = await convertToBase64(file);
        await complete(JSON.stringify(message), {
          body: { image: base64Files },
        });
      }

      posthog.capture("Converting File", {
        userId: session?.user?.email,
        fileType,
      });
      const newCount = await updateUsageCount(
        session,
        preferences.lastCodeUsed,
        preferences.CountUsage,
        preferences.framework,
        preferences.styling
      );
      setPreferences((prev) => ({ ...prev, CountUsage: newCount }));

      closeModal();
    } catch (error) {
      console.error("Error converting file:", error);
      alert("Failed to convert file.");
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
    setFileType(file.type === "application/json" ? "json" : "image");
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

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConvertFile(e);
    }
  };

  // Add this new function to handle message deletion
  const handleDeleteMessage = (index: number) => {
    setMessageHistory((prevHistory) =>
      prevHistory.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <Head>
        <title>
          Sitecore JSS Copilot | Code generation and conversion tool
        </title>
      </Head>
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
              onConvertClick={handleConvertFile}
              onStopClick={stop}
              isLoading={isLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Left side - File upload (33%) */}
              <div className="flex flex-col h-full">
                <ImageUpload onFileChange={handleFileChange} />
              </div>

              {/* Right side - Code editors, suggestions, and input (67%) */}
              <div className="sm:col-span-2">
                <div className="mb-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex flex-wrap gap-1 mb-0">
                      {cssModule && (
                        <button
                          className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 border-t border-l border-r ${
                            activeTab === "component.module.css"
                              ? "bg-gray-700 text-white border-gray-500 border-b-2 border-b-[#F87171]"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-gray-600"
                          }`}
                          onClick={() => setActiveTab("component.module.css")}
                        >
                          {cssModuleFilename}
                        </button>
                      )}
                      <button
                        className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 border-t border-l border-r ${
                          activeTab === "Component.tsx"
                            ? "bg-gray-700 text-white border-gray-500 border-b-2 border-b-[#F87171]"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-gray-600"
                        }`}
                        onClick={() => setActiveTab("Component.tsx")}
                      >
                        {firstComponentFilename}
                      </button>
                      {secondComponent && (
                        <button
                          className={`px-3 py-1.5 font-medium text-xs rounded-t-md transition-colors duration-200 border-t border-l border-r ${
                            activeTab === "SitecoreComponent.tsx"
                              ? "bg-gray-700 text-white border-gray-500 border-b-2 border-b-[#F87171]"
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
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 border border-gray-600 inline-flex items-center space-x-1 mt-1 sm:mt-0 ${
                        isLoading || !completion
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      } ${isLoading ? "animate-pulse" : ""} ${
                        isPreviewReady ? "animate-flash" : ""
                      }`}
                      disabled={isLoading || !completion}
                    >
                      <LayoutTemplate size={14} />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
                {/* Code editors */}
                <div className="bg-gray-700 border border-gray-500 rounded-b-md">
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
                {/* Code Settings */}
                <div className="bg-gray-800 rounded-lg p-2 mb-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <label
                        htmlFor="framework"
                        className="text-gray-300 text-xs font-medium block mb-0.5 flex items-center"
                      >
                        Framework
                        <span
                          className="ml-0.5 relative"
                          onMouseEnter={() => setShowTooltip1(true)}
                          onMouseLeave={() => setShowTooltip1(false)}
                        >
                          <HelpCircle
                            size={12}
                            className="text-gray-400 cursor-help"
                          />
                          {showTooltip1 && (
                            <span
                              style={{
                                position: "absolute",
                                left: "50%",
                                bottom: "100%",
                                transform: "translateX(-50%)",
                                marginBottom: "3px",
                                padding: "6px",
                                backgroundColor: "#4a5568",
                                color: "#e2e8f0",
                                fontSize: "0.65rem",
                                borderRadius: "3px",
                                width: "180px",
                                textAlign: "center",
                                zIndex: 10,
                              }}
                            >
                              Select which flavor of Sitecore JSS you want for
                              your code. Currently supporting Next.js, other
                              options coming soon.
                            </span>
                          )}
                        </span>
                      </label>
                      <select
                        id="framework"
                        className="w-full bg-gray-700  text-gray-100 rounded-md px-2 py-1 text-s appearance-none focus:outline-none focus:ring-1 focus:ring-[#BE6420] pr-6"
                        value={preferences.framework}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            framework: e.target.value,
                          }))
                        }
                      >
                        <option value="nextjs">JSS/Next.js</option>
                      </select>
                      <ChevronDown
                        className="absolute right-1.5 top-1/2 transform translate-y-1/2 text-gray-400 pointer-events-none"
                        size={12}
                      />
                    </div>
                    <div className="relative">
                      <label
                        htmlFor="styling"
                        className="text-gray-300 text-xs font-medium block mb-0.5"
                      >
                        Styling
                      </label>
                      <select
                        id="styling"
                        className="w-full bg-gray-700  text-gray-100 rounded-md px-2 py-1 text-s appearance-none focus:outline-none focus:ring-1 focus:ring-[#BE6420] pr-6"
                        value={preferences.styling}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            styling: e.target.value,
                          }))
                        }
                      >
                        <option value="tailwind">Tailwind</option>
                        <option value="css-modules">CSS Modules</option>
                        <option value="styled-components">
                          Styled Components
                        </option>
                      </select>
                      <ChevronDown
                        className="absolute right-1.5 top-1/2 transform translate-y-1/2 text-gray-400 pointer-events-none"
                        size={12}
                      />
                    </div>
                  </div>
                </div>
                {/* Input for additional instructions */}
                <div className="relative">
                  <textarea
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    onKeyPress={handleInputKeyPress}
                    name="additionalInstructions"
                    className="bg-gray-700 text-gray-100 rounded-md px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 pr-20 resize-none h-20"
                    placeholder="How would you like to customize the code?"
                    style={{ verticalAlign: "top" }}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center">
                    {messageHistory.length > 0 && (
                      <>
                        <button
                          onClick={() => setIsMessageHistoryOpen(true)}
                          className="text-gray-400 hover:text-gray-200 p-1 mr-1"
                        >
                          <MessageCircle size={20} />
                        </button>
                        <span className="text-gray-400 text-xl font-light mx-1">
                          |
                        </span>
                      </>
                    )}
                    <button
                      onClick={handleConvertFile}
                      className="text-gray-400 hover:text-gray-200 p-1 ml-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400"></div>
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
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
            handleConvertFile(e);
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
    </>
  );
};

export default Stream;

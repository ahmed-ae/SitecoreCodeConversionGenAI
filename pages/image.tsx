"use client";
import React, { useEffect, useState, useRef } from "react";
import { useChat, useCompletion } from "ai/react";
import { parseCode } from "@/lib/util";
import {
  Settings,
  X,
  Code,
  ChevronUp,
  ChevronDown,
  Upload,
  Send,
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/image/Convert",
  });

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
      const allInstructions = [...messageHistory, additionalInstructions].join(
        " "
      );

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

      // Add the message to history and clear the input
      if (additionalInstructions.trim() !== "") {
        setMessageHistory((prev) => [...prev, additionalInstructions]);
        setAdditionalInstructions("");
      }
      closeModal();
    } catch (error) {
      console.error("Error converting image:", error);
      alert("Failed to convert image.");
    }
  };
  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConvertImage(e);
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

  const processFile = (file: File) => {
    setFile(file);
    setAdditionalInstructions("");
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
        }
        break;
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      setAdditionalInstructions("");
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
              {/* Input for additional instructions */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  onKeyPress={handleInputKeyPress}
                  name="additionalInstructions"
                  className="bg-gray-700 text-gray-100 rounded-md px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="How would you like to customize the code?"
                />
                <button
                  onClick={handleConvertImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  <Send size={20} />
                </button>
              </div>
              {/* Collapsible Message History */}
              <div className="relative">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="w-full bg-gray-700 text-gray-100 px-4 py-2 rounded-md flex items-center justify-between"
                >
                  <span>Previous Instructions</span>
                  {isHistoryOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                {isHistoryOpen && (
                  <div className="mt-2 bg-gray-700 rounded-md p-4 max-h-60 overflow-y-auto">
                    <CollapsibleMessageHistory messages={messageHistory} />
                  </div>
                )}
              </div>
            </div>

            <CodeEditor
              language="typescript"
              value={parseCode(completion)}
              readOnly={true}
              onCopy={() => copyToClipboard(parseCode(completion))}
            />
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

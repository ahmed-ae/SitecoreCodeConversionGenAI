"use client";
import React, { useEffect, useState, useRef } from "react";
import { useChat } from "ai/react";
import { parseCode } from "@/lib/util";
import { Settings, X, Code, ChevronDown, Upload } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Header from "@/Components/Header";
import SettingModal from "@/Components/SettingModal";
import Footer from "@/Components/Footer";
import CodeEditor from "@/Components/CodeEditor";
import ControlPanel from "@/Components/ControlPanel";
import LoginPrompt from "@/Components/LoginPrompt";
import OutOfTriesModal from "@/Components/OutOfTriesModal";

const Stream = () => {
  const [language, setLanguage] = useState<string>("typescript");
  const [model, setModel] = useState<string>("claude3sonnet");

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
  const [files, setFiles] = useState<FileList | null>(null);
  const {
    messages,
    stop,
    handleSubmit,
    isLoading,
    setInput,
    error,
    handleInputChange,
    input,
  } = useChat({
    api: "/api/image/Convert",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("Explain this picture");
    if (session?.user?.id) {
      // Fetch user preferences from API
      fetch(`/api/user/userPreferences?userId=${session.user.id}`)
        .then((response) => response.json())
        .then((data) => {
          setLanguage(data.language);
          setModel(data.model);
          setCustomInstructions(data.customInstructions);
          setCountUsage(data.CountUsage);
          setMaxTries(data.maxTries);
        });
    } else {
      // Load preferences from local storage if user is not logged in
      const storedPreferences = localStorage.getItem("userPreferences");
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        if (preferences.language) setLanguage(preferences.language);
        if (preferences.model) setModel(preferences.model);
        if (preferences.customInstructions)
          setCustomInstructions(preferences.customInstructions);
      }
    }
  }, [session]);

  const savePreferences = async () => {
    if (session?.user?.id) {
      // Save preferences to API if user is logged in
      await fetch("/api/user/userPreferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          language,
          model,
          customInstructions,
        }),
      });
    } else {
      // Save preferences to local storage if user is not logged in
      const preferences = { language, model, customInstructions };
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
    }
  };

  const updateUsageCount = async () => {
    const newCount = CountUsage + 1;
    setCountUsage(newCount);
    if (session?.user?.id) {
      await fetch("/api/user/usageCount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          CountUsage: newCount,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setCountUsage(data.CountUsage);
        });
    }
  };

  const closeModal = () => setShowModal(false);

  const convertImage = async (e: React.FormEvent<Element>) => {
    e.preventDefault();
    if (!session && !disableLoginAndMaxTries) {
      setShowLoginPrompt(true);
      return;
    }
    // if (!disableLoginAndMaxTries && maxTries - CountUsage <= 0) {
    //   setShowOutOfTriesModal(true);
    //   return;
    // }
    if (!files) {
      alert("Please upload an image first.");
      return;
    }
    try {
      const message = {
        model,
        customInstructions,
      };
      setInput("Explain this picture");
      //setInput(JSON.stringify(message));
      handleSubmit(e, { body: message, experimental_attachments: files });
      //setFiles(null);
      await updateUsageCount();
      closeModal();
    } catch (error) {
      console.error("Error converting image:", error);
      alert("Failed to convert image.");
    }
  };
  const processFile = (file: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    setFiles(dataTransfer.files);

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
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      setFiles(dataTransfer.files);

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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header
        CountUsage={CountUsage}
        maxTries={maxTries}
        session={session}
        disableLoginAndMaxTries={disableLoginAndMaxTries}
      />
      <div className="container mx-auto py-6 sm:py-12 px-4 max-w-full w-full sm:w-[95%]">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
          <ControlPanel
            language={language}
            onLanguageChange={setLanguage}
            onSettingsClick={() => setShowModal(true)}
            onConvertClick={convertImage}
            onStopClick={stop}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6"
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              tabIndex={0}
            >
              {imagePreview ? (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto max-h-64 rounded-lg"
                  />
                </div>
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
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
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
              >
                {files ? "Change Image" : "Upload Image"}
              </label>
              {files && (
                <p className="mt-2 text-sm text-gray-400">{files[0].name}</p>
              )}
              <p className="mt-4 text-sm text-gray-400">
                Or paste an image here
              </p>
              <input
                hidden
                ref={inputRef}
                className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)]"
                placeholder="Add your custom Instructions here..."
                value={input}
                defaultValue="Explain this picture"
                onChange={handleInputChange}
              />
            </div>
            <CodeEditor
              language="typescript"
              value={
                messages.length > 0
                  ? parseCode(messages[messages.length - 1].content)
                  : ""
              }
              readOnly={true}
              onCopy={() =>
                copyToClipboard(
                  messages.length > 0
                    ? parseCode(messages[messages.length - 1].content)
                    : ""
                )
              }
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
          savePreferences();
          convertImage(e);
          closeModal();
        }}
        onSave={() => {
          savePreferences();
          closeModal();
        }}
        onModelChange={(value) => setModel(value)}
        onSetCustomInstructions={(value) => setCustomInstructions(value)}
        customInstructions={customInstructions}
        model={model}
      ></SettingModal>
    </div>
  );
};

export default Stream;

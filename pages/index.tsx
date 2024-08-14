import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useCompletion } from "ai/react";
import { parseCode } from "@/lib/util";
import { Settings, X, Code, ChevronDown } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Header from "@/Components/Header";
import SettingModal from "@/Components/SettingModal";
import Footer from "@/Components/Footer";
import CodeEditor from "@/Components/CodeEditor";
import ControlPanel from "@/Components/ControlPanel";
import LoginPrompt from "@/Components/LoginPrompt"
import OutOfTriesModal from "@/Components/OutOfTriesModal";

const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });


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
  const disableLoginAndMaxTries = process.env.NEXT_PUBLIC_DISABLE_LOGIN_AND_MAX_TRIES === "true";
  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/chat/Convert",
  });


useEffect(() => {
  if (session?.user?.id) {
    // Fetch user preferences from API
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
  } else {
    // Load preferences from local storage if user is not logged in
    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences);
      if (preferences.language) {
        setLanguage(preferences.language);
      }
      if (preferences.model) {
        setLanguage(preferences.model);
      }
      if (preferences.customInstructions) {
        setLanguage(preferences.customInstructions);
      }
      if (preferences.lastCodeUsed) {
        setSourceCode(preferences.lastCodeUsed);
      }
    }
  }
}, [session]);

const savePreferences = async () => {
  if (session?.user?.id) {
    // Save preferences to API if user is logged in
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
  } else {
    // Save preferences to local storage if user is not logged in
    const preferences = {
      language,
      model,
      customInstructions,
      lastCodeUsed: sourceCode,
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
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
  const closeModal = () => setShowModal(false);

  const convertCode = async () => {
    if (!session && !disableLoginAndMaxTries) {
      setShowLoginPrompt(true);
      return;
    }
    if (!disableLoginAndMaxTries && (maxTries - CountUsage <= 0)) {
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
     <Header CountUsage={CountUsage} maxTries={maxTries} session={session} disableLoginAndMaxTries={disableLoginAndMaxTries} />
      <div className="container mx-auto py-6 sm:py-12 px-4 max-w-full w-full sm:w-[95%]">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
        <ControlPanel
            language={language}
            onLanguageChange={setLanguage}
            onSettingsClick={() => setShowModal(true)}
            onStopClick={stop}
            onConvertClick={convertCode}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CodeEditor
              language={language}
              value={sourceCode}
              onChange={(value) => value !== undefined && setSourceCode(value)}
            />
            <CodeEditor
              language="typescript"
              value={parseCode(completion)}
              readOnly={true}
              onCopy={() => copyToClipboard(parseCode(completion))}
            />
          </div>
        </div>

        {error && (
          <div id="errorBox" className="fixed bottom-0 left-0 w-full p-4 bg-red-400 text-white text-center errorBox">
            {error.message}
            <button
              className="absolute top-1 right-2 text-white"
            >
              
            </button>
          </div>
        )}
        {showLoginPrompt && (
          <LoginPrompt
            onClose={() => setShowLoginPrompt(false)}
            onSignIn={() => signIn("google")}
          />
        )}
        {showOutOfTriesModal && (
          <OutOfTriesModal onClose={() => setShowOutOfTriesModal(false)}></OutOfTriesModal>
        )}
        <Footer></Footer>
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
        onModelChange={(value) => setModel(value)}  
        onSetCustomInstructions={(value) => setCustomInstructions(value)}
        customInstructions={customInstructions}
        model={model}
      >
        
      </SettingModal>
    </div>
  );
};

export default Stream;

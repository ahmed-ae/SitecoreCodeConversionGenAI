"use client";
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
import LoginPrompt from "@/Components/LoginPrompt";
import OutOfTriesModal from "@/Components/OutOfTriesModal";
import Head from "next/head";

import {
  savePreferences,
  updateUsageCount,
  getPreferences,
  UserPreferences,
} from "../services/userPreferences.ts";

const Stream = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "scriban",
    model: "claude3sonnet",
    customInstructions: "",
    lastCodeUsed:
      "<!--paste your source code that you want to convert here -->",
    CountUsage: 0,
    maxTries: 0,
    framework: "nextjs",
    styling: "tailwind",
    enableFigma: false,
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const { data: session } = useSession() as { data: Session | null };
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [showOutOfTriesModal, setShowOutOfTriesModal] =
    useState<boolean>(false);
  const disableLoginAndMaxTries =
    process.env.NEXT_PUBLIC_DISABLE_LOGIN_AND_MAX_TRIES === "true";
  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/chat/Convert",
  });

  useEffect(() => {
    const loadPreferences = async () => {
      const loadedPreferences = await getPreferences(session);
      setPreferences((prevPreferences: UserPreferences) => ({
        ...prevPreferences,
        ...loadedPreferences,
      }));
    };

    loadPreferences();
  }, [session?.user?.id]); // Only depend on the user ID

  const closeModal = () => setShowModal(false);

  const convertCode = async () => {
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
    try {
      const message = {
        language: preferences.language,
        sourceCode: preferences.lastCodeUsed,
        model: preferences.model,
        customInstructions: preferences.customInstructions,
      };
      await complete(JSON.stringify(message));
      const newCount = await updateUsageCount(
        session,
        preferences.lastCodeUsed,
        preferences.CountUsage,
        preferences.framework,
        preferences.styling
      );
      setPreferences((prev: UserPreferences) => ({
        ...prev,
        CountUsage: newCount,
      }));
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
  const handleSavePreferences = async () => {
    await savePreferences(session, preferences);
    closeModal();
  };

  return (
    <>
      <Head>
        <title>
          Sitecore JSS Copilot | Code generation and conversion tool
        </title>
      </Head>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
        <Header
          CountUsage={preferences.CountUsage}
          maxTries={preferences.maxTries}
          session={session}
          disableLoginAndMaxTries={disableLoginAndMaxTries}
        />
        <div className="container mx-auto py-6 sm:py-12 px-4 max-w-full w-full sm:w-[95%]">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
            <ControlPanel
              language={preferences.language}
              onLanguageChange={(lang) =>
                setPreferences((prev: UserPreferences) => ({
                  ...prev,
                  language: lang,
                }))
              }
              onSettingsClick={() => setShowModal(true)}
              onStopClick={stop}
              onConvertClick={convertCode}
              isLoading={isLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CodeEditor
                language={preferences.language}
                value={preferences.lastCodeUsed}
                onChange={(value) =>
                  value !== undefined &&
                  setPreferences((prev: UserPreferences) => ({
                    ...prev,
                    lastCodeUsed: value,
                  }))
                }
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
          onSaveAndConvert={() => {
            handleSavePreferences();
            convertCode();
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

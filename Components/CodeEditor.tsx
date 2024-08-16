"use client";
import React from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  language: string;
  value: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  onCopy?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  readOnly = false,
  onCopy,
}) => {
  return (
    <div className="relative">
      <MonacoEditor
        defaultLanguage={language === "scriban" ? "html" : language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, readOnly }}
        className="h-[300px] sm:h-[600px] rounded-md border border-gray-700 overflow-hidden"
      />
      {readOnly && onCopy && (
        <button
          className="absolute top-2 right-2 bg-gray-700 text-gray-100 px-3 py-1 rounded-md text-xs hover:bg-gray-600 transition duration-300"
          onClick={onCopy}
        >
          Copy Code
        </button>
      )}
    </div>
  );
};

export default CodeEditor;

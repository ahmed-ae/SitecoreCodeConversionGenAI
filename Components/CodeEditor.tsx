"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Copy } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface CodeEditorProps {
  language: string;
  value: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  onCopy?: () => void;
  filename?: string;
  enableDownload?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  readOnly = false,
  onCopy,
  filename,
  enableDownload = false,
}) => {
  const handleDownload = () => {
    if (!filename || !value.trim()) return;

    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasContent = value.trim().length > 0;

  return (
    <div className="relative">
      <MonacoEditor
        defaultLanguage={language === "scriban" ? "html" : language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, readOnly }}
        className="h-[300px] sm:h-[600px] overflow-hidden" // Removed rounded-md and border classes
      />
      {hasContent && (
        <div className="absolute top-2 right-4 flex space-x-2">
          {readOnly && onCopy && (
            <button
              className="bg-gray-700 text-gray-100 p-1 rounded-md hover:bg-gray-600 transition duration-300"
              onClick={onCopy}
              title="Copy Code"
            >
              <Copy size={16} />
            </button>
          )}
          {enableDownload && filename && (
            <button
              className="bg-gray-700 text-gray-100 p-1 rounded-md hover:bg-gray-600 transition duration-300"
              onClick={handleDownload}
              title="Download Code"
            >
              <Download size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;

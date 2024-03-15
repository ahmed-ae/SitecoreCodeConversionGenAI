import dynamic from "next/dynamic";
import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCompletion } from "ai/react";

// Importing the Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

const Stream = () => {
  const [language, setLanguage] = useState<string>("scriban");
  const [model, setModel] = useState<string>("claude3opus");
  const [sourceCode, setSourceCode] = useState<string>(
    "// paste your code here "
  );
  const [convertedCode, setConvertedCode] = useState<string>("");

  const { completion, isLoading, handleInputChange, complete, error } =
    useCompletion({
      api: "/api/claude/Convert",
    });
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setSourceCode(value);
    }
  };

  const convertCode = async () => {
    try {
      var message = {
        language: language,
        sourceCode: sourceCode,
        model: model,
      };
      complete(JSON.stringify(message));
    } catch (error) {
      console.error("Error converting code:", error);
      alert("Failed to convert code.");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        alert("Code copied to clipboard!");
      },
      (err) => {
        console.error("Error copying text to clipboard", err);
      }
    );
  };

  return (
    <div className="container py-5">
      <header className="text-center mb-4">
        <h1>Sitecore Code Conversion Tool. Beta 0.1</h1>
        <p>
          Use GenAI with Claude-3-Opus Model to convert your Sitecore MVC Razor
          components and Sitecore SXA Scriban components into Sitecore JSS with
          NextJS components
        </p>
      </header>

      <div className="mb-3 d-flex justify-content-center">
        <label htmlFor="language-select w-auto me-2">
          Source Code Language:
        </label>
        <select
          id="language-select"
          className="form-select w-auto me-2"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ color: "green" }}
        >
          <option value="razor">Razor</option>
          <option value="scriban">Sitecore SXA Scriban</option>
          <option value="csharp">C#</option>
        </select>
        <br />
        <label htmlFor="model-select w-auto me-2">Model:</label>
        <select
          id="model-select"
          className="form-select w-auto me-2"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ color: "green" }}
        >
          <option value="claude3opus">Claude 3 Opus</option>
          <option value="claude3sonnet">Claude 3 Sonnet</option>
          <option value="claude3haiku">Claude 3 Haiku</option>
        </select>

        <button
          className="btn btn-primary"
          onClick={convertCode}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Convert"}
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="position-relative flex-fill me-2">
          <MonacoEditor
            defaultLanguage={language === "scriban" ? "html" : language}
            defaultValue={sourceCode}
            onChange={handleEditorChange}
            theme="vs-dark"
            height="600px"
          />
        </div>
        <br />
        <br />

        <div className="position-relative flex-fill ms-2">
          <MonacoEditor
            defaultLanguage="javascript"
            value={completion
              .replace("```tsx", "")
              .replace("```", "")
              .replace("```typescript", "")
              .replace("```javascript", "")}
            theme="vs-dark"
            options={{ readOnly: true }}
            height="600px"
          />
          <button
            className="btn btn-sm btn-secondary position-absolute top-0 end-0 m-2"
            onClick={() => copyToClipboard(convertedCode)}
          >
            Copy Code
          </button>
        </div>
      </div>
      {error && (
        <div className="fixed top-0 left-0 w-full p-4 text-center bg-red-500 text-white">
          {error.message}
        </div>
      )}
      <footer className="text-center mt-4" style={{ color: "white" }}>
        Created by:{"  "}
        <a
          href="https://github.com/ahmed-ae"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>{" "}
        |
        <a
          href="https://twitter.com/aokour86"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          Twitter
        </a>
      </footer>
    </div>
  );
};

export default Stream;

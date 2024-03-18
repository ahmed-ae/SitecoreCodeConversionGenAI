import dynamic from "next/dynamic";
import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCompletion } from "ai/react";

// Importing the Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

const Stream = () => {
  const [language, setLanguage] = useState<string>("scriban");
  const [model, setModel] = useState<string>("gpt4");
  const [sourceCode, setSourceCode] = useState<string>(
    "<!--paste your source code that you want to convert here -->"
  );

  const { completion, isLoading, stop, complete, error } = useCompletion({
    api: "/api/chat/Convert",
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
          Use GenAI with either GPT4 or Claude 3 LLMS to convert your legacy
          Sitecore MVC Razor files or Sitecore SXA Scriban scripts into Sitecore
          Jss Next component
        </p>
      </header>

      <div className="row mb-3 align-items-center">
        {/* Column for dropdowns */}
        <div className="col">
          <div className="d-flex align-items-center">
            <label htmlFor="language-select" className="me-2">
              Source Language:
            </label>
            <select
              id="language-select"
              className="form-select me-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ color: "green", width: "33%" }}
            >
              <option value="razor">ASP.NET MVC Razor</option>
              <option value="scriban">Sitecore SXA Scriban</option>
              <option value="csharp">C#</option>
            </select>

            <label htmlFor="model-select" className="me-2">
              Model:
            </label>
            <select
              id="model-select"
              className="form-select me-2"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ color: "green", width: "33%" }}
            >
              <option value="claude3opus">Claude 3 Opus</option>
              <option value="claude3sonnet">Claude 3 Sonnet</option>
              <option value="claude3haiku">Claude 3 Haiku</option>
              <option value="gpt4">GPT-4 turbo</option>
            </select>
          </div>
        </div>

        {/* Column for Convert button */}
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={stop}
            disabled={!isLoading}
          >
            Stop
          </button>

          <button
            className="btn btn-primary me-2"
            onClick={convertCode}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Convert"}
          </button>
        </div>
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
            onClick={() =>
              copyToClipboard(
                completion
                  .replace("```tsx", "")
                  .replace("```", "")
                  .replace("```typescript", "")
                  .replace("```javascript", "")
              )
            }
          >
            Copy Code
          </button>
        </div>
      </div>
      {error && (
        <div
          id="errorBox"
          className="fixed top-0 left-0 w-full p-4 text-center bg-red-500 text-white"
        >
          {error.message}
          <div className="position-absolute top-0 end-0 m-2">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                var errorDiv = document.getElementById("errorBox");
                if (errorDiv) {
                  errorDiv.style.display = "none";
                }
              }}
            >
              <i className="bi bi-x">CLOSE</i>
            </button>
          </div>
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

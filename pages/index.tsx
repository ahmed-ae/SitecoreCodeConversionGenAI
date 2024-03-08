import dynamic from "next/dynamic";
import { useState } from "react";
import axios from "axios";

// Importing the Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

const Home = () => {
  const [language, setLanguage] = useState<string>("scriban");
  const [sourceCode, setSourceCode] = useState<string>(
    "// Your Scriban code here"
  );
  const [convertedCode, setConvertedCode] = useState<string>("");

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setSourceCode(value);
    }
  };

  const convertCode = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/convert", {
        language,
        sourceCode,
      });
      setConvertedCode(
        response.data.code.replace("```tsx", "").replace("```", "")
      );
    } catch (error) {
      console.error("Error converting code:", error);
      alert("Failed to convert code.");
    }
  };

  return (
    <div className="container mx-auto mt-5">
      <header className="text-center mb-4">
        <h1 className="mb-2">Sitecore Code Conversion Tool. Beta 0.1</h1>
        <p>
          Use GenAI with GPT4 to convert your Sitecore MVC Razor components and
          Sitecore SXA Scriban components into Sitecore JSS with NextJS
          components
        </p>
      </header>
      <div className="mb-4">
        <select
          className="form-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ color: "green" }}
        >
          <option value="razor">Razor</option>
          <option value="scriban">Sitecore SXA Scriban</option>
          <option value="csharp">C#</option>
        </select>
      </div>
      <div className="row g-12 d-flex">
        <div className="col-md-5">
          <MonacoEditor
            defaultLanguage={language === "scriban" ? "html" : language}
            defaultValue={sourceCode}
            onChange={handleEditorChange}
            theme="vs-dark"
            height="400px"
          />
        </div>
        <div className="col-md-2 d-flex justify-content-center align-items-center">
          <button className="btn btn-primary" onClick={convertCode}>
            Convert
          </button>
        </div>
        <div className="col-md-5">
          <MonacoEditor
            defaultLanguage="javascript"
            value={convertedCode}
            theme="vs-dark"
            options={{ readOnly: true }}
            height="400px"
          />
        </div>
      </div>
      <footer className="text-center mt-4 mb-4">
        Created by:{" "}
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

export default Home;

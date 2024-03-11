import dynamic from "next/dynamic";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const ConversionPage = () => {
  const [selectedOption, setSelectedOption] = useState("A");

  return (
    <div className="container py-5">
      <header className="text-center mb-4">
        <h1>Sitecore Code Conversion Tool. Beta 0.1</h1>
        <p>
          Use GenAI with GPT4 to convert your Sitecore MVC Razor components and
          Sitecore SXA Scriban components into Sitecore JSS with NextJS
          components
        </p>
      </header>

      <div className="mb-3 d-flex justify-content-center">
        <select
          className="form-select w-auto me-2"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
        <button className="btn btn-primary">Convert</button>
      </div>

      <div className="row">
        <div className="col-12 col-lg-6 mb-3 mb-lg-0">
          <MonacoEditor
            height="400px"
            defaultLanguage="javascript"
            defaultValue="// First editor"
          />
        </div>
        <div className="col-12 col-lg-6">
          <MonacoEditor
            height="400px"
            defaultLanguage="javascript"
            defaultValue="// Second editor"
          />
        </div>
      </div>

      <footer className="text-center mt-4">
        <p>This website was built by ahmed</p>
      </footer>
    </div>
  );
};

export default ConversionPage;

import React, { useState, useEffect } from "react";
import * as Babel from "@babel/standalone";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import styled, { StyleSheetManager } from "styled-components";

interface CodePreviewProps {
  code: string;
  cssModule?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, cssModule }) => {
  const [screenSize, setScreenSize] = useState<"full" | "tablet" | "mobile">(
    "full"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add viewport meta tag
    const metaTag = document.createElement("meta");
    metaTag.name = "viewport";
    metaTag.content = "width=device-width, initial-scale=1.0";
    document.head.appendChild(metaTag);

    // Add Tailwind script
    const scriptTag = document.createElement("script");
    scriptTag.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(scriptTag);

    return () => {
      // Clean up
      document.head.removeChild(metaTag);
      document.head.removeChild(scriptTag);
    };
  }, []);

  const renderPreview = () => {
    try {
      // Remove import statements and exports
      let modifiedCode = code.replace(/^(import|export)\s+.*$/gm, "");

      // Transpile the code
      const transpiledCode = Babel.transform(modifiedCode, {
        filename: "preview.tsx",
        presets: ["typescript", "react"],
        plugins: [["transform-modules-commonjs", { strict: false }]],
      }).code;

      // Parse CSS Module
      const cssModuleObject = cssModule ? parseCSSModule(cssModule) : {};

      // Create a style element for the CSS
      const styleElement = document.createElement("style");
      styleElement.textContent = Object.entries(cssModuleObject)
        .map(([className, styles]) => `.${className} { ${styles} }`)
        .join("\n");

      // Wrap the transpiled code in a function that captures all defined components
      const wrappedCode = `
        (function(React, styled, cssModule) {
          const { useState, useEffect } = React;
          const components = {};
          let lastDefinedComponent = null;
          
          function captureComponent(name, value) {
            components[name] = value;
            lastDefinedComponent = value;
            return value;
          }

          // Create a proxy for the styles object
          const styles = new Proxy({}, {
            get: function(target, name) {
              return name; // Return the class name as is
            }
          });
          ${transpiledCode}

          // Capture components after they're defined
          if (typeof PreviewComponent !== 'undefined') {
            captureComponent('PreviewComponent', PreviewComponent);
          }

          return components.PreviewComponent || lastDefinedComponent;
        })
      `;

      // Evaluate the code to get the component factory
      const ComponentFactory = eval(wrappedCode);

      // Call the factory with React, styled, and cssModule to get the component
      const Component = ComponentFactory(React, styled, cssModuleObject);

      if (!Component) {
        throw new Error("No valid React component found in the generated code");
      }

      // Render the component
      return (
        <StyleSheetManager>
          <>
            <style>{styleElement.textContent}</style>
            <div className="preview-container w-full h-full overflow-auto bg-white text-gray-800 p-4">
              <Component />
            </div>
          </>
        </StyleSheetManager>
      );
    } catch (error) {
      console.error("Error in code evaluation:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      return null;
    }
  };

  const parseCSSModule = (cssContent: string): Record<string, string> => {
    const cssModuleObject: Record<string, string> = {};
    const regex = /\.([^\s{]+)\s*{([^}]*)}/g;
    let match;

    while ((match = regex.exec(cssContent)) !== null) {
      const className = match[1];
      const styles = match[2].trim();
      cssModuleObject[className] = styles;
    }

    return cssModuleObject;
  };

  const getPreviewStyle = () => {
    switch (screenSize) {
      case "tablet":
        return { width: "768px", height: "1024px" };
      case "mobile":
        return { width: "375px", height: "667px" };
      default:
        return { width: "100%", height: "100%" };
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      <div className="flex justify-center space-x-4 mb-4 p-4 bg-gray-200">
        <button
          onClick={() => setScreenSize("full")}
          className={`p-2 rounded ${
            screenSize === "full" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          <Monitor size={24} />
        </button>
        {/* <button
          onClick={() => setScreenSize("tablet")}
          className={`p-2 rounded ${
            screenSize === "tablet" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          <Tablet size={24} />
        </button> */}
        <button
          onClick={() => setScreenSize("mobile")}
          className={`p-2 rounded ${
            screenSize === "mobile" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          <Smartphone size={24} />
        </button>
      </div>
      <div className="flex-grow overflow-hidden bg-white flex justify-center items-start">
        <div style={{ ...getPreviewStyle(), overflow: "hidden" }}>
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            renderPreview()
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePreview;

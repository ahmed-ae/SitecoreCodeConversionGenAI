import React, { useState, useEffect } from "react";
import * as Babel from "@babel/standalone";
import { Smartphone, Monitor } from "lucide-react";

interface CodePreviewProps {
  code: string;
  cssModule?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, cssModule }) => {
  const [screenSize, setScreenSize] = useState<"full" | "tablet" | "mobile">(
    "full"
  );
  const [error, setError] = useState<string | null>(null);
  const [iframeContent, setIframeContent] = useState<string>("");

  useEffect(() => {
    const generatedContent = generateIframeContent();
    setIframeContent(generatedContent);
  }, [code, cssModule, screenSize]);

  const generateIframeContent = () => {
    try {
      // Remove import statements and exports
      let strippedCode = code.replace(/^(import|export)\s+.*$/gm, "");

      // Parse CSS Module
      const cssModuleObject = cssModule ? parseCSSModule(cssModule) : {};

      // Create a style element for the CSS
      const cssModuleStyles = Object.entries(cssModuleObject)
        .map(([className, styles]) => `.${className} { ${styles} }`)
        .join("\n");

      // Modify the createPreviewComponent function
      const modifiedCode = `
        function createPreviewComponent(React, styledComponents) {
          const styled = styledComponents.default || styledComponents;
          const { useState, useEffect, useRef, useContext, useReducer, useCallback, useMemo, useLayoutEffect } = React;
          const cssModules = ${JSON.stringify(cssModuleObject)};
          const styles = new Proxy(cssModules, {
            get: (target, prop) => {
              if (prop in target) {
                return prop; // Return the class name as is
              }
              console.warn(\`Style "\${String(prop)}" not found in CSS modules\`);
              return String(prop); // Return the prop as a fallback
            }
          });
          ${strippedCode}
          const ComponentToRender = typeof exports !== 'undefined' ? (exports.__esModule ? exports.default : exports) : (typeof PreviewComponent !== 'undefined' ? PreviewComponent : null);
          if (!ComponentToRender) {
            throw new Error('No component found to render');
          }
          return React.forwardRef((props, ref) => {
            const WithStyles = (OriginalComponent) => {
              return (props) => {
                const newProps = {...props};
                if (newProps.className && typeof newProps.className === 'string') {
                  newProps.className = newProps.className.split(' ').map(cls => cssModules[cls] || cls).join(' ');
                }
                return React.createElement(OriginalComponent, newProps);
              };
            };
            return React.createElement(WithStyles(ComponentToRender), props);
          });
        }
      `;

      // Transpile the modified code
      const transpiledCode = Babel.transform(modifiedCode, {
        filename: "preview.tsx",
        presets: ["typescript", "react"],
      }).code;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/styled-components@6.1.13/dist/styled-components.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>${cssModule}</style>
          </head>
          <body>
            <div id="root"></div>
            <script>
              ${transpiledCode}
              
              function checkLibraries() {
                if (window.React && window.styled && window.ReactDOM) {
                  const PreviewComponent = createPreviewComponent(window.React, window.styled);
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(React.createElement(PreviewComponent));
                } else {
                  setTimeout(checkLibraries, 50);
                }
              }
              
              checkLibraries();
            </script>
          </body>
        </html>
      `;

      return htmlContent;
    } catch (error) {
      console.error("Error in code evaluation:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      return "";
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
      case "mobile":
        return { width: "375px", height: "667px", margin: "0 auto" };
      case "tablet":
        return { width: "700px", height: "1024px", margin: "0 auto" };
      default:
        return { width: "100%", height: "100%", margin: "0" };
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
        <button
          onClick={() => setScreenSize("tablet")}
          className={`p-2 rounded ${
            screenSize === "tablet" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          <Monitor size={24} />
        </button>
        <button
          onClick={() => setScreenSize("mobile")}
          className={`p-2 rounded ${
            screenSize === "mobile" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          <Smartphone size={24} />
        </button>
      </div>
      <div className="flex-grow relative">
        <div className="absolute inset-0 checkered-background overflow-auto p-4">
          <div
            className={`bg-white ${
              screenSize === "mobile" || screenSize === "tablet"
                ? "mx-auto"
                : "w-full h-full"
            }`}
            style={{
              ...getPreviewStyle(),
              boxShadow:
                screenSize === "mobile" || screenSize === "tablet"
                  ? "0 0 10px rgba(0,0,0,0.1)"
                  : "none",
              transition: "width 0.3s ease, margin 0.3s ease",
            }}
          >
            {error ? (
              <div className="text-red-500 p-4">{error}</div>
            ) : (
              <iframe
                srcDoc={iframeContent}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="Preview"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePreview;

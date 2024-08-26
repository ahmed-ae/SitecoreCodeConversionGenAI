import React, { useState } from "react";
import * as Babel from "@babel/standalone";
import { Smartphone, Tablet, Monitor } from "lucide-react";

interface CodePreviewProps {
  code: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code }) => {
  const [screenSize, setScreenSize] = useState<"full" | "tablet" | "mobile">(
    "full"
  );

  const renderPreview = () => {
    try {
      console.log("Original code:", code);

      // Remove import statements and exports
      let modifiedCode = code.replace(/^(import|export)\s+.*$/gm, "");

      // Transpile the code
      const transpiledCode = Babel.transform(modifiedCode, {
        filename: "preview.tsx",
        presets: ["typescript", "react"],
        plugins: [["transform-modules-commonjs", { strict: false }]],
      }).code;

      //console.log('Transpiled code:', transpiledCode);

      // Wrap the transpiled code in a function that captures all defined components
      const wrappedCode = `
        (function(React) {
          const components = {};
          let lastDefinedComponent = null;
          
          function captureComponent(name, value) {
            console.log('Capturing component:', name);
            components[name] = value;
            lastDefinedComponent = value;
            return value;
          }

          ${transpiledCode}

          // Capture components after they're defined
          if (typeof EventRegistrationComponent !== 'undefined') {
            captureComponent('EventRegistrationComponent', EventRegistrationComponent);
          }
          if (typeof PreviewComponent !== 'undefined') {
            captureComponent('PreviewComponent', PreviewComponent);
          }

          console.log('Captured components:', Object.keys(components));
          console.log('Last defined component:', lastDefinedComponent ? lastDefinedComponent.name : 'None');

          if (components.PreviewComponent) {
            console.log('Returning PreviewComponent');
            return components.PreviewComponent;
          } else if (components.EventRegistrationComponent) {
            console.log('Returning EventRegistrationComponent');
            return components.EventRegistrationComponent;
          } else if (lastDefinedComponent) {
            console.log('Returning last defined component');
            return lastDefinedComponent;
          } else {
            console.log('No components found');
            return null;
          }
        })
      `;

      //console.log('Wrapped code:', wrappedCode);

      // Evaluate the code to get the component factory
      const ComponentFactory = eval(wrappedCode);

      // Call the factory with React to get the component
      const Component = ComponentFactory(React);

      if (!Component) {
        throw new Error("No valid React component found in the generated code");
      }

      //console.log('Component found:', Component.name);

      // Render the component
      return <Component />;
    } catch (error) {
      console.error("Error in code evaluation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return (
        <div className="text-red-500">
          Error rendering preview: {errorMessage}
        </div>
      );
    }
  };

  const getPreviewStyle = () => {
    switch (screenSize) {
      case "tablet":
        return {
          width: "768px",
          height: "1024px",
          margin: "0 auto",
          border: "1px solid #ccc",
        };
      case "mobile":
        return {
          width: "375px",
          height: "667px",
          margin: "0 auto",
          border: "1px solid #ccc",
        };
      default:
        return { width: "100%", height: "100%" };
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setScreenSize("full")}
          className={`p-2 rounded ${
            screenSize === "full" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <Monitor size={24} />
        </button>
        <button
          onClick={() => setScreenSize("tablet")}
          className={`p-2 rounded ${
            screenSize === "tablet" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <Tablet size={24} />
        </button>
        <button
          onClick={() => setScreenSize("mobile")}
          className={`p-2 rounded ${
            screenSize === "mobile" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <Smartphone size={24} />
        </button>
      </div>
      <div className="flex-grow overflow-auto bg-white">
        <div style={getPreviewStyle()}>{renderPreview()}</div>
      </div>
    </div>
  );
};

export default CodePreview;

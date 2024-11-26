import React, { useState, useEffect } from "react";
import * as Babel from "@babel/standalone";
import { Smartphone, Monitor, Tablet } from "lucide-react";

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

  const detectLucideUsage = (originalCode: string) => {
    const hasLucideImport = /import.*from ['"]lucide-react['"]/.test(
      originalCode
    );

    return hasLucideImport;
  };

  const extractLucideImports = (originalCode: string) => {
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/g;
    const imports = new Set<string>();

    let match;
    while ((match = importRegex.exec(originalCode)) !== null) {
      const importList = match[1].split(",").map((name) => name.trim());
      importList.forEach((name) => imports.add(name));
    }

    return Array.from(imports);
  };

  const generateIframeContent = () => {
    try {
      const hasLucideIcons = detectLucideUsage(code);
      const lucideImports = hasLucideIcons ? extractLucideImports(code) : [];

      // Remove import statements and exports
      let strippedCode = code.replace(/^(import|export)\s+.*$/gm, "");

      // Check if code uses styled-components
      const hasStyledComponents = strippedCode.includes("styled.");
      // Parse CSS Module
      const cssModuleObject = cssModule ? parseCSSModule(cssModule) : {};
      const hasCSSModule = Object.keys(cssModuleObject).length > 0;
      // Create a style element for the CSS
      const cssModuleStyles = Object.entries(cssModuleObject)
        .map(([className, styles]) => `.${className} { ${styles} }`)
        .join("\n");
      const shouldIncludeTailwind = !hasStyledComponents && !hasCSSModule;
      // Properly encode CSS for URL
      const encodedCSS = cssModule
        ? encodeURIComponent(cssModule).replace(/%20/g, "+")
        : "";
      // Modify the createPreviewComponent function
      const modifiedCode = `
        function createPreviewComponent(React, styledComponents) {
          const styled = styledComponents.default || styledComponents;
          const { useState, useEffect, useRef, useContext, useReducer, useCallback, useMemo, useLayoutEffect } = React;

          ${
            hasLucideIcons
              ? `
          // Create wrapper for Lucide icons
          function createLucideIcon(name, defaults = {}) {
            return React.forwardRef(({ 
              color = defaults.color || 'currentColor',
              size = defaults.size || 24,
              strokeWidth = defaults.strokeWidth || 2,
              className = '',
              style,
              ...props
            }, ref) => {
              const elementRef = useRef(null);

              useEffect(() => {
                const element = elementRef.current;
                if (element && window.lucide) {
                  try {
                    // Create a div with the icon name
                    element.innerHTML = \`<i data-lucide=\'\${name}\'></i>\`;
                    
                    // Initialize the icon
                    window.lucide.createIcons({
                      attrs: {
                        'stroke-width': strokeWidth,
                        'class': className,
                        'width': size,
                        'height': size,
                        'color': color
                      }
                    });
                  } catch (err) {
                    console.error(\`Error rendering icon: \${name}\`, err);
                  }
                }
              }, [color, size, strokeWidth, className]);

              return React.createElement('span', {
                ref: (el) => {
                  elementRef.current = el;
                  if (typeof ref === 'function') ref(el);
                  else if (ref) ref.current = el;
                },
                style: { 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: size,
                  height: size,
                  ...style
                },
                ...props
              });
            });
          }

          // Create icon components
          const ${lucideImports
            .map((name) => {
              // Convert camelCase to kebab-case
              const iconName = name
                .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())
                .replace(/^-/, "");
              return `${name} = createLucideIcon('${iconName}')`;
            })
            .join(",\n          ")};
          `
              : ""
          }

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
            ${
              hasLucideIcons
                ? `<script src="https://unpkg.com/lucide@0.454.0/dist/umd/lucide.min.js"></script>`
                : ""
            }
            ${
              shouldIncludeTailwind
                ? '<script src="https://cdn.tailwindcss.com"></script>'
                : ""
            }
            <!-- Base styles -->
            <style>
              *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              
              html, body, #root {
                height: 100%;
                width: 100%;
              }
            </style>
            
           <!-- Component CSS will be injected here -->
          <style id="component-styles"></style>
            <!-- WebFontLoader for dynamic font loading -->
            <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
            
            <!-- Base Google Fonts -->
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
            
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            
            <style>
              /* Add default font family */
              body {
                font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              }
            </style>

            <script>
              // Function to load additional Google Fonts dynamically
              function loadGoogleFonts() {
                const styleSheets = document.styleSheets;
                const fontFamilies = new Set();
                
                // Extract all font-family declarations from styles
                for (let sheet of styleSheets) {
                  try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let rule of rules) {
                      if (rule.style && rule.style.fontFamily) {
                        const fonts = rule.style.fontFamily.split(',')
                          .map(font => font.trim().replace(/['",]/g, ''))
                          .filter(font => 
                            !font.includes('system-ui') && 
                            !font.includes('-apple-system') &&
                            !font.match(/^(sans-serif|serif|monospace|cursive|fantasy)$/)
                          );
                        fonts.forEach(font => fontFamilies.add(font));
                      }
                    }
                  } catch (e) {
                    console.warn('Could not read stylesheet rules', e);
                  }
                }

                // Load detected fonts using WebFontLoader
                if (fontFamilies.size > 0) {
                  WebFont.load({
                    google: {
                      families: Array.from(fontFamilies)
                    }
                  });
                }
              }

              // Call the function after a short delay to ensure all styles are loaded
              setTimeout(loadGoogleFonts, 100);
            </script>
           
          </head>
          <body>
            <div id="root"></div>
            <script>
            // Fetch and inject CSS
            ${
              cssModule
                ? `
              fetch('/api/render/css', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ css: ${JSON.stringify(cssModule)} })
              })
              .then(response => response.text())
              .then(css => {
                document.getElementById('component-styles').textContent = css;
              })
              .catch(error => console.error('Error loading CSS:', error));
            `
                : ""
            }
              ${transpiledCode}
              
              function checkLibraries() {
                const requiredLibraries = ['React', 'styled', 'ReactDOM'];
                ${hasLucideIcons ? "requiredLibraries.push('lucide');" : ""}
                
                const allLibrariesLoaded = requiredLibraries.every(lib => window[lib]);
                
                if (allLibrariesLoaded) {
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
        return { width: "450px", height: "100%", margin: "0 auto" };
      case "tablet":
        return { width: "740px", height: "100%", margin: "0 auto" };
      default:
        return {
          width: "100%",
          height: "100%",
          margin: "0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        };
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
          <Tablet size={24} />
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
                : "w-full h-full flex items-center justify-center"
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

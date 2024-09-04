export interface Message {
  role: string;
  content: string;
}

export function parseCode(completion: string): string {
  const typescriptRegex = /```typescript([\s\S]*?)```/;
  const typescriptRegex2 = /typescript([\s\S]*?)/;
  const tsxRegex = /```tsx([\s\S]*?)```/;
  const javascriptRegex = /```javascript([\s\S]*?)```/;
  const codeRegex = /```([\s\S]*?)```/;
  const match = completion.match(typescriptRegex);
  if (match && match[1]) {
    // Extracted code block
    const extractedCodeBlock = match[1];
    return extractedCodeBlock;
  } else {
    const match = completion.match(typescriptRegex2);
    if (match && match[1]) {
      // Extracted code block
      const extractedCodeBlock = match[1];
      return extractedCodeBlock;
    } else {
      const match = completion.match(tsxRegex);
      if (match && match[1]) {
        // Extracted code block
        const extractedCodeBlock = match[1];
        return extractedCodeBlock;
      } else {
        const match = completion.match(javascriptRegex);
        if (match && match[1]) {
          // Extracted code block
          const extractedCodeBlock = match[1];
          return extractedCodeBlock;
        } else {
          const match = completion.match(codeRegex);
          if (match && match[1]) {
            // Extracted code block
            const extractedCodeBlock = match[1];
            return extractedCodeBlock;
          } else {
            return completion
              .replace("```tsx", "")
              .replace("```", "")
              .replace("```typescript", "")
              .replace("```javascript", "");
          }
        }
      }
    }
  }
}

export function parseCodeForPreview(completion: string): string {
  let code = parseCode(completion);
  const endMarker = "///END///";
  const endIndex = code.indexOf(endMarker);

  if (endIndex !== -1) {
    return code.substring(0, endIndex).trim();
  }
  console.log(code);
  return code;
}

export function generateCodeConversionPrompt(
  language: string,
  sourceCode: string,
  customInstructions: string
): Message[] {
  let systemMessage = "";
  let userPrompt = "";

  if (language === "scriban") {
    userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must only contain converted code, don't include any explanations in your responses`;

    userPrompt +=
      "\n include this import : import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs'";
    userPrompt +=
      "\n for every component, define  ComponentProps as type ComponentProps = { rendering: ComponentRendering; params: ComponentParams; }";
    userPrompt +=
      "\n extract the component props from SXA scriban code and assign the right type , follow this as an example -> type ComponentNameProps = ComponentProps & {fields: {imagefield: ImageField;textfield: Field<string>;linkfield: LinkField;datefield: DateField} };";
    userPrompt +=
      "\n use (props: ComponentNameProps): JSX.Element  instead of React.FC<props>";

    if (customInstructions && customInstructions != "") {
      userPrompt +=
        "\n follow instructions delimited by triple backticks ```" +
        customInstructions +
        " ```";
    }
    userPrompt += "\n Source Code:" + sourceCode;
    systemMessage =
      "You help to convert code written in Sitecore SXA Scriban into Sitecore JSS Next JS with TypeScript \n";
  } else if (language === "renderingResolver") {
    userPrompt = `Convert the following code from a rendering contents resolver to a component level graph ql query for Sitecore XM Cloud, your output must only contain converted code, don't include any explanations in your responses`;

    userPrompt +=
      "\n don't include 'graphql' at the top of the query, just start with query X($datasource:String!, $language: String!) where X is the name of the query";

    userPrompt +=
      "\n make sure you provide a query for both datasource: item(path: $datasource, language: $language) and contextItem: item(path: $contextItem, language: $language)";

    userPrompt +=
      "\n The follow documentation has a good example called 'To use component-level data fetching with GraphQL:' and it's on this page: https://doc.sitecore.com/xmc/en/developers/jss/latest/jss-xmc/use-graphql-to-fetch-component-level-data-in-jss-next-js-apps.html";

    if (customInstructions && customInstructions != "") {
      userPrompt +=
        "\n follow instructions delimited by triple backticks ```" +
        customInstructions +
        " ```";
    }
    userPrompt += "\n Source Code:" + sourceCode;
  } else if (language === "razor") {
    userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must only contain converted code, don't include any explanations in your responses`;

    userPrompt +=
      "\n  include this import : import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs'";
    userPrompt +=
      "\n for every component,  define  ComponentProps as type ComponentProps = { rendering: ComponentRendering; params: ComponentParams; }";
    userPrompt +=
      "\n define your component props like this example, type ComponentNameProps = ComponentProps & {fields: {imagefield: ImageField;textfield: Field<string>;linkfield: LinkField;datefield: DateField} };";
    userPrompt +=
      "\n use (props: ComponentNameProps): JSX.Element  instead of React.FC<props>";

    if (customInstructions && customInstructions != "") {
      userPrompt +=
        "\n follow instructions delimited by triple backticks ```" +
        customInstructions +
        " ```";
    }
    userPrompt += "\n Code:" + sourceCode;
    systemMessage =
      "You help to convert code written in ASP.NET MVC into Sitecore JSS Next JS with TypeScript \n";
  }

  const messages: Message[] = [
    { role: "user", content: userPrompt },
    { role: "system", content: systemMessage },
  ];

  return messages;
}

export function generateImage2CodePrompt(
  customInstructions: string,
  additionalInstructions: string
): Message[] {
  let systemMessage = "";
  let userPrompt = "";
  let userCustomInstructions = "";
  if (customInstructions && customInstructions != "") {
    userCustomInstructions = customInstructions + " \n ";
  }
  if (additionalInstructions && additionalInstructions != "") {
    userCustomInstructions += additionalInstructions + " \n ";
  }
  userPrompt = `Convert the attached image into Sitecore JSS NextJs (TypeScript) Component.
      `;

  if (userCustomInstructions && userCustomInstructions != "") {
    userPrompt +=
      "\n follow custom instructions delimited by triple backticks, which are directly provided by the user uploading the image ```" +
      userCustomInstructions +
      " ```";
  }
  systemMessage = `Act like an Image to Code converter, where you convert images into Sitecore JSS components written in nextjs/typescript 
      
    we want to generate 2 react components, For the First component you must follow these rules:
      - it should be agnostic of @sitecore-jss/sitecore-jss-nextjs' library, and should assume any prop in field property can any JSX element, this component should render the entire html
      - In case the attached image includes multiple cards , split it into two components,a parent/container component that will hold the multiple individual card/column components
      - extract the component props from the attached image and assign the right property type for each prop

    For the first component, follow these rules for design,styling and structure:
      - If user does not specifically ask for specific styling library to use then use Make sure to Use Tailwind CSS classes for styling. If any styles can't be achieved with Tailwind, include custom CSS as needed, otherwise use the library that the user asked for
      - Implement a mobile-first responsive design approach using CSS: Start with styles for mobile devices Ensure the design is fluid and adjusts smoothly between breakpoints
      - If user asks for styled components, include the code for styled components library in first component
      - Analyze the provided image in detail, breaking down its visual elements, layout, color scheme, and typography.
      - Ensure the code implementation matches the visual design as closely as possible.
      - Make sure to keep the colors of buttons, fonts and other interactive elements the same as in the attached image
      - Generate semantic HTML5 markup that reflects the structure and content hierarchy of the design.
      - Ensure that interactive elements (e.g., navigation menus, buttons) are usable on both touch and non-touch devices.
      - Optimize the code for performance, keeping it clean, well-commented, and following best practices for web accessibility (WCAG guidelines).
      - Make sure fonts and background colors are exactly matching what is in the attached image
      - Make the component self-contained for easy preview
      - create mock data object (named mockData) that matches what in the attached image and use that mock data to preview the first component, if mock data contains images that can be rendered as SVG, then create SVG elements, otherwise replace the image url with the self hosted canvas image api /api/placeholder/[width]/height, you can pass bgcolor query string to the canvas api to change the background color of the image, use only pastel colors for background color
      - If  the attached image is a carosuel, add few slides with lorem Epsom mock data and make sure to match the style and design of the carousel arrows and rotate dots
      - preview component should always have the name PreviewComponent, and don't export the component, just ensure the component starts with : const PreviewComponent: React.FC

    Now For the second component, follow these rules:
      - Second component which is a wapper around the first component, this component is @sitecore-jss/sitecore-jss-nextjs' aware, and receive all needed preps for @sitecore-jss/sitecore-jss-nextjs'.
      - follow this as an example -> type ComponentNameProps = ComponentProps & {fields: {imagefield: ImageField;textfield: Field<string>;linkfield: LinkField;datefield: DateField} };
      - include this import : import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs'
      - for every component, define  ComponentProps as type ComponentProps = { rendering: ComponentRendering; params: ComponentParams; }
      - use (props: ComponentNameProps): JSX.Element  instead of React.FC<props>
     

      Most importantly,  your output must only contain converted code with optional CSS module if the user ask for it, don't include any explanations in your responses
      So your output MUST be 
      (Optional CSS module - only if user asked for CSS modules, NOT for styled components) prefixed with a comment /*start css module*/ and ended with /*end css module*/ also add a comment after the prefix with the name of the file, for example /*filename - component.module.css*/
      (First Component) prefixed with a comment /*start first component*/ and ended with /*end first component*/ also add a comment after the prefix with the name of the file, for example /*filename - componentName.tsx*/
      (Second Component) prefixed with a comment /*start second component*/ and ended with /*end second component*/ also add a comment after the prefix with the name of the file, for example /*filename - SitecoreWrapperComponent.tsx*/

      Here is an example of a Hero Banner component that you can use as a reference:
      //First component : FED Component (Sitecore Agnostic)
      import React from 'react';

      interface HeroProps {
        fields: {
          SlideImage: JSX.Element;
          SlideCategory: JSX.Element;
          SlideTitle: JSX.Element;
          SlideContent: JSX.Element;
          SlideLink: JSX.Element;
        };
      }

      const HeroComponent: React.FC<HeroProps> = ({ fields }) => (
        <div>
          <div>
            <div>
              {fields.SlideImage}
            </div>
            <div>
              <div>
                <div>
                  {fields.SlideCategory}
                </div>
                <h2>
                  {fields.SlideTitle}
                </h2>
                <div>
                  {fields.SlideContent}
                </div>
                {fields.SlideLink}
              </div>
            </div>
          </div>
        </div>
      );

      export default HeroComponent;
      //End of first component 


      //Start of second component, Sitecore-jss Hero Wrapper Component
      import {
        Field,
        Image,
        ImageField,
        LinkField,
        RichText,
        Text,
        withDatasourceCheck,
      } from '@sitecore-jss/sitecore-jss-nextjs';
      import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
      import { Link } from '@sitecore-jss/sitecore-jss-react';
      import HeroComponent from './HeroComponent';

      type ComponentProps = { rendering: ComponentRendering; params: ComponentParams };

      type HeroProps = ComponentProps & {
        id: string;
        fields: {
          SlideTitle: Field<string>;
          SlideImage: ImageField;
          SlideLink: LinkField;
          SlideCategory: Field<string>;
          SlidePublishDate: Field<string>;
          SlideContent: Field<string>;
        };
      };

      const SitecoreHeroWrapper = (props: HeroProps): JSX.Element => (
        <HeroComponent
          fields={{
            SlideImage: <Image field={props.fields.SlideImage} />,
            SlideCategory: <Text field={props.fields.SlideCategory} />,
            SlideTitle: <Text field={props.fields.SlideTitle} />,
            SlideContent: <RichText field={props.fields.SlideContent} />,
            SlideLink: <Link field={props.fields.SlideLink} />,
          }}
        />
      );

      export default withDatasourceCheck()<HeroProps>(SitecoreHeroWrapper);
      
    `;

  const messages: Message[] = [
    { role: "user", content: userPrompt },
    { role: "system", content: systemMessage },
  ];

  return messages;
}

export function extractCodeSection(
  completion: string,
  section: string
): { content: string; complete: boolean; filename: string } {
  const startMarker = `/*start ${section}*/`;
  const endMarker = `/*end ${section}*/`;
  let content = completion;
  const startIndex = content.indexOf(startMarker);

  if (startIndex === -1) {
    return { content: "", complete: false, filename: "" };
  }

  content = content.slice(startIndex + startMarker.length);

  // Extract filename
  const filenameMatch = content.match(/\/\*filename - (.*?)\*\//);
  const filename = filenameMatch ? filenameMatch[1].trim() : "";

  // Remove filename comment from content
  content = content.replace(/\/\*filename - .*?\*\//, "").trim();

  const endIndex = content.indexOf(endMarker);

  if (endIndex === -1) {
    return { content: content.trim(), complete: false, filename };
  }

  return {
    content: content.slice(0, endIndex).trim(),
    complete: true,
    filename,
  };
}

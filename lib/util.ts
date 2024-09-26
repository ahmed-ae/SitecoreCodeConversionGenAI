import { promptMessages } from "./PromptMessagesTemplates";

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

    systemMessage =
      "You help to convert C# code written for Sitecore JSS content resolvers into GraphQl Query for XM Cloud \n";
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
  additionalInstructions: string,
  messageHistory: string[],
  framework: string,
  styling: string,
  previouslyGeneratedCode: string
): Message[] {
  let systemMessage = "";
  let userPrompt1 = promptMessages.userMessageDesignPrompt.replaceAll(
    "{PLACEHOLDER_DESIGN_UNIT}",
    "image"
  );
  let userPrompt2 = "";
  let assistantMessage = "";

  const stylingPrompt = GetStylingPromtInstruction(styling);
  if (additionalInstructions && additionalInstructions != "") {
    additionalInstructions += " \n " + stylingPrompt;
  } else {
    additionalInstructions = " \n " + stylingPrompt;
  }

  //If there is previouslyGeneratedCode, we need to create user prompt 1 with custom instructions and message history if available
  if (previouslyGeneratedCode && previouslyGeneratedCode != "") {
    if (
      (customInstructions && customInstructions != "") ||
      (messageHistory && messageHistory.length > 0)
    ) {
      userPrompt1 +=
        "\n Also follow custom instructions delimited by triple backticks, which are directly provided by the user uploading the image ```" +
        customInstructions +
        (messageHistory ? " \n " + messageHistory.join(" \n ") : "") +
        " ```";
    }
  } else {
    //If there is no previouslyGeneratedCode, we need to create user prompt 1 with custom instructions and additional instructions if available
    if (
      (customInstructions && customInstructions != "") ||
      (additionalInstructions && additionalInstructions != "")
    ) {
      userPrompt1 +=
        "\n Also follow custom instructions delimited by triple backticks, which are directly provided by the user uploading the image ```" +
        customInstructions +
        (additionalInstructions ? " \n " + additionalInstructions : "") +
        " ```";
    }
  }

  systemMessage = promptMessages.systemMessageDesignPrompt.replaceAll(
    "{PLACEHOLDER_DESIGN_UNIT}",
    "image"
  );
  if (
    previouslyGeneratedCode &&
    previouslyGeneratedCode != "" &&
    additionalInstructions &&
    additionalInstructions != ""
  ) {
    assistantMessage = previouslyGeneratedCode;
    userPrompt2 = additionalInstructions;
  }

  if (userPrompt2 && assistantMessage) {
    const messages: Message[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt1 },
      { role: "assistant", content: assistantMessage },
      { role: "user", content: userPrompt2 },
    ];

    return messages;
  } else {
    const messages: Message[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt1 },
    ];

    return messages;
  }
}

export function generateDesign2CodePrompt(
  customInstructions: string,
  additionalInstructions: string,
  messageHistory: string[],
  framework: string,
  styling: string,
  json: string,
  previouslyGeneratedCode: string
): Message[] {
  let systemMessage = "";
  let userPrompt1 = promptMessages.userMessageDesignPrompt.replaceAll(
    "{PLACEHOLDER_DESIGN_UNIT}",
    "Figma Design (JSON Format)"
  );
  let userPrompt2 = "";
  let assistantMessage = "";

  const stylingPrompt = GetStylingPromtInstruction(styling);
  if (additionalInstructions && additionalInstructions != "") {
    additionalInstructions += " \n " + stylingPrompt;
  } else {
    additionalInstructions = " \n " + stylingPrompt;
  }

  //If there is previouslyGeneratedCode, we need to create user prompt 1 with custom instructions and message history if available
  if (previouslyGeneratedCode && previouslyGeneratedCode != "") {
    if (
      (customInstructions && customInstructions != "") ||
      (messageHistory && messageHistory.length > 0)
    ) {
      userPrompt1 +=
        "\n Also follow custom instructions delimited by triple backticks, which are directly provided by the user uploading the image ```" +
        customInstructions +
        (messageHistory ? " \n " + messageHistory.join(" \n ") : "") +
        " ```";
    }

    userPrompt1 +=
      "\n Here is the Figma JSON that represent the design: " + json;
  } else {
    //If there is no previouslyGeneratedCode, we need to create user prompt 1 with custom instructions and additional instructions if available
    if (
      (customInstructions && customInstructions != "") ||
      (additionalInstructions && additionalInstructions != "")
    ) {
      userPrompt1 +=
        "\n Also follow custom instructions delimited by triple backticks, which are directly provided by the user uploading the image ```" +
        customInstructions +
        (additionalInstructions ? " \n " + additionalInstructions : "") +
        " ```";
    }
    userPrompt1 +=
      "\n Here is the Figma JSON that represent the design: " + json;
  }

  systemMessage = promptMessages.systemMessageDesignPrompt.replaceAll(
    "Figma Design (JSON Format)",
    "image"
  );
  if (
    previouslyGeneratedCode &&
    previouslyGeneratedCode != "" &&
    additionalInstructions &&
    additionalInstructions != ""
  ) {
    assistantMessage = previouslyGeneratedCode;
    userPrompt2 = additionalInstructions;
  }

  if (userPrompt2 && assistantMessage) {
    const messages: Message[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt1 },
      { role: "assistant", content: assistantMessage },
      { role: "user", content: userPrompt2 },
    ];

    return messages;
  } else {
    const messages: Message[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt1 },
    ];

    return messages;
  }
}

function GetStylingPromtInstruction(styling: string): string {
  switch (styling) {
    case "tailwind":
      return "use tailwind for styling ";
    case "css-modules":
      return "use css modules for styling ";
    case "styled-components":
      return "use styled components for styling ";
    default:
      return "use tailwind for styling ";
  }
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

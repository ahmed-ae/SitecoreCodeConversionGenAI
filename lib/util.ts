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
  customInstructions: string
): Message[] {
  let systemMessage = "";
  let userPrompt = "";

  userPrompt = `Convert the attached image into Sitecore JSS NextJs (TypeScript) Component, your output must only contain converted code, don't include any explanations in your responses`;
  userPrompt += "\n Follow these guidelines'";
  userPrompt +=
    "\n extract the component props from the attached image and assign the right type , follow this as an example -> type ComponentNameProps = ComponentProps & {fields: {imagefield: ImageField;textfield: Field<string>;linkfield: LinkField;datefield: DateField} };";
  userPrompt +=
    "\n include this import : import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs'";
  userPrompt +=
    "\n for every component, define  ComponentProps as type ComponentProps = { rendering: ComponentRendering; params: ComponentParams; }";

  userPrompt +=
    "\n use (props: ComponentNameProps): JSX.Element  instead of React.FC<props>";
  userPrompt +=
    "\n use tailwind library for styling, make sure to produce a responsive design";
  if (customInstructions && customInstructions != "") {
    userPrompt +=
      "\n follow instructions delimited by triple backticks ```" +
      customInstructions +
      " ```";
  }
  systemMessage =
    "Act like an Image to Code converter, where you convert images into Sitecore JSS components written in nextjs/typescript \n";

  const messages: Message[] = [
    { role: "user", content: userPrompt },
    { role: "system", content: systemMessage },
  ];

  return messages;
}

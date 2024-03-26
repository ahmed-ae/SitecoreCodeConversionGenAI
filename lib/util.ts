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

export function generatePromptMessages(
  language: string,
  sourceCode: string
): Message[] {
  let systemMessage = "";
  let userPrompt = "";

  if (language === "scriban") {
    userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must only contain converted code, don't include any explanations in your responses`;

    userPrompt +=
      "\ninclude this import : import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs'";
    userPrompt +=
      "\nfor every component, define  ComponentProps as type ComponentProps = { rendering: ComponentRendering; params: ComponentParams; }";
    userPrompt +=
      "\ndefine your component props like this example, type ComponentNameProps = ComponentProps & {fields: {imagefield: ImageField;textfield: Field<string>;linkfield: LinkField;datefield: DateField} };";
    userPrompt +=
      "\nuse (props: ComponentNameProps): JSX.Element  instead of React.FC<props>";
    userPrompt +=
      "\nif you return any instructions make them as js comment section\nCode:" +
      sourceCode;
    systemMessage =
      "You help to convert code written in Sitecore SXA Scriban into Sitecore JSS Next JS with TypeScript \n";
  } else if (language === "razor") {
    userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must only contain converted code, don't include any explanations in your responses`;

    userPrompt +=
      "\ninclude this import : import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs'";
    userPrompt +=
      "\nfor every component,  define  ComponentProps as type ComponentProps = { rendering: ComponentRendering; params: ComponentParams; }";
    userPrompt +=
      "\ndefine your component props like this example, type ComponentNameProps = ComponentProps & {fields: {imagefield: ImageField;textfield: Field<string>;linkfield: LinkField;datefield: DateField} };";
    userPrompt +=
      "\nuse (props: ComponentNameProps): JSX.Element  instead of React.FC<props>";
    userPrompt +=
      "\nif you return any instructions make them as js comment section\nCode:" +
      sourceCode;
    systemMessage =
      "You help to convert code written in ASP.NET MVC into Sitecore JSS Next JS with TypeScript \n";
  } else if (language === "csharp") {
    userPrompt =
      `Convert the following code into full NextJs with TypeScript, your output must only contain converted code\nCode:` +
      sourceCode;
    systemMessage =
      "You help to convert code written in ASP.NET MVC into NextJS with TypeScript \n";
  }

  const messages: Message[] = [
    { role: "user", content: userPrompt },
    { role: "system", content: systemMessage },
  ];

  return messages;
}
function functionParseCodeResponse(response: any, string: any) {
  throw new Error("Function not implemented.");
}

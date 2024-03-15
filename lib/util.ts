export interface Message {
  role: string;
  content: string;
}

export function generatePromptMessages(
  language: string,
  sourceCode: string
): Message[] {
  let systemMessage = "";
  let userPrompt = "";

  if (language === "scriban") {
    userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must start with the converted code then any instructions comes in code comments format\nuse JSX.Element instead of React.FC<props>\nmake sure the code is well formatted\nif you return any instructions make them as js comment section\nCode:${sourceCode}`;
    systemMessage =
      "You help to convert code written in Sitecore SXA Scriban into Sitecore JSS Next JS with TypeScript \n";
  } else if (language === "razor") {
    userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must start with the converted code then any instructions comes in code comments format\nuse JSX.Element instead of React.FC<props>\nmake sure the code is well formatted\nif you return any instructions make them as js comment section\nCode:${sourceCode}`;
    systemMessage =
      "You help to convert code written in ASP.NET MVC into Sitecore JSS Next JS with TypeScript \n";
  } else if (language === "csharp") {
    userPrompt = `Convert the following code into full NextJs with TypeScript, your output must start with the converted code then any instructions comes in code comments format\nmake sure the code is well formatted\nif you return any instructions make them as js comment section\nCode:${sourceCode}`;
    systemMessage =
      "You help to convert code written in ASP.NET MVC into NextJS with TypeScript \n";
  }

  const messages: Message[] = [
    { role: "user", content: userPrompt },
    { role: "system", content: systemMessage },
  ];

  return messages;
}

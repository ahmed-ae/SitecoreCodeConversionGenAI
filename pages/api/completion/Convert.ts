import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export default async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log(prompt);
    const { language, sourceCode } = JSON.parse(prompt);

    let systemMessage = "";
    let userPrompt = "";
    if (language === "scriban") {
      userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must start with the converted code then any instructions comes in code comments format\nuse JSX.Element instead of React.FC<props>\nmake sure the code is well formatted\nif you retrun any instructions make them as js comment section\nCode:${sourceCode}`;
      systemMessage =
        "You help to convert code written in Sitecore SXA Scriban into Sitecore JSS Next JS with TypeScript \n";
    } else if (language === "razor") {
      userPrompt = `Convert the following code into full Sitecore JSS NextJs with TypeScript, your output must start with the converted code then any instructions comes in code comments format\nuse JSX.Element instead of React.FC<props>\nmake sure the code is well formatted\nif you retrun any instructions make them as js comment section\nCode:${sourceCode}`;
      systemMessage =
        "You help to convert code written in ASP.NET MVC into Sitecore JSS Next JS with TypeScript \n";
    } else if (language === "csharp") {
      userPrompt = `Convert the following code into full  NextJs with TypeScript, your output must start with the converted code then any instructions comes in code comments format\nmake sure the code is well formatted\nif you retrun any instructions make them as js comment section\nCode:${sourceCode}`;
      systemMessage =
        "You help to convert code written in ASP.NET MVC into  NextJS with TypeScript \n";
    }

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
      stream: true,
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "user", content: userPrompt },
        { role: "system", content: systemMessage },
      ],
      temperature: 0.8,
      max_tokens: 4024,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    // Check if the error is an APIError
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      throw error;
    }
  }
}

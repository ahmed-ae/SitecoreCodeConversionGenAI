import { NextResponse } from "next/server";
import { getLanguageModel } from "@/lib/modelProviders";
import { convertImageToCode } from "@/lib/imageToCodeConverter";
import { convertJson } from "@/lib/jsonConverter";
import {
  generateImage2CodePrompt,
  generateDesign2CodePrompt,
} from "@/lib/util";

export const runtime = "edge";
const temperature = Number(process.env.MODEL_TEMPERATURE);
const max_tokens = Number(process.env.MODEL_MAX_TOKENS);

export default async function POST(req: Request) {
  try {
    const { prompt, image, json } = await req.json();
    const {
      model,
      customInstructions,
      additionalInstructions,
      messageHistory,
      framework,
      styling,
      fileType,
      previouslyGeneratedCode,
    } = JSON.parse(prompt);

    const { languageModel, selectedModel } = getLanguageModel(model);

    console.log("Generating Code using " + selectedModel);

    if (fileType === "image") {
      const promptMessages = generateImage2CodePrompt(
        customInstructions,
        additionalInstructions,
        messageHistory,
        framework,
        styling,
        previouslyGeneratedCode
      );

      console.log("system message ----------------", promptMessages[0].content);
      console.log("user message ----------------", promptMessages[1].content);

      if (promptMessages.length > 2) {
        console.log(
          "assistant message ----------------",
          promptMessages[2].content
        );
        console.log(
          "user message 2 ----------------",
          promptMessages[3].content
        );
      }

      const result = await convertImageToCode(
        languageModel,
        max_tokens,
        temperature,
        promptMessages,
        image
      );

      return result.toDataStreamResponse();
    } else if (fileType === "json") {
      const promptMessages = generateDesign2CodePrompt(
        customInstructions,
        additionalInstructions,
        messageHistory,
        framework,
        styling,
        json,
        previouslyGeneratedCode
      );

      console.log("system message ----------------", promptMessages[0].content);
      console.log("user message ----------------", promptMessages[1].content);

      if (promptMessages.length > 2) {
        console.log(
          "assistant message ----------------",
          promptMessages[2].content
        );
        console.log(
          "user message 2 ----------------",
          promptMessages[3].content
        );
      }

      const result = await convertJson(
        languageModel,
        max_tokens,
        temperature,
        promptMessages
      );
      return result.toDataStreamResponse();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

import { generateImage2CodePrompt } from "@/lib/util";

export function generatePromptMessages(
  customInstructions: string,
  additionalInstructions: string,
  messageHistory: any[],
  framework: string,
  styling: string,
  previouslyGeneratedCode: string
) {
  return generateImage2CodePrompt(
    customInstructions,
    additionalInstructions,
    messageHistory,
    framework,
    styling,
    previouslyGeneratedCode
  );
}

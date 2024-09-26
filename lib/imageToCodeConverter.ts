import { LanguageModel, streamText } from "ai";

export async function convertImageToCode(
  languageModel: LanguageModel,
  maxTokens: number,
  temperature: number,
  promptMessages: any[],
  image: string
) {
  if (promptMessages.length === 2) {
    return await streamText({
      model: languageModel,
      maxTokens: maxTokens,
      temperature: temperature,
      messages: [
        {
          role: "system",
          content: promptMessages[0].content,
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        },
        {
          role: "user",
          content: [
            { type: "text", text: promptMessages[1].content },
            { type: "image", image: image },
          ],
        },
      ],
    });
  } else {
    return await streamText({
      model: languageModel,
      maxTokens: maxTokens,
      temperature: temperature,
      messages: [
        {
          role: "system",
          content: promptMessages[0].content,
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        },
        {
          role: "user",
          content: [
            { type: "text", text: promptMessages[1].content },
            { type: "image", image: image },
          ],
        },
        { role: "assistant", content: promptMessages[2].content },
        { role: "user", content: promptMessages[3].content },
      ],
    });
  }
}

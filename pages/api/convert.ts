import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { generatePromptMessages } from "@/lib/util";

// Replace `<Your-OpenAI-Key>` with your actual OpenAI API key
const OPENAI_API_KEY = process.env.OpenAI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { sourceCode, language } = req.body;

      const promtMessages = generatePromptMessages(language, sourceCode);
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-turbo-preview",
          messages: promtMessages,
          temperature: 0.8,
          max_tokens: 4024,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Assuming the API response structure is the same as described in the C# version
      if (response.data.choices && response.data.choices.length > 0) {
        res
          .status(200)
          .json({ code: response.data.choices[0].message.content });
      } else {
        res.status(200).json({ message: "No conversion result" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to convert code \n" + error });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

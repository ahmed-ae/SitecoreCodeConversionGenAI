import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const userId = req.query.userId as string;
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });
    return res.json(
      preferences || {
        language: "scriban",
        model: "claude3sonnet",
        customInstructions: "",
      }
    );
  }

  if (req.method === "POST") {
    console.log("Saving User pref : ", req.body);
    const { userId, language, model, customInstructions } = req.body;
    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: { language, model, customInstructions },
      create: { userId, language, model, customInstructions },
    });
    return res.json(preferences);
  }

  res.status(405).json({ error: "Method not allowed" });
}

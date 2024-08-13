import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
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

  if (req.method === "POST") {
    const { userId, CountUsage, lastCodeUsed } = req.body;
    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: { CountUsage, lastCodeUsed },
      create: {
        userId,
        CountUsage,
        lastCodeUsed,
      },
    });
    return res.json(preferences);
  }

  res.status(405).json({ error: "Method not allowed" });
}

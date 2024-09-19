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

  if (req.method === "GET") {
    const userId = req.query.userId as string;
    //await prisma.userProfile.findUnique
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    return res.json(profile || { githubRepos: [] });
  }

  if (req.method === "POST") {
    const { userId, githubRepos } = req.body;
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { githubRepos },
      create: { userId, githubRepos },
    });
    return res.json(profile);
  }

  res.status(405).json({ error: "Method not allowed" });
}
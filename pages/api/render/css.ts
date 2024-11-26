// api/css.ts
import type { NextApiRequest, NextApiResponse } from "next";
import CleanCSS from "clean-css";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { css } = req.body;

    if (!css) {
      return res.status(400).json({ message: "CSS content is required" });
    }

    // Initialize CleanCSS
    const cleanCSS = new CleanCSS({
      level: 2,
      format: "beautify",
    });

    // Minify and optimize the CSS
    const minifiedResult = cleanCSS.minify(css);

    if (minifiedResult.errors.length > 0) {
      return res.status(400).json({
        message: "CSS processing error",
        errors: minifiedResult.errors,
      });
    }

    // Set headers
    res.setHeader("Content-Type", "text/css");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    // Return the optimized CSS
    return res.status(200).send(minifiedResult.styles);
  } catch (error) {
    console.error("CSS Processing Error:", error);
    return res.status(500).json({
      message: "Error processing CSS",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

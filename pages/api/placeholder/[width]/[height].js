// pages/api/placeholder/[width]/[height].js
import Jimp from "jimp";

export default async function handler(req, res) {
  const { width, height, bgcolor } = req.query;

  // Convert width and height to numbers
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);

  // Parse and validate the background color
  const bgColor = parseColor(bgcolor) || 0xccccccff; // Default to light gray

  // Create a new image
  const image = new Jimp(w, h, bgColor);

  // Add text
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  const text = `${w}x${h}`;
  const textWidth = Jimp.measureText(font, text);
  const textHeight = Jimp.measureTextHeight(font, text, textWidth);

  image.print(font, (w - textWidth) / 2, (h - textHeight) / 2, text);

  // Convert the image to a buffer
  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

  // Set the content type to PNG
  res.setHeader("Content-Type", "image/png");

  // Send the image as the response
  res.send(buffer);
}

// Helper function to parse and validate color
function parseColor(color) {
  if (!color) return null;

  // Remove '#' if present
  color = color.replace(/^#/, "");

  // Handle 3-digit hex
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  // Handle 6-digit hex
  if (color.length === 6 && /^[0-9A-Fa-f]{6}$/.test(color)) {
    return parseInt(color + "FF", 16); // Add alpha channel
  }

  return null;
}

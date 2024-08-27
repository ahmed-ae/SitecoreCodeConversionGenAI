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
  const text = `${w}x${h}`;
  const textColor = 0x000000ff; // Black color

  // Calculate text position (center of the image)
  const textWidth = text.length * 8; // Approximate width (8 pixels per character)
  const textHeight = 16; // Approximate height
  const textX = (w - textWidth) / 2;
  const textY = (h - textHeight) / 2;

  // Draw text pixel by pixel
  for (let y = 0; y < textHeight; y++) {
    for (let x = 0; x < textWidth; x++) {
      if (shouldDrawPixel(x, y, text)) {
        image.setPixelColor(textColor, textX + x, textY + y);
      }
    }
  }

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

// Helper function to determine if a pixel should be drawn for the text
function shouldDrawPixel(x, y, text) {
  const charWidth = 8;
  const charIndex = Math.floor(x / charWidth);
  const char = text[charIndex];
  const xInChar = x % charWidth;

  // Simple pixel representation of characters
  const charPatterns = {
    0: [0x3c, 0x66, 0x66, 0x66, 0x66, 0x66, 0x3c],
    1: [0x18, 0x38, 0x18, 0x18, 0x18, 0x18, 0x7e],
    2: [0x3c, 0x66, 0x06, 0x0c, 0x18, 0x30, 0x7e],
    3: [0x3c, 0x66, 0x06, 0x1c, 0x06, 0x66, 0x3c],
    4: [0x0c, 0x1c, 0x2c, 0x4c, 0x7e, 0x0c, 0x0c],
    5: [0x7e, 0x60, 0x7c, 0x06, 0x06, 0x66, 0x3c],
    6: [0x3c, 0x66, 0x60, 0x7c, 0x66, 0x66, 0x3c],
    7: [0x7e, 0x06, 0x0c, 0x18, 0x30, 0x30, 0x30],
    8: [0x3c, 0x66, 0x66, 0x3c, 0x66, 0x66, 0x3c],
    9: [0x3c, 0x66, 0x66, 0x3e, 0x06, 0x66, 0x3c],
    x: [0x00, 0x66, 0x3c, 0x18, 0x3c, 0x66, 0x00],
  };

  if (!charPatterns[char]) return false;

  return (charPatterns[char][y] & (1 << (7 - xInChar))) !== 0;
}

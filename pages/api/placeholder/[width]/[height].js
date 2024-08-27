// pages/api/placeholder/[width]/[height].js
import { Canvas, loadImage } from "skia-canvas";

export default async function handler(req, res) {
  const { width, height, bgcolor } = req.query;

  // Convert width and height to numbers
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);

  // Create a canvas with the specified dimensions
  const canvas = new Canvas(w, h);
  const ctx = canvas.getContext("2d");

  // Parse and validate the background color
  const bgColor = parseColor(bgcolor) || "#CCCCCC";

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, bgColor);
  gradient.addColorStop(1, lightenColor(bgColor, 20));

  // Fill the background with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Add text
  ctx.fillStyle = "#333333";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${w}x${h}`, w / 2, h / 2);

  // Set the content type to PNG
  res.setHeader("Content-Type", "image/png");

  // Send the image as the response
  const buffer = await canvas.toBuffer("png");
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
    return "#" + color;
  }

  return null;
}

// Helper function to lighten a color
function lightenColor(color, amount) {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

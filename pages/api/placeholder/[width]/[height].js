// pages/api/placeholder/[width]/[height].js
import { createCanvas } from 'canvas';

export default function handler(req, res) {
  const { width, height } = req.query;

  // Convert width and height to numbers
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);

  // Create a canvas with the specified dimensions
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // Fill the background
  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(0, 0, w, h);

  // Add text
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${w}x${h}`, w / 2, h / 2);

  // Set the content type to PNG
  res.setHeader('Content-Type', 'image/png');

  // Send the image as the response
  res.send(canvas.toBuffer());
}
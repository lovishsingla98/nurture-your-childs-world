/**
 * image-generator.ts — Generate 3 Pinterest pin images from blog cover image
 *
 * Uses Sharp to overlay text on the cover image.
 * Called by create-pins.ts — not usually run directly.
 */

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = path.resolve("scripts/distribute/pinterest/images");
const PIN_WIDTH = 1000;
const PIN_HEIGHT = 1500;
const BRAND_COLOR = "#8B5CF6"; // lavender
const MINT_COLOR = "#10B981";

interface PinImageInput {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  pinNumber: number;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current.trim());

  return lines.slice(0, 3); // max 3 lines
}

function createTextSvg(
  title: string,
  slug: string,
  width: number,
  height: number
): Buffer {
  const lines = wrapText(title, 28);
  const lineHeight = 62;
  const startY = height - 300 - (lines.length * lineHeight) / 2;

  const titleLines = lines
    .map(
      (line, i) =>
        `<text x="${width / 2}" y="${startY + i * lineHeight}"
          font-family="Arial, Helvetica, sans-serif" font-weight="bold"
          font-size="48" fill="white" text-anchor="middle"
          stroke="rgba(0,0,0,0.3)" stroke-width="1">${escapeXml(line)}</text>`
    )
    .join("\n");

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Brand bar at top -->
      <rect x="0" y="0" width="${width}" height="120" fill="${BRAND_COLOR}" opacity="0.92"/>
      <text x="${width / 2}" y="75" font-family="Arial, Helvetica, sans-serif"
        font-weight="bold" font-size="36" fill="white" text-anchor="middle">Nurture</text>

      <!-- Title text -->
      ${titleLines}

      <!-- URL at bottom -->
      <text x="${width / 2}" y="${height - 40}"
        font-family="Arial, Helvetica, sans-serif" font-size="22"
        fill="${MINT_COLOR}" text-anchor="middle">nurture.org.in/blog</text>
    </svg>
  `;

  return Buffer.from(svg);
}

function createFallbackSvg(
  title: string,
  slug: string,
  width: number,
  height: number
): Buffer {
  const lines = wrapText(title, 24);
  const lineHeight = 64;
  const startY = height / 2 - (lines.length * lineHeight) / 2 + 60;

  const titleLines = lines
    .map(
      (line, i) =>
        `<text x="${width / 2}" y="${startY + i * lineHeight}"
          font-family="Arial, Helvetica, sans-serif" font-weight="bold"
          font-size="50" fill="#1F2937" text-anchor="middle">${escapeXml(line)}</text>`
    )
    .join("\n");

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="white"/>

      <!-- Brand bar at top -->
      <rect x="0" y="0" width="${width}" height="${height / 3}" fill="${BRAND_COLOR}" opacity="0.08"/>
      <rect x="0" y="0" width="${width}" height="120" fill="${BRAND_COLOR}" opacity="0.92"/>
      <text x="${width / 2}" y="75" font-family="Arial, Helvetica, sans-serif"
        font-weight="bold" font-size="36" fill="white" text-anchor="middle">Nurture</text>

      <!-- Title -->
      ${titleLines}

      <!-- URL at bottom -->
      <text x="${width / 2}" y="${height - 40}"
        font-family="Arial, Helvetica, sans-serif" font-size="22"
        fill="${MINT_COLOR}" text-anchor="middle">nurture.org.in/blog</text>
    </svg>
  `;

  return Buffer.from(svg);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generatePinImage(input: PinImageInput): Promise<string> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(
    OUTPUT_DIR,
    `${input.slug}-pin-${input.pinNumber}.png`
  );

  if (input.coverImageUrl) {
    try {
      // Fetch cover image
      const res = await fetch(input.coverImageUrl);
      const imageBuffer = Buffer.from(await res.arrayBuffer());

      // Resize and crop to pin dimensions
      const resized = await sharp(imageBuffer)
        .resize(PIN_WIDTH, PIN_HEIGHT, { fit: "cover", position: "center" })
        .toBuffer();

      // Create dark overlay
      const overlay = Buffer.from(
        `<svg width="${PIN_WIDTH}" height="${PIN_HEIGHT}">
          <rect x="0" y="0" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" fill="rgba(0,0,0,0.45)"/>
        </svg>`
      );

      // Create text overlay
      const textSvg = createTextSvg(
        input.title,
        input.slug,
        PIN_WIDTH,
        PIN_HEIGHT
      );

      // Composite: image + dark overlay + text
      await sharp(resized)
        .composite([
          { input: overlay, blend: "over" },
          { input: textSvg, blend: "over" },
        ])
        .png()
        .toFile(outputPath);
    } catch (e) {
      console.log(
        `  ⚠  Image fetch failed, using text-only fallback: ${(e as Error).message}`
      );
      // Fallback to text-only pin
      const fallback = createFallbackSvg(
        input.title,
        input.slug,
        PIN_WIDTH,
        PIN_HEIGHT
      );
      await sharp(fallback).png().toFile(outputPath);
    }
  } else {
    // No cover image — generate text-only pin
    const fallback = createFallbackSvg(
      input.title,
      input.slug,
      PIN_WIDTH,
      PIN_HEIGHT
    );
    await sharp(fallback).png().toFile(outputPath);
  }

  return outputPath;
}

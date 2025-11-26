#!/usr/bin/env node
/**
 * Script to generate the 10 video variations for the "Eu ja sabia" routine.
 *
 * Requirements:
 * - ffmpeg and ffprobe must be installed and available on PATH
 * - The base video must exist (default: public/videos/eu-ja-sabia-base.mp4)
 * - A handwriting friendly font file accessible locally
 *
 * Usage examples:
 *   node ./scripts/generate-eu-ja-sabia.mjs
 *   node ./scripts/generate-eu-ja-sabia.mjs --base=./public/videos/raw.mp4 --font="C:/Windows/Fonts/segoesc.ttf"
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import process from 'node:process';

const DIGITS = Array.from({ length: 10 }, (_, index) => index);
const DEFAULT_BASE_VIDEO = path.resolve('public/videos/eu-ja-sabia-base.mp4');
const DEFAULT_OUTPUT_DIR = path.resolve('public/videos/eu-ja-sabia');
const WINDOWS_DEFAULT_FONT = 'C:/Windows/Fonts/segoesc.ttf';
const MAC_DEFAULT_FONT = '/System/Library/Fonts/Supplemental/Noteworthy-Bold.otf';
const LINUX_DEFAULT_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

const argMap = Object.fromEntries(
  process.argv.slice(2).map((raw) => {
    const [key, value = 'true'] = raw.split('=');
    return [key.replace(/^--/, ''), value];
  }),
);

const baseVideo = path.resolve(argMap.base ?? DEFAULT_BASE_VIDEO);
const outputDir = path.resolve(argMap.out ?? DEFAULT_OUTPUT_DIR);
const cropLimit = Number(argMap.limit ?? 24);
const force = argMap.force === 'true';

const defaultFont =
  argMap.font ??
  (process.platform === 'win32'
    ? WINDOWS_DEFAULT_FONT
    : process.platform === 'darwin'
    ? MAC_DEFAULT_FONT
    : LINUX_DEFAULT_FONT);
const fontFile = path.resolve(defaultFont);

const escapeDrawtextValue = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/=/g, '\\=')
    .replace(/'/g, "\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');

const runCommand = (cmd, args, { inheritStdout = false } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (inheritStdout) process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (inheritStdout) process.stderr.write(text);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${cmd} exited with code ${code}\n${stderr}`));
      }
    });
  });

const ensurePath = async (targetPath) => {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.access(targetPath);
};

const ensureBaseVideo = async () => {
  try {
    await fs.access(baseVideo);
  } catch {
    throw new Error(`Base video not found at ${baseVideo}`);
  }
};

const ensureFont = async () => {
  try {
    await fs.access(fontFile);
  } catch {
    throw new Error(
      `Font file not found at ${fontFile}. Use --font=./path/to/font.ttf to provide a valid handwriting font.`,
    );
  }
};

const detectFrameSize = async () => {
  const { stdout } = await runCommand('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=s=x:p=0',
    baseVideo,
  ]);

  const [width, height] = stdout.trim().split('x').map(Number);
  if (!width || !height) {
    throw new Error('Unable to read frame size using ffprobe.');
  }

  return { width, height };
};

const detectSheetBounds = async () => {
  const { stderr } = await runCommand('ffmpeg', [
    '-hide_banner',
    '-i',
    baseVideo,
    '-frames:v',
    '120',
    '-vf',
    `cropdetect=limit=${cropLimit}:round=2`,
    '-f',
    'null',
    '-',
  ]);

  const cropMatches = [...stderr.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)];
  if (!cropMatches.length) {
    throw new Error(
      'ffmpeg cropdetect could not find a white sheet. Try adjusting --limit=15 or ensure the clip shows a white page.',
    );
  }

  const [, width, height, x, y] = cropMatches[cropMatches.length - 1];
  return {
    width: Number(width),
    height: Number(height),
    x: Number(x),
    y: Number(y),
  };
};

const buildDrawTextParams = (sheetBounds) => {
  const fontSize = Math.round(sheetBounds.height * 0.75);
  const strokeWidth = Math.max(2, Math.round(sheetBounds.height * 0.02));
  const xExpression = `${sheetBounds.x}+(${sheetBounds.width}-text_w)/2`;
  const yExpression = `${sheetBounds.y}+(${sheetBounds.height}-text_h)/2`;

  return {
    fontSize,
    strokeWidth,
    xExpression,
    yExpression,
  };
};

const generateVideo = async (digit, sheetBounds) => {
  const outputFile = path.join(outputDir, `eu-ja-sabia-${digit}.mp4`);
  if (!force) {
    try {
      await fs.access(outputFile);
      console.log(`Skipping digit ${digit} (file already exists). Use --force=true to overwrite.`);
      return { digit, file: path.basename(outputFile), skipped: true };
    } catch {
      // continue
    }
  }

  await fs.mkdir(outputDir, { recursive: true });
  const { fontSize, strokeWidth, xExpression, yExpression } = buildDrawTextParams(sheetBounds);
  const escapedFont = escapeDrawtextValue(fontFile);

  const drawTextFilter = [
    `drawtext=fontfile='${escapedFont}'`,
    `text='${digit}'`,
    `fontsize=${fontSize}`,
    'fontcolor=0x1b150f@0.95',
    `x=${xExpression}`,
    `y=${yExpression}`,
    `borderw=${strokeWidth}`,
    'bordercolor=0xffffff@0.25',
    'shadowx=2',
    'shadowy=2',
    'shadowcolor=0x000000@0.25',
  ].join(':');

  console.log(`Rendering digit ${digit} -> ${outputFile}`);

  await runCommand(
    'ffmpeg',
    [
      '-y',
      '-i',
      baseVideo,
      '-vf',
      drawTextFilter,
      '-c:v',
      'libx264',
      '-preset',
      argMap.preset ?? 'slow',
      '-crf',
      argMap.crf ?? '18',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'copy',
      outputFile,
    ],
    { inheritStdout: true },
  );

  return { digit, file: path.basename(outputFile), skipped: false };
};

const writeMetadata = async ({ frame, sheetBounds, versions }) => {
  const metadataPath = path.join(outputDir, 'metadata.json');
  const metadata = {
    sourceVideo: path.relative(process.cwd(), baseVideo),
    generatedAt: new Date().toISOString(),
    frame,
    sheetBounds,
    versions,
  };

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`Metadata saved to ${metadataPath}`);
};

const main = async () => {
  try {
    await ensurePath(baseVideo);
    await ensureFont();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const frame = await detectFrameSize();
  const sheetBounds = await detectSheetBounds();

  console.log(
    `Detected sheet area ${sheetBounds.width}x${sheetBounds.height} at (${sheetBounds.x}, ${sheetBounds.y}) inside ${frame.width}x${frame.height}`,
  );

  const versions = [];
  for (const digit of DIGITS) {
    try {
      const result = await generateVideo(digit, sheetBounds);
      versions.push({ digit, file: result.file, skipped: result.skipped });
    } catch (error) {
      console.error(`Failed to render digit ${digit}:`, error.message);
      process.exitCode = 1;
      return;
    }
  }

  await writeMetadata({ frame, sheetBounds, versions });

  console.log('All digit videos generated successfully.');
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 * Generates app icons and splash assets from SVG sources.
 * Run: node scripts/generate-brand-assets.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const brandDir = path.join(root, 'assets', 'brand');
const logoSvg = path.join(brandDir, 'logo.svg');
const logoTransparentSvg = path.join(brandDir, 'logo-transparent.svg');

const IOS_ICON_SIZES = [
  { name: 'Icon-App-20x20@2x.png', size: 40 },
  { name: 'Icon-App-20x20@3x.png', size: 60 },
  { name: 'Icon-App-29x29@2x.png', size: 58 },
  { name: 'Icon-App-29x29@3x.png', size: 87 },
  { name: 'Icon-App-40x40@2x.png', size: 80 },
  { name: 'Icon-App-40x40@3x.png', size: 120 },
  { name: 'Icon-App-60x60@2x.png', size: 120 },
  { name: 'Icon-App-60x60@3x.png', size: 180 },
  { name: 'Icon-App-1024x1024@1x.png', size: 1024 },
];

const ANDROID_MIPMAP_SIZES = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const ANDROID_FOREGROUND_SIZES = [
  { folder: 'drawable-mdpi', size: 108 },
  { folder: 'drawable-hdpi', size: 162 },
  { folder: 'drawable-xhdpi', size: 216 },
  { folder: 'drawable-xxhdpi', size: 324 },
  { folder: 'drawable-xxxhdpi', size: 432 },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function renderPng(svgPath, size, outPath) {
  const svg = await fs.readFile(svgPath);
  await sharp(svg, { density: Math.max(72, Math.ceil((size / 1024) * 300)) })
    .resize(size, size)
    .png()
    .toFile(outPath);
}

async function generateIosIcons() {
  const iconDir = path.join(
    root,
    'ios',
    'WOS_Assigment',
    'Images.xcassets',
    'AppIcon.appiconset',
  );
  await ensureDir(iconDir);

  for (const { name, size } of IOS_ICON_SIZES) {
    await renderPng(logoSvg, size, path.join(iconDir, name));
  }

  const contents = {
    images: [
      { filename: 'Icon-App-20x20@2x.png', idiom: 'iphone', scale: '2x', size: '20x20' },
      { filename: 'Icon-App-20x20@3x.png', idiom: 'iphone', scale: '3x', size: '20x20' },
      { filename: 'Icon-App-29x29@2x.png', idiom: 'iphone', scale: '2x', size: '29x29' },
      { filename: 'Icon-App-29x29@3x.png', idiom: 'iphone', scale: '3x', size: '29x29' },
      { filename: 'Icon-App-40x40@2x.png', idiom: 'iphone', scale: '2x', size: '40x40' },
      { filename: 'Icon-App-40x40@3x.png', idiom: 'iphone', scale: '3x', size: '40x40' },
      { filename: 'Icon-App-60x60@2x.png', idiom: 'iphone', scale: '2x', size: '60x60' },
      { filename: 'Icon-App-60x60@3x.png', idiom: 'iphone', scale: '3x', size: '60x60' },
      {
        filename: 'Icon-App-1024x1024@1x.png',
        idiom: 'ios-marketing',
        scale: '1x',
        size: '1024x1024',
      },
    ],
    info: { author: 'xcode', version: 1 },
  };

  await fs.writeFile(
    path.join(iconDir, 'Contents.json'),
    `${JSON.stringify(contents, null, 2)}\n`,
  );
}

async function generateIosSplashLogo() {
  const splashDir = path.join(
    root,
    'ios',
    'WOS_Assigment',
    'Images.xcassets',
    'SplashLogo.imageset',
  );
  await ensureDir(splashDir);

  const sizes = [
    { name: 'splash-logo.png', size: 200 },
    { name: 'splash-logo@2x.png', size: 400 },
    { name: 'splash-logo@3x.png', size: 600 },
  ];

  for (const { name, size } of sizes) {
    await renderPng(logoTransparentSvg, size, path.join(splashDir, name));
  }

  const contents = {
    images: [
      { filename: 'splash-logo.png', idiom: 'universal', scale: '1x' },
      { filename: 'splash-logo@2x.png', idiom: 'universal', scale: '2x' },
      { filename: 'splash-logo@3x.png', idiom: 'universal', scale: '3x' },
    ],
    info: { author: 'xcode', version: 1 },
  };

  await fs.writeFile(
    path.join(splashDir, 'Contents.json'),
    `${JSON.stringify(contents, null, 2)}\n`,
  );
}

async function generateAndroidIcons() {
  const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

  for (const { folder, size } of ANDROID_MIPMAP_SIZES) {
    const dir = path.join(resDir, folder);
    await ensureDir(dir);
    await renderPng(logoSvg, size, path.join(dir, 'ic_launcher.png'));
    await renderPng(logoSvg, size, path.join(dir, 'ic_launcher_round.png'));
  }

  for (const { folder, size } of ANDROID_FOREGROUND_SIZES) {
    const dir = path.join(resDir, folder);
    await ensureDir(dir);
    await renderPng(logoTransparentSvg, size, path.join(dir, 'ic_launcher_foreground.png'));
  }

  await renderPng(logoTransparentSvg, 288, path.join(resDir, 'drawable', 'splash_logo.png'));
  await renderPng(logoTransparentSvg, 576, path.join(resDir, 'drawable-xxhdpi', 'splash_logo.png'));
}

async function main() {
  await generateIosIcons();
  await generateIosSplashLogo();
  await generateAndroidIcons();
  console.log('Brand assets generated successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

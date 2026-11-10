import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = path.resolve('public/items');

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generateGrassRug() {
  console.log('Generating Grass Rug...');
  const rawBuf = await fetchBuffer('https://images.unsplash.com/photo-1633320617719-b1650b7390b6?auto=format&fit=crop&w=1200&q=85');
  const base64 = rawBuf.toString('base64');
  const mime = 'image/jpeg';

  const w = 1000;
  const h = 340;

  // Trapezoid perspective coordinates
  // Top: x=140 to x=860 (width=720), y=26
  // Bottom: x=25 to x=975 (width=950), y=308
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <filter id="grassShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.32"/>
        </filter>
        <clipPath id="grassTrapezoid">
          <polygon points="140,26 860,26 975,308 25,308"/>
        </clipPath>
        <linearGradient id="grassDepth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#052e16" stop-opacity="0.28"/>
          <stop offset="45%" stop-color="#000000" stop-opacity="0.0"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.14"/>
        </linearGradient>
      </defs>

      <!-- Soft floor contact shadow -->
      <polygon points="140,26 860,26 975,308 25,308" fill="#000" filter="url(#grassShadow)"/>

      <!-- Turf base thickness on floor -->
      <polygon points="25,308 975,308 975,313 25,313" fill="#14532d"/>

      <!-- Realistic grass texture mapped to perspective trapezoid -->
      <g clip-path="url(#grassTrapezoid)">
        <image href="data:${mime};base64,${base64}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>
        <!-- 2.5D ambient depth gradient -->
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#grassDepth)"/>
      </g>
    </svg>
  `;

  const webpBuf = await sharp(Buffer.from(svg))
    .webp({ quality: 90, effort: 6 })
    .toBuffer();

  const outPath = path.join(OUTPUT_DIR, 'tapete-realista-grama.webp');
  await fs.writeFile(outPath, webpBuf);
  console.log('Saved:', outPath, `${(webpBuf.length / 1024).toFixed(1)} KB`);
}

async function generateWoodDeckRug() {
  console.log('Generating Wood Deck Rug...');
  const rawBuf = await fetchBuffer('https://images.unsplash.com/photo-1504979128236-23f86972356c?auto=format&fit=crop&w=1200&q=85');
  const base64 = rawBuf.toString('base64');
  const mime = 'image/jpeg';

  const w = 1000;
  const h = 340;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <filter id="deckShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.32"/>
        </filter>
        <clipPath id="deckTrapezoid">
          <polygon points="140,26 860,26 975,308 25,308"/>
        </clipPath>
        <linearGradient id="deckDepth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1c1917" stop-opacity="0.25"/>
          <stop offset="50%" stop-color="#000000" stop-opacity="0.0"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.12"/>
        </linearGradient>
      </defs>

      <!-- Floor shadow -->
      <polygon points="140,26 860,26 975,308 25,308" fill="#000" filter="url(#deckShadow)"/>

      <!-- Front bevel/edge of wooden deck -->
      <polygon points="25,308 975,308 975,314 25,314" fill="#451a03"/>
      <polygon points="25,308 975,308 975,309 25,309" fill="#78350f" opacity="0.8"/>

      <!-- Texture -->
      <g clip-path="url(#deckTrapezoid)">
        <image href="data:${mime};base64,${base64}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#deckDepth)"/>
      </g>
    </svg>
  `;

  const webpBuf = await sharp(Buffer.from(svg))
    .webp({ quality: 90, effort: 6 })
    .toBuffer();

  const outPath = path.join(OUTPUT_DIR, 'tapete-realista-deck-madeira.webp');
  await fs.writeFile(outPath, webpBuf);
  console.log('Saved:', outPath, `${(webpBuf.length / 1024).toFixed(1)} KB`);
}

async function generateSheepskinRug() {
  console.log('Generating Sheepskin Plush Rug...');
  const rawBuf = await fetchBuffer('https://images.unsplash.com/photo-1642752054841-23ca828680d1?auto=format&fit=crop&w=1200&q=85');
  const base64 = rawBuf.toString('base64');
  const mime = 'image/jpeg';

  const w = 700;
  const h = 320;

  // Organic fluffy cloud / sheepskin fleece perimeter in 2.5D perspective
  const fleecePath = `
    M 85,160
    C 75,130 90,95 125,75
    C 160,55 210,50 250,58
    C 290,40 350,38 410,48
    C 470,38 520,50 560,70
    C 605,92 630,125 620,155
    C 630,185 615,220 575,245
    C 530,272 470,278 420,268
    C 370,282 310,285 260,274
    C 200,282 150,268 115,242
    C 80,215 70,185 85,160 Z
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <filter id="fleeceShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0f172a" flood-opacity="0.26"/>
        </filter>
        <clipPath id="fleeceClip">
          <path d="${fleecePath}"/>
        </clipPath>
        <radialGradient id="fleeceLight" cx="48%" cy="42%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.0"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.12"/>
        </radialGradient>
      </defs>

      <!-- Floor shadow -->
      <path d="${fleecePath}" fill="#000" filter="url(#fleeceShadow)"/>

      <!-- Texture -->
      <g clip-path="url(#fleeceClip)">
        <image href="data:${mime};base64,${base64}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#fleeceLight)"/>
      </g>
    </svg>
  `;

  const webpBuf = await sharp(Buffer.from(svg))
    .webp({ quality: 90, effort: 6 })
    .toBuffer();

  const outPath = path.join(OUTPUT_DIR, 'tapete-realista-pelego-branco.webp');
  await fs.writeFile(outPath, webpBuf);
  console.log('Saved:', outPath, `${(webpBuf.length / 1024).toFixed(1)} KB`);
}

async function generateJuteMandalaRug() {
  console.log('Generating Jute Mandala Rug...');
  const rawBuf = await fetchBuffer('https://images.unsplash.com/photo-1762758889413-64d717f81b0d?auto=format&fit=crop&w=1200&q=85');
  const base64 = rawBuf.toString('base64');
  const mime = 'image/jpeg';

  const w = 700;
  const h = 320;

  // Ellipse in 2.5D perspective
  const cx = 350;
  const cy = 160;
  const rx = 310;
  const ry = 132;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <filter id="juteShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.28"/>
        </filter>
        <clipPath id="juteClip">
          <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
        </clipPath>
        <radialGradient id="juteLight" cx="48%" cy="42%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.0"/>
          <stop offset="100%" stop-color="#451a03" stop-opacity="0.22"/>
        </radialGradient>
      </defs>

      <!-- Floor shadow -->
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" filter="url(#juteShadow)"/>

      <!-- Texture -->
      <g clip-path="url(#juteClip)">
        <image href="data:${mime};base64,${base64}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#juteLight)"/>
      </g>

      <!-- Subtle natural fiber stitched rim -->
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 3}" ry="${ry - 2}" fill="none" stroke="#d97706" stroke-width="1.8" stroke-dasharray="6,3" opacity="0.6"/>
    </svg>
  `;

  const webpBuf = await sharp(Buffer.from(svg))
    .webp({ quality: 90, effort: 6 })
    .toBuffer();

  const outPath = path.join(OUTPUT_DIR, 'tapete-realista-mandala-juta.webp');
  await fs.writeFile(outPath, webpBuf);
  console.log('Saved:', outPath, `${(webpBuf.length / 1024).toFixed(1)} KB`);
}

async function main() {
  try {
    await generateGrassRug();
    await generateWoodDeckRug();
    await generateSheepskinRug();
    await generateJuteMandalaRug();
    console.log('All realistic rugs generated successfully!');
  } catch (err) {
    console.error('Error generating rugs:', err);
    process.exit(1);
  }
}

main();

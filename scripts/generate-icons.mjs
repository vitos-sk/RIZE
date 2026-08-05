// Генератор иконок приложения: один SVG-исходник → PNG всех размеров + favicon.ico.
// Запуск: node scripts/generate-icons.mjs
//
// Иконка нарисована в бумажной теме проекта: тёмный лист (--color-paper) с
// перфорацией блокнота и линовкой, поверх — галочка зелёными чернилами
// (--color-ink-green). Цвета берутся из globals.css, менять их надо в обоих местах.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CANVAS = "#1a1512"; // --paper-canvas-color
const PAPER = "#2f2823"; // --color-paper
const LINE = "#4a413a"; // --color-paper-line
const GREEN = "#8fb87a"; // --color-ink-green

/**
 * @param {object} options
 * @param {number} options.radius   скругление внешнего квадрата (0 — под маску Android)
 * @param {number} options.scale    масштаб контента: у maskable-иконки края съедает маска,
 *                                  поэтому лист ужимается в safe zone (внутренние 80%)
 */
function buildSvg({ radius, scale }) {
  const holes = [130, 232, 334, 436]
    .map(
      (cy) =>
        `<circle cx="74" cy="${cy}" r="15" fill="${CANVAS}" fill-opacity="0.85" />`,
    )
    .join("\n      ");

  const rules = [168, 264, 360]
    .map(
      (y) =>
        `<path d="M150 ${y} H440" stroke="${LINE}" stroke-width="4" stroke-linecap="round" />`,
    )
    .join("\n      ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="${CANVAS}" />
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
      <rect x="18" y="18" width="476" height="476" rx="${Math.max(radius - 18, 16)}" fill="${PAPER}" />
      <path d="M60 26 H452" stroke="#fff6e6" stroke-opacity="0.1" stroke-width="5" stroke-linecap="round" />
      ${holes}
      <path d="M112 74 V438" stroke="${LINE}" stroke-width="4" stroke-linecap="round" />
      ${rules}
      <g transform="rotate(-4 280 262)">
        <path d="M152 284 L242 374 L412 142" fill="none" stroke="#000" stroke-opacity="0.28"
              stroke-width="48" stroke-linecap="round" stroke-linejoin="round"
              transform="translate(0 7)" />
        <path d="M152 284 L242 374 L412 142" fill="none" stroke="${GREEN}"
              stroke-width="46" stroke-linecap="round" stroke-linejoin="round" />
      </g>
  </g>
</svg>
`;
}

/** ICO-контейнер с PNG внутри (формат Vista+, понимают все актуальные браузеры). */
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // одна картинка

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // ширина (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // высота
  entry.writeUInt8(0, 2); // палитра не используется
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // бит на пиксель
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

const roundedSvg = buildSvg({ radius: 104, scale: 1 });
const maskableSvg = buildSvg({ radius: 0, scale: 0.78 });
const squareSvg = buildSvg({ radius: 0, scale: 1 });

const render = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

await mkdir(path.join(root, "public"), { recursive: true });

const write = (file, data) => writeFile(path.join(root, file), data);

await write("public/app-icon.svg", roundedSvg);
await write("public/icon-192.png", await render(roundedSvg, 192));
await write("public/icon-512.png", await render(roundedSvg, 512));
await write("public/icon-maskable-512.png", await render(maskableSvg, 512));
// iOS сам скругляет apple-touch-icon и не умеет прозрачность — отдаём полный квадрат.
await write("public/apple-touch-icon.png", await render(squareSvg, 180));
await write("src/app/favicon.ico", pngToIco(await render(roundedSvg, 64), 64));

console.log("Иконки сгенерированы.");

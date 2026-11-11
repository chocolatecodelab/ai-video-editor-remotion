import { bundle } from "@remotion/bundler";
import { ensureBrowser, openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));

const serveUrl = await bundle({
  entryPoint: path.join(DIR, "src", "index.ts"),
  rootDir: DIR,
  enableCaching: true,
});

await ensureBrowser();
const browser = await openBrowser("chrome", {
  logLevel: "error",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
});

const items = [
  { id: "ValidasiBadge", frame: 45, out: "../efek/pratinjau/validasi-badge.png" },
  { id: "LayerExplosion", frame: 40, out: "../efek/pratinjau/layer-explosion.png" },
];

for (const item of items) {
  console.log(`Rendering ${item.id}...`);
  const composition = await selectComposition({
    serveUrl,
    id: item.id,
    puppeteerInstance: browser,
  });
  await renderStill({
    composition,
    serveUrl,
    puppeteerInstance: browser,
    output: path.resolve(DIR, item.out),
    frame: item.frame,
    imageFormat: "png",
    scale: 1,
  });
  console.log(`Done ${item.id} -> ${item.out}`);
}

await browser.close();
process.exit(0);

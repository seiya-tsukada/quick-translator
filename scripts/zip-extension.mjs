/**
 * Package chrome-extension/ (and nothing else) into dist/quicklens-translator-v<version>.zip
 * Fails if package.json and manifest.json versions differ.
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const extDir = path.join(root, "chrome-extension");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(path.join(extDir, "manifest.json"), "utf8"));

if (pkg.version !== manifest.version) {
  console.error(`Version mismatch: package.json ${pkg.version} != manifest.json ${manifest.version}`);
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith(".")) return [];
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const zip = new JSZip();
const files = walk(extDir);
for (const file of files) {
  zip.file(path.relative(extDir, file).split(path.sep).join("/"), readFileSync(file), { date: new Date("2000-01-01T00:00:00Z") });
}

const outDir = path.join(root, "dist");
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `quicklens-translator-v${manifest.version}.zip`);
writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
console.log(`${path.relative(root, out)} (${files.length} files)`);

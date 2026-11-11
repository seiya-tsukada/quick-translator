import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { EXT_DIR, loadExtension, CORE } from "./helpers.js";

const read = (loc) => JSON.parse(readFileSync(path.join(EXT_DIR, "_locales", loc, "messages.json"), "utf8"));
const en = read("en");
const ja = read("ja");

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (f === "_locales") return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test("ja and en messages.json have exactly the same keys", () => {
  assert.deepEqual(Object.keys(ja).sort(), Object.keys(en).sort());
});

test("placeholders match between locales", () => {
  for (const key of Object.keys(en)) {
    assert.deepEqual(Object.keys(ja[key].placeholders || {}).sort(), Object.keys(en[key].placeholders || {}).sort(), key);
  }
});

test("every message key referenced in the extension exists", () => {
  const used = new Set();
  for (const file of walk(EXT_DIR)) {
    if (!/\.(js|html|json)$/.test(file)) continue;
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/\bt\(\s*"([A-Za-z0-9_]+)"/g)) used.add(m[1]);
    for (const m of src.matchAll(/getMessage\(\s*"([A-Za-z0-9_]+)"/g)) used.add(m[1]);
    for (const m of src.matchAll(/data-i18n="([A-Za-z0-9_]+)"/g)) used.add(m[1]);
    for (const m of src.matchAll(/data-i18n-attr="([^"]+)"/g)) {
      m[1].split(";").forEach((pair) => pair.split(":")[1] && used.add(pair.split(":")[1].trim()));
    }
    for (const m of src.matchAll(/__MSG_([A-Za-z0-9_]+)__/g)) used.add(m[1]);
  }
  // Dynamically built keys
  const g = loadExtension(CORE);
  const cfg = g.QUICKLENS_CONFIG;
  Object.keys(g.QuickLensErrors.CODES).forEach((c) => { used.add(`error_${c}`); used.add(`reason_${c}`); });
  cfg.ENGINES.forEach((e) => used.add(`engine_${e}`));
  cfg.TONES.forEach((tone) => used.add(`tone_${tone}`));
  cfg.AI_ENGINES.forEach((e) => used.add(`keyLabel_${e}`));

  const missing = [...used].filter((k) => !(k in en));
  assert.deepEqual(missing, []);
});

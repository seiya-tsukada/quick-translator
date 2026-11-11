import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { EXT_DIR } from "./helpers.js";

const manifest = JSON.parse(readFileSync(path.join(EXT_DIR, "manifest.json"), "utf8"));
const pkg = JSON.parse(readFileSync(path.join(EXT_DIR, "..", "package.json"), "utf8"));

test("no <all_urls> host permissions and no static content scripts", () => {
  assert.equal(manifest.content_scripts, undefined);
  const hosts = [...(manifest.host_permissions || []), ...(manifest.optional_host_permissions || [])];
  assert.ok(!hosts.includes("<all_urls>"));
  assert.ok(!hosts.some((h) => h.includes("*://*/") || h === "https://*/*"));
  assert.equal(manifest.host_permissions, undefined);
});

test("AI provider domains are optional, not required", () => {
  assert.deepEqual([...manifest.optional_host_permissions].sort(), [
    "https://api-free.deepl.com/*",
    "https://api.deepl.com/*",
    "https://api.openai.com/*",
    "https://generativelanguage.googleapis.com/*"
  ]);
});

test("manifest version matches package.json", () => {
  assert.equal(manifest.version, pkg.version);
});

test("i18n manifest fields and default locale", () => {
  assert.equal(manifest.default_locale, "en");
  assert.equal(manifest.name, "__MSG_extName__");
  assert.equal(manifest.description, "__MSG_extDescription__");
  const en = JSON.parse(readFileSync(path.join(EXT_DIR, "_locales/en/messages.json"), "utf8"));
  const ja = JSON.parse(readFileSync(path.join(EXT_DIR, "_locales/ja/messages.json"), "utf8"));
  assert.ok(en.extDescription.message.length <= 132);
  assert.ok(ja.extDescription.message.length <= 132);
});

test("translate-selection command defaults to Alt+T", () => {
  assert.equal(manifest.commands["translate-selection"].suggested_key.default, "Alt+T");
});

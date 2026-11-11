/**
 * Load classic extension scripts (which assign onto globalThis) into an isolated VM context.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

export const EXT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "chrome-extension");

export function loadExtension(files, extraGlobals = {}) {
  const sandbox = {
    console,
    AbortSignal,
    setTimeout,
    clearTimeout,
    URL,
    TextEncoder,
    TextDecoder,
    ...extraGlobals
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  const context = vm.createContext(sandbox);
  for (const file of files) {
    const code = readFileSync(path.join(EXT_DIR, file), "utf8");
    vm.runInContext(code, context, { filename: file });
  }
  return sandbox;
}

export const CORE = ["config.js", "lib/errors.js", "lib/languages.js"];

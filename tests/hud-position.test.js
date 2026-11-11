import { test } from "node:test";
import assert from "node:assert/strict";
import { loadExtension } from "./helpers.js";

const { computeNearSelection: place } = loadExtension(["lib/hud-position.js"]).QuickLensHudPosition;
const base = { viewport: { width: 1200, height: 800 }, hudWidth: 380, hudHeight: 220, margin: 12, gap: 8 };

test("below the selection when there is room", () => {
  const p = place({ ...base, rect: { left: 100, top: 100, right: 300, bottom: 120 } });
  assert.equal(p.left, 100);
  assert.equal(p.top, 128);
});

test("above the selection near the bottom edge", () => {
  const p = place({ ...base, rect: { left: 100, top: 700, right: 300, bottom: 720 } });
  assert.equal(p.top, 700 - 8 - 220);
});

test("clamped horizontally inside the viewport", () => {
  const p = place({ ...base, rect: { left: 1150, top: 100, right: 1190, bottom: 120 } });
  assert.equal(p.left, 1200 - 380 - 12);
  const q = place({ ...base, rect: { left: -50, top: 100, right: 10, bottom: 120 } });
  assert.equal(q.left, 12);
});

test("clamped vertically when the HUD is taller than the free space", () => {
  const p = place({ ...base, viewport: { width: 1200, height: 300 }, rect: { left: 10, top: 140, right: 50, bottom: 160 } });
  assert.ok(p.top >= 12 && p.top + 220 <= 300 - 12 || p.top === 12);
});

test("narrow viewport keeps the left margin", () => {
  const p = place({ ...base, viewport: { width: 360, height: 640 }, rect: { left: 200, top: 50, right: 300, bottom: 70 } });
  assert.equal(p.left, 12);
});

test("no rect → corner fallback", () => {
  assert.equal(place({ ...base, rect: null }), null);
  assert.equal(place({ ...base, rect: { left: 0, top: 0, right: 0, bottom: 0 } }), null);
});

test("zero-size viewport (hidden tab) → corner fallback", () => {
  assert.equal(place({ ...base, viewport: { width: 0, height: 0 }, rect: { left: 40, top: 98, right: 500, bottom: 116 } }), null);
});

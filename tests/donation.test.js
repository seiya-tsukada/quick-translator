import { test } from "node:test";
import assert from "node:assert/strict";
import { loadExtension } from "./helpers.js";

const g = loadExtension(["config.js", "lib/usage.js"]);
const { shouldShowDonationPrompt: show } = g.QuickLensUsage;
const { DONATION_PROMPT_THRESHOLD, DONATION_SNOOZE_DAYS } = g.QUICKLENS_CONFIG;
const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 10, 11);
const url = "https://example.org/support";

test("defaults: shown from 50 translations, snoozed for 90 days", () => {
  assert.equal(DONATION_PROMPT_THRESHOLD, 50);
  assert.equal(DONATION_SNOOZE_DAYS, 90);
});

test("hidden below the threshold, shown at the threshold", () => {
  assert.equal(show({ count: 49, dismissedAt: null, now, url }), false);
  assert.equal(show({ count: 50, dismissedAt: null, now, url }), true);
  assert.equal(show({ count: 500, dismissedAt: null, now, url }), true);
});

test("dismissal hides it for 90 days, then it may show again", () => {
  assert.equal(show({ count: 80, dismissedAt: now - 1 * DAY, now, url }), false);
  assert.equal(show({ count: 80, dismissedAt: now - 89 * DAY, now, url }), false);
  assert.equal(show({ count: 80, dismissedAt: now - 90 * DAY, now, url }), true);
});

test("never shown without a donation URL", () => {
  assert.equal(show({ count: 1000, dismissedAt: null, now, url: "" }), false);
});

test("bad stored values do not show it", () => {
  assert.equal(show({ count: undefined, dismissedAt: null, now, url }), false);
  assert.equal(show({ count: "abc", dismissedAt: null, now, url }), false);
});

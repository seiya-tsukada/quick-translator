/**
 * QuickLens - HUD placement (pure, unit-tested)
 */

(() => {
  if (globalThis.QuickLensHudPosition) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  /**
   * Place the HUD near the selection: below it when there is room, otherwise above,
   * and always clamped inside the viewport.
   * @param {{rect: {left:number, top:number, bottom:number, right:number}|null,
   *          viewport: {width:number, height:number}, hudWidth:number, hudHeight:number,
   *          margin:number, gap:number}} p
   * @returns {{left:number, top:number} | null} null → use the corner position
   */
  function computeNearSelection({ rect, viewport, hudWidth, hudHeight, margin, gap }) {
    if (!rect || (rect.left === 0 && rect.top === 0 && rect.right === 0 && rect.bottom === 0)) return null;
    if (!(viewport.width > margin * 2) || !(viewport.height > margin * 2)) return null; // no layout info
    const width = Math.min(hudWidth, viewport.width - margin * 2);
    const maxLeft = Math.max(margin, viewport.width - width - margin);
    const maxTop = Math.max(margin, viewport.height - hudHeight - margin);

    const left = clamp(rect.left, margin, maxLeft);
    const spaceBelow = viewport.height - rect.bottom - gap - margin;
    const spaceAbove = rect.top - gap - margin;
    let top;
    if (spaceBelow >= hudHeight || spaceBelow >= spaceAbove) {
      top = rect.bottom + gap;
    } else {
      top = rect.top - gap - hudHeight;
    }
    return { left: Math.round(left), top: Math.round(clamp(top, margin, maxTop)) };
  }

  globalThis.QuickLensHudPosition = Object.freeze({ computeNearSelection });
})();

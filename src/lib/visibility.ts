const MIN_VISIBLE = 0.6;

type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };

export function isTabReachable(rect: Box, viewportWidth: number, viewportHeight: number): boolean {
  const w = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
  const h = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
  return (w * h) / (rect.width * rect.height) >= MIN_VISIBLE;
}

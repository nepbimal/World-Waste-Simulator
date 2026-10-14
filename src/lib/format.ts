export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
export const fmt1 = (n: number) => n.toFixed(1);
export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Colours shared by charts and legends (hex, because SVG attributes cannot always read CSS variables).
export const C = {
  leaf: "#3ddc97",
  ember: "#ff7a4d",
  gold: "#f6b84a",
  sky: "#5aa9ff",
  violet: "#8b7cf6",
  ash: "#9aa3a0",
  ink: "#e9eeea",
  mute: "#8e9993",
  grid: "rgba(255,255,255,0.07)",
};

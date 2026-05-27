export function normalizeHex(input: string): string | null {
  const raw = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) return raw.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(raw)) {
    const h = raw.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = normalizeHex(hex)!.slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a: string, b: string, weight: number): string {
  const ar = hexToRgb(a);
  const br = hexToRgb(b);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    ar.r * (1 - w) + br.r * w,
    ar.g * (1 - w) + br.g * w,
    ar.b * (1 - w) + br.b * w,
  );
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
}

export function textOnBackground(bg: string): string {
  return luminance(bg) > 0.5 ? "#1f2937" : "#f1f5f9";
}

export function adjustHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + amount / 100;
  return rgbToHex(r * factor, g * factor, b * factor);
}

export function buildPaletteFromAccentAndBg(accent: string, background: string) {
  const bg = normalizeHex(background) ?? "#f5f7f6";
  const ac = normalizeHex(accent) ?? "#2f6f73";
  const text = textOnBackground(bg);
  const surface = mix(bg, "#ffffff", luminance(bg) > 0.5 ? 0.04 : 0.08);
  const surface2 = mix(bg, "#ffffff", luminance(bg) > 0.5 ? 0.1 : 0.14);
  const surface3 = mix(surface, ac, 0.12);
  const border = mix(bg, text, 0.18);
  const muted = mix(text, bg, 0.45);

  return {
    bg,
    surface,
    surface2,
    surface3,
    border,
    accent: ac,
    accentHover: adjustHex(ac, luminance(ac) > 0.45 ? -14 : 14),
    text,
    muted,
  };
}

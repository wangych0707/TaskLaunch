import type { ColorTheme, CustomThemeColors, Settings } from "./types";
import { buildPaletteFromAccentAndBg, normalizeHex } from "./utils/colorUtils";

export type { ColorTheme };

export const COLOR_THEMES: {
  id: Exclude<ColorTheme, "custom">;
  name: string;
  swatch: string;
}[] = [
  { id: "mint", name: "薄荷绿（默认）", swatch: "#2f6f73" },
  { id: "dark", name: "深色", swatch: "#5b8def" },
  { id: "light", name: "浅色", swatch: "#2563eb" },
  { id: "ocean", name: "海洋蓝", swatch: "#0ea5e9" },
  { id: "sunset", name: "暮色", swatch: "#e07b39" },
  { id: "forest", name: "森林", swatch: "#3d8b5a" },
];

export const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  accent: "#2f6f73",
  background: "#f5f7f6",
  surface: "#ffffff",
  text: "#20242a",
};

const CUSTOM_STYLE_KEYS = [
  "--bg",
  "--surface",
  "--surface2",
  "--surface3",
  "--border",
  "--accent",
  "--accent-hover",
  "--muted",
  "color",
] as const;

function clearCustomInlineStyles() {
  const root = document.documentElement.style;
  for (const key of CUSTOM_STYLE_KEYS) {
    root.removeProperty(key);
  }
}

function applyCustomColors(colors: CustomThemeColors) {
  const accent = normalizeHex(colors.accent) ?? DEFAULT_CUSTOM_COLORS.accent;
  const background =
    normalizeHex(colors.background) ?? DEFAULT_CUSTOM_COLORS.background;
  const surface =
    colors.surface && normalizeHex(colors.surface)
      ? normalizeHex(colors.surface)!
      : undefined;
  const text =
    colors.text && normalizeHex(colors.text)
      ? normalizeHex(colors.text)!
      : undefined;

  const palette = buildPaletteFromAccentAndBg(accent, background);
  const root = document.documentElement.style;

  root.setProperty("--bg", palette.bg);
  root.setProperty("--surface", surface ?? palette.surface);
  root.setProperty("--surface2", palette.surface2);
  root.setProperty("--surface3", palette.surface3);
  root.setProperty("--border", palette.border);
  root.setProperty("--accent", palette.accent);
  root.setProperty("--accent-hover", palette.accentHover);
  root.setProperty("--muted", palette.muted);
  root.setProperty("color", text ?? palette.text);
}

export function applyAppTheme(settings: Pick<Settings, "colorTheme" | "customColors">) {
  const theme = settings.colorTheme ?? "mint";

  if (theme === "custom") {
    document.documentElement.setAttribute("data-theme", "custom");
    applyCustomColors(settings.customColors ?? DEFAULT_CUSTOM_COLORS);
    return;
  }

  clearCustomInlineStyles();
  document.documentElement.setAttribute("data-theme", theme);
}

/** @deprecated use applyAppTheme */
export function applyColorTheme(theme: ColorTheme) {
  applyAppTheme({ colorTheme: theme });
}

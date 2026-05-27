import { COLOR_THEMES, DEFAULT_CUSTOM_COLORS } from "../themes";
import type { ColorTheme, CustomThemeColors } from "../types";
import { CustomColorPicker } from "./CustomColorPicker";

interface Props {
  value: ColorTheme;
  customColors?: CustomThemeColors;
  onChange: (theme: ColorTheme) => void;
  onCustomColorsChange: (colors: CustomThemeColors) => void;
}

export function ThemePicker({
  value,
  customColors,
  onChange,
  onCustomColorsChange,
}: Props) {
  const isCustom = value === "custom";

  return (
    <div className="theme-picker-wrap">
      <div className="theme-picker" role="radiogroup" aria-label="界面配色">
        {COLOR_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={value === theme.id}
            className={`theme-option ${value === theme.id ? "active" : ""}`}
            onClick={() => onChange(theme.id)}
          >
            <span
              className="theme-swatch"
              style={{ backgroundColor: theme.swatch }}
            />
            <span>{theme.name}</span>
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={isCustom}
          className={`theme-option theme-option-custom ${isCustom ? "active" : ""}`}
          onClick={() => {
            onChange("custom");
            if (!customColors) {
              onCustomColorsChange({ ...DEFAULT_CUSTOM_COLORS });
            }
          }}
        >
          <span
            className="theme-swatch theme-swatch-custom"
            style={{
              background:
                customColors?.accent ?? DEFAULT_CUSTOM_COLORS.accent,
            }}
          />
          <span>自定义调色</span>
        </button>
      </div>

      {isCustom && (
        <CustomColorPicker
          colors={customColors ?? DEFAULT_CUSTOM_COLORS}
          onChange={(colors) => {
            onChange("custom");
            onCustomColorsChange(colors);
          }}
        />
      )}
    </div>
  );
}

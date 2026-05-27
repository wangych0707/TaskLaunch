import type { CustomThemeColors } from "../types";
import { DEFAULT_CUSTOM_COLORS } from "../themes";
import { normalizeHex } from "../utils/colorUtils";

interface Props {
  colors: CustomThemeColors;
  onChange: (colors: CustomThemeColors) => void;
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const hex = normalizeHex(value) ?? value;

  return (
    <label className="color-field">
      <span className="color-field-label">
        {label}
        {hint && <span className="hint">{hint}</span>}
      </span>
      <div className="color-field-row">
        <input
          type="color"
          value={hex.startsWith("#") ? hex : `#${hex}`}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} 调色盘`}
        />
        <input
          type="text"
          className="color-hex-input"
          value={hex}
          onChange={(e) => {
            const next = normalizeHex(e.target.value);
            if (next) onChange(next);
          }}
          placeholder="#2f6f73"
          spellCheck={false}
        />
      </div>
    </label>
  );
}

export function CustomColorPicker({ colors, onChange }: Props) {
  const base = { ...DEFAULT_CUSTOM_COLORS, ...colors };

  function patch(partial: Partial<CustomThemeColors>) {
    onChange({ ...base, ...partial });
  }

  return (
    <div className="custom-color-picker">
      <p className="hint">
        使用调色盘或输入十六进制色值（如 #2f6f73）。修改后立即预览。
      </p>
      <ColorField
        label="主题色（按钮、高亮）"
        value={base.accent}
        onChange={(accent) => patch({ accent })}
      />
      <ColorField
        label="背景色"
        value={base.background}
        onChange={(background) => patch({ background })}
      />
      <ColorField
        label="卡片/面板色"
        hint="可选，留空则自动计算"
        value={base.surface ?? DEFAULT_CUSTOM_COLORS.surface!}
        onChange={(surface) => patch({ surface })}
      />
      <ColorField
        label="文字色"
        hint="可选，留空则根据背景自动选择"
        value={base.text ?? DEFAULT_CUSTOM_COLORS.text!}
        onChange={(text) => patch({ text })}
      />
      <button
        type="button"
        className="btn small"
        onClick={() => onChange({ ...DEFAULT_CUSTOM_COLORS })}
      >
        恢复默认自定义色
      </button>
    </div>
  );
}

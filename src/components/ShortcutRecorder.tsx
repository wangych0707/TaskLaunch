import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatShortcutFromKeyboardEvent,
  setShortcutRecording,
  toTauriShortcut,
} from "../utils/shortcuts";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  conflictWith?: string | string[];
}

export function ShortcutRecorder({
  label,
  value,
  onChange,
  conflictWith,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const stopRecording = useCallback(() => {
    setRecording(false);
    setPreview(null);
    setShortcutRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    stopRecording();
    setRecording(true);
    setShortcutRecording(true);
    requestAnimationFrame(() => boxRef.current?.focus());
  }, [stopRecording]);

  useEffect(() => {
    if (!recording) return;

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        stopRecording();
        return;
      }

      const formatted = formatShortcutFromKeyboardEvent(event);
      if (formatted) {
        setPreview(formatted);
        onChange(formatted);
        stopRecording();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [recording, onChange, stopRecording]);

  useEffect(() => () => setShortcutRecording(false), []);

  const conflictValues = Array.isArray(conflictWith)
    ? conflictWith
    : conflictWith
      ? [conflictWith]
      : [];
  const conflict = Boolean(
    value.trim() &&
      conflictValues.some(
        (other) =>
          other.trim() && toTauriShortcut(value) === toTauriShortcut(other),
      ),
  );

  return (
    <label className="shortcut-recorder">
      <span>{label}</span>
      <div className="shortcut-recorder-row">
        <div
          ref={boxRef}
          className={`shortcut-display ${recording ? "recording" : ""}`}
          tabIndex={0}
          role="button"
          onClick={startRecording}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              startRecording();
            }
          }}
        >
          {recording
            ? preview ?? "请按下快捷键…"
            : value || "未设置"}
        </div>
        <button type="button" className="btn small" onClick={startRecording}>
          {recording ? "录制中" : "录制"}
        </button>
        <button
          type="button"
          className="btn small"
          onClick={() => onChange("")}
          disabled={!value}
        >
          清除
        </button>
      </div>
      {recording && (
        <span className="hint">按下组合键完成录制，Esc 取消</span>
      )}
      {conflict && (
        <span className="hint error">与另一快捷键冲突，请更换</span>
      )}
    </label>
  );
}

/** Whether a shortcut recorder is active. */
let recording = false;
export const SHORTCUT_RECORDING_EVENT = "tasklaunch-shortcut-recording";

export function setShortcutRecording(value: boolean) {
  recording = value;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SHORTCUT_RECORDING_EVENT, { detail: value }),
    );
  }
}

export function isShortcutRecording() {
  return recording;
}

const MODIFIER_KEYS = new Set([
  "Control",
  "Shift",
  "Alt",
  "Meta",
  "AltGraph",
]);

const CODE_KEY_MAP: Record<string, string> = {
  Space: "Space",
  Enter: "Enter",
  Escape: "Escape",
  Tab: "Tab",
  Backspace: "Backspace",
  Delete: "Delete",
  Insert: "Insert",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
};

function keyFromCode(code: string): string {
  if (CODE_KEY_MAP[code]) return CODE_KEY_MAP[code];
  if (code.startsWith("Key") && code.length === 4) return code.slice(3);
  if (code.startsWith("Digit") && code.length === 6) return code.slice(5);
  if (code.startsWith("Numpad") && code.length > 6) return code.slice(6);
  if (code.startsWith("F") && /^F\d+$/.test(code)) return code;
  return code;
}

export function formatShortcutFromKeyboardEvent(
  event: KeyboardEvent,
): string | null {
  if (event.repeat) return null;
  if (MODIFIER_KEYS.has(event.key)) return null;

  const parts: string[] = [];
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.metaKey) parts.push("Win");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");

  const mainKey = keyFromCode(event.code);
  if (!mainKey) return null;

  parts.push(mainKey);
  if (parts.length < 2) return null;

  return parts.join("+");
}

export function toTauriShortcut(shortcut: string): string {
  return shortcut
    .trim()
    .split("+")
    .map((part) => {
      const token = part.trim();
      if (!token) return "";
      const lower = token.toLowerCase();
      if (
        lower === "cmdorcontrol" ||
        lower === "commandorcontrol"
      ) {
        return "CommandOrControl";
      }
      if (
        lower === "ctrl" ||
        lower === "control"
      ) {
        return "Control";
      }
      if (
        lower === "cmd" ||
        lower === "command"
      ) {
        return "Command";
      }
      if (lower === "win" || lower === "super" || lower === "meta") {
        return "Super";
      }
      if (lower === "option") return "Alt";
      if (lower === "alt") return "Alt";
      if (lower === "shift") return "Shift";
      if (token.length === 1) return token.toUpperCase();
      return token;
    })
    .filter(Boolean)
    .join("+");
}

export function shortcutsConflict(a: string, b: string): boolean {
  if (!a.trim() || !b.trim()) return false;
  return toTauriShortcut(a) === toTauriShortcut(b);
}

export function hasShortcutConflict(shortcuts: string[]): boolean {
  const seen = new Set<string>();
  for (const shortcut of shortcuts) {
    const normalized = toTauriShortcut(shortcut);
    if (!normalized) continue;
    if (seen.has(normalized)) return true;
    seen.add(normalized);
  }
  return false;
}

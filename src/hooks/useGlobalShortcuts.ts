import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import type { Settings } from "../types";
import { showMainWindow } from "../api";

function toTauriShortcut(shortcut: string): string {
  return shortcut
    .trim()
    .split("+")
    .map((part) => {
      const token = part.trim();
      const lower = token.toLowerCase();
      if (!token) return "";
      if (lower === "cmdorcontrol" || lower === "commandorcontrol") {
        return "CommandOrControl";
      }
      if (lower === "ctrl" || lower === "control") return "Control";
      if (lower === "cmd" || lower === "command") return "Command";
      if (lower === "win" || lower === "super") return "Super";
      if (lower === "option") return "Alt";
      return token.length === 1 ? token.toUpperCase() : token;
    })
    .filter(Boolean)
    .join("+");
}

interface Options {
  settings: Settings;
  onLaunchLast: () => void;
  enabled: boolean;
}

export function useGlobalShortcuts({
  settings,
  onLaunchLast,
  enabled,
}: Options) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const registered: string[] = [];

    async function setup() {
      const shortcuts = [
        {
          key: settings.shortcutShowWindow ?? "Ctrl+Shift+T",
          handler: () => void showMainWindow(),
        },
        {
          key: settings.shortcutLaunchLast ?? "Ctrl+Shift+L",
          handler: onLaunchLast,
        },
      ];

      const seen = new Set<string>();
      for (const { key, handler } of shortcuts) {
        const normalized = toTauriShortcut(key);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        if (cancelled) return;
        try {
          await register(normalized, (event) => {
            if (event.state === "Pressed") handler();
          });
          if (cancelled) {
            await unregister(normalized);
            return;
          }
          registered.push(normalized);
        } catch (error) {
          console.warn(`快捷键注册失败 (${normalized}):`, error);
        }
      }
    }

    void setup();

    return () => {
      cancelled = true;
      for (const shortcut of registered) {
        void unregister(shortcut).catch(() => {});
      }
    };
  }, [
    enabled,
    settings.shortcutShowWindow,
    settings.shortcutLaunchLast,
    onLaunchLast,
  ]);
}

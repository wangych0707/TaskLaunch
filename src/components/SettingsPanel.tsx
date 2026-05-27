import { useEffect, useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { useApp } from "../context/AppContext";
import {
  exportData,
  importData,
  normalizeSettings,
} from "../api";
import type { Settings } from "../types";
import { ShortcutRecorder } from "./ShortcutRecorder";
import { ThemePicker } from "./ThemePicker";
import { hasShortcutConflict } from "../utils/shortcuts";
import { applyAppTheme } from "../themes";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, dataDir, saveSettings, refresh } = useApp();
  const [draft, setDraft] = useState<Settings>(() => normalizeSettings(settings));
  const [busy, setBusy] = useState(false);

  function patch(partial: Partial<Settings>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  useEffect(() => {
    applyAppTheme(normalizeSettings(draft));
  }, [draft]);

  function handleClose() {
    applyAppTheme(normalizeSettings(settings));
    onClose();
  }

  const shortcutConflict = hasShortcutConflict([
    draft.shortcutShowWindow ?? "",
    draft.shortcutTaskPanel ?? "",
    draft.shortcutLaunchLast ?? "",
  ]);

  async function handleSave() {
    const ms = Number(draft.launchDelayMs);
    if (Number.isNaN(ms) || ms < 0) return;
    if (shortcutConflict) {
      await message("任意两个全局快捷键不能相同，请重新录制。", {
        title: "快捷键冲突",
        kind: "error",
      });
      return;
    }
    const saved = normalizeSettings({
      ...draft,
      launchDelayMs: ms,
      shortcutShowWindow: draft.shortcutShowWindow?.trim() ?? "",
      shortcutTaskPanel: draft.shortcutTaskPanel?.trim() ?? "",
      shortcutLaunchLast: draft.shortcutLaunchLast?.trim() ?? "",
    });
    setBusy(true);
    try {
      await saveSettings(saved);
      applyAppTheme(saved);
      onClose();
    } catch (e) {
      await message(e instanceof Error ? e.message : String(e), {
        title: "设置保存失败",
        kind: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    const stamp = new Date().toISOString().slice(0, 10);
    const path = await save({
      title: "导出 TaskLaunch 备份",
      defaultPath: `tasklaunch-backup-${stamp}.json`,
      filters: [{ name: "TaskLaunch 备份", extensions: ["json"] }],
    });
    if (!path || typeof path !== "string") return;
    setBusy(true);
    try {
      await exportData(path);
      await message(`已导出到：\n${path}`, { title: "导出成功" });
    } catch (e) {
      await message(e instanceof Error ? e.message : String(e), {
        title: "导出失败",
        kind: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    const path = await open({
      title: "选择备份文件",
      multiple: false,
      filters: [{ name: "TaskLaunch 备份", extensions: ["json"] }],
    });
    if (!path || typeof path !== "string") return;

    const merge = await ask(
      "选择「是」将合并到现有数据（同 ID 覆盖）；选择「否」将完全替换当前任务与模板。",
      { title: "导入模式", kind: "warning" },
    );
    const importSettings = await ask("是否同时导入设置中的启动间隔？", {
      title: "导入设置",
    });

    setBusy(true);
    try {
      const summary = await importData(
        path,
        merge ? "merge" : "replace",
        importSettings,
      );
      await refresh();
      await message(
        `导入完成\n任务/模板条目：${summary.tasksImported} / ${summary.templatesImported}\n设置：${summary.settingsImported ? "已更新间隔" : "未改动"}`,
        { title: "导入成功" },
      );
    } catch (e) {
      await message(e instanceof Error ? e.message : String(e), {
        title: "导入失败",
        kind: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h3>设置</h3>

        <section className="settings-section">
          <h4>界面配色</h4>
          <ThemePicker
            value={draft.colorTheme ?? "mint"}
            customColors={draft.customColors}
            onChange={(colorTheme) => patch({ colorTheme })}
            onCustomColorsChange={(customColors) =>
              patch({ colorTheme: "custom", customColors })
            }
          />
        </section>

        <section className="settings-section">
          <h4>启动</h4>
          <label>
            全局启动间隔 (ms)
            <input
              type="number"
              min={0}
              step={100}
              value={draft.launchDelayMs}
              onChange={(e) =>
                patch({ launchDelayMs: Number(e.target.value) })
              }
            />
          </label>
        </section>

        <section className="settings-section">
          <h4>系统托盘</h4>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draft.minimizeToTray ?? true}
              onChange={(e) => patch({ minimizeToTray: e.target.checked })}
            />
            关闭窗口时最小化到托盘（不退出）
          </label>
        </section>

        <section className="settings-section">
          <h4>全局快捷键</h4>
          <p className="hint">
            点击「录制」后按下组合键，保存后生效。主窗口快捷键再次按下会隐藏主窗口。
          </p>
          <ShortcutRecorder
            label="显示/隐藏主窗口"
            value={draft.shortcutShowWindow ?? ""}
            onChange={(shortcutShowWindow) => patch({ shortcutShowWindow })}
            conflictWith={[
              draft.shortcutTaskPanel ?? "",
              draft.shortcutLaunchLast ?? "",
            ]}
          />
          <ShortcutRecorder
            label="显示/隐藏任务小窗"
            value={draft.shortcutTaskPanel ?? ""}
            onChange={(shortcutTaskPanel) => patch({ shortcutTaskPanel })}
            conflictWith={[
              draft.shortcutShowWindow ?? "",
              draft.shortcutLaunchLast ?? "",
            ]}
          />
          <ShortcutRecorder
            label="启动上次任务"
            value={draft.shortcutLaunchLast ?? ""}
            onChange={(shortcutLaunchLast) => patch({ shortcutLaunchLast })}
            conflictWith={[
              draft.shortcutShowWindow ?? "",
              draft.shortcutTaskPanel ?? "",
            ]}
          />
        </section>

        <section className="settings-section">
          <h4>备份与恢复</h4>
          <div className="row-actions">
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={handleExport}
            >
              导出备份
            </button>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={handleImport}
            >
              导入备份
            </button>
          </div>
        </section>

        <label>
          数据目录
          <input value={dataDir} readOnly />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={handleClose} disabled={busy}>
            取消
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={handleSave}
            disabled={busy || shortcutConflict}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

import { invoke } from "@tauri-apps/api/core";
import type {
  ImportSummary,
  LaunchItem,
  LaunchTaskResponse,
  Settings,
  Task,
  Template,
} from "./types";

export async function fetchTasks(): Promise<Task[]> {
  return invoke<Task[]>("get_tasks");
}

export async function persistTasks(tasks: Task[]): Promise<void> {
  return invoke("save_tasks", { tasks });
}

export async function fetchSettings(): Promise<Settings> {
  return invoke<Settings>("get_settings");
}

export async function persistSettings(settings: Settings): Promise<void> {
  return invoke("save_settings", { settings });
}

export async function fetchTemplates(): Promise<Template[]> {
  return invoke<Template[]>("get_templates");
}

export async function persistTemplates(templates: Template[]): Promise<void> {
  return invoke("save_templates", { templates });
}

export async function fetchDataDir(): Promise<string> {
  return invoke<string>("get_data_dir");
}

export async function launchTask(
  task: Task,
  skipIds: string[] = [],
): Promise<LaunchTaskResponse> {
  return invoke<LaunchTaskResponse>("launch_task", { task, skipIds });
}

export async function exportData(path: string): Promise<void> {
  return invoke("export_data", { path });
}

export async function importData(
  path: string,
  mode: "replace" | "merge",
  importSettings: boolean,
): Promise<ImportSummary> {
  return invoke<ImportSummary>("import_data", { path, mode, importSettings });
}

export async function showMainWindow(): Promise<void> {
  return invoke("show_main_window");
}

export function normalizeSettings(settings: Settings): Settings {
  return {
    launchDelayMs: settings.launchDelayMs ?? 400,
    minimizeToTray: settings.minimizeToTray ?? true,
    shortcutShowWindow: settings.shortcutShowWindow ?? "Ctrl+Shift+T",
    shortcutLaunchLast: settings.shortcutLaunchLast ?? "Ctrl+Shift+L",
    lastLaunchedTaskId: settings.lastLaunchedTaskId,
  };
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function cloneLaunchItems(items: LaunchItem[]): LaunchItem[] {
  return items.map((item) => ({
    ...item,
    id: newId(),
  }));
}

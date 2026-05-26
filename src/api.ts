import { invoke } from "@tauri-apps/api/core";
import type {
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

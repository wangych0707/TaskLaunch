export type LaunchItemType = "app" | "file" | "folder" | "url" | "command";

export type TaskStatus = "todo" | "doing" | "done";

export interface LaunchItem {
  id: string;
  type: LaunchItemType;
  name: string;
  path: string;
  args?: string;
  workingDirectory?: string;
  order?: number;
  delayMs?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  workspaceName?: string;
  launchItems: LaunchItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  launchItems: LaunchItem[];
}

export interface Settings {
  launchDelayMs: number;
  minimizeToTray?: boolean;
  shortcutShowWindow?: string;
  shortcutLaunchLast?: string;
  lastLaunchedTaskId?: string;
}

export interface ImportSummary {
  tasksImported: number;
  templatesImported: number;
  settingsImported: boolean;
}

export interface ExportBundle {
  version: string;
  exportedAt: string;
  tasks: Task[];
  templates: Template[];
  settings: Settings;
}

export interface LaunchItemResult {
  itemId: string;
  name: string;
  success: boolean;
  skipped: boolean;
  message?: string;
}

export interface MissingItem {
  itemId: string;
  name: string;
  path: string;
  reason: string;
}

export interface LaunchTaskResponse {
  status: string;
  results: LaunchItemResult[];
  missing: MissingItem[];
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未开始",
  doing: "进行中",
  done: "已完成",
};

export const TYPE_LABELS: Record<LaunchItemType, string> = {
  app: "App",
  file: "File",
  folder: "Folder",
  url: "URL",
  command: "Command",
};

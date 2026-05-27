import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  cloneLaunchItems,
  fetchDataDir,
  fetchSettings,
  fetchTasks,
  fetchTemplates,
  launchTask,
  newId,
  normalizeSettings,
  nowIso,
  persistSettings,
  persistTasks,
  persistTemplates,
} from "../api";
import type { Settings, Task, TaskStatus, Template } from "../types";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { useGlobalShortcuts } from "../hooks/useGlobalShortcuts";

interface AppContextValue {
  tasks: Task[];
  templates: Template[];
  settings: Settings;
  dataDir: string;
  selectedId: string | null;
  selectedTask: Task | null;
  loading: boolean;
  launchMessage: string | null;
  launchingTaskId: string | null;
  selectTask: (id: string | null) => void;
  refresh: () => Promise<void>;
  createTask: (input: {
    title: string;
    description?: string;
    workspaceName?: string;
    status?: TaskStatus;
    templateId?: string;
  }) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  createTemplate: (template: Omit<Template, "id">) => Promise<string>;
  updateTemplate: (template: Template) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  startTask: (task: Task) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [settings, setSettings] = useState<Settings>(normalizeSettings({ launchDelayMs: 400 }));
  const [dataDir, setDataDir] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [launchingTaskId, setLaunchingTaskId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [t, tmpl, s, dir] = await Promise.all([
      fetchTasks(),
      fetchTemplates(),
      fetchSettings(),
      fetchDataDir(),
    ]);
    setTasks(t);
    setTemplates(tmpl);
    setSettings(normalizeSettings(s));
    setDataDir(dir);
    setSelectedId((prev) => {
      if (prev && t.some((x) => x.id === prev)) return prev;
      return t[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    refresh()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refresh]);

  const persist = useCallback(async (next: Task[]) => {
    setTasks(next);
    await persistTasks(next);
  }, []);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedId) ?? null,
    [tasks, selectedId],
  );

  const createTask = useCallback(
    async (input: {
      title: string;
      description?: string;
      workspaceName?: string;
      status?: TaskStatus;
      templateId?: string;
    }) => {
      const template = input.templateId
        ? templates.find((t) => t.id === input.templateId)
        : undefined;
      const now = nowIso();
      const task: Task = {
        id: newId(),
        title: input.title,
        description: input.description,
        workspaceName: input.workspaceName,
        status: input.status ?? "todo",
        launchItems: template
          ? cloneLaunchItems(template.launchItems)
          : [],
        createdAt: now,
        updatedAt: now,
      };
      const next = [...tasks, task];
      await persist(next);
      setSelectedId(task.id);
    },
    [tasks, templates, persist],
  );

  const updateTask = useCallback(
    async (task: Task) => {
      const next = tasks.map((t) =>
        t.id === task.id ? { ...task, updatedAt: nowIso() } : t,
      );
      await persist(next);
    },
    [tasks, persist],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const next = tasks.filter((t) => t.id !== id);
      await persist(next);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? null);
      }
    },
    [tasks, persist, selectedId],
  );

  const saveSettings = useCallback(async (next: Settings) => {
    const normalized = normalizeSettings(next);
    setSettings(normalized);
    await persistSettings(normalized);
  }, []);

  const tasksRef = useRef(tasks);
  const settingsRef = useRef(settings);
  const startTaskRef = useRef<(task: Task) => Promise<void>>(async () => {});
  tasksRef.current = tasks;
  settingsRef.current = settings;

  const createTemplate = useCallback(
    async (input: Omit<Template, "id">) => {
      const template: Template = { ...input, id: newId() };
      const next = [...templates, template];
      setTemplates(next);
      await persistTemplates(next);
      return template.id;
    },
    [templates],
  );

  const updateTemplate = useCallback(
    async (template: Template) => {
      const next = templates.map((t) =>
        t.id === template.id ? template : t,
      );
      setTemplates(next);
      await persistTemplates(next);
    },
    [templates],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      const next = templates.filter((t) => t.id !== id);
      setTemplates(next);
      await persistTemplates(next);
    },
    [templates],
  );

  const rememberLastTask = useCallback(async (taskId: string) => {
    const next = normalizeSettings({
      ...settingsRef.current,
      lastLaunchedTaskId: taskId,
    });
    setSettings(next);
    await persistSettings(next);
  }, []);

  const startTask = useCallback(
    async (task: Task) => {
      if (launchingTaskId) return;
      setLaunchMessage(null);
      setLaunchingTaskId(task.id);

      try {
        let skipIds: string[] = [];
        let response = await launchTask(task, skipIds);

        while (response.status === "needs_confirmation") {
          const names = response.missing
            .map((m) => `${m.name}: ${m.reason}`)
            .join("\n");
          const ok = await ask(
            `以下启动项路径不存在，是否跳过并继续？\n\n${names}`,
            { title: "TaskLaunch", kind: "warning" },
          );
          if (!ok) {
            setLaunchMessage("已取消启动");
            return;
          }
          skipIds = [
            ...skipIds,
            ...response.missing.map((m) => m.itemId),
          ];
          response = await launchTask(task, skipIds);
        }

        await rememberLastTask(task.id);

        const failed = response.results.filter((r) => !r.success && !r.skipped);
        if (failed.length > 0) {
          setLaunchMessage(
            `部分启动失败: ${failed.map((f) => f.name).join(", ")}`,
          );
        } else {
          const count = response.results.filter((r) => !r.skipped).length;
          setLaunchMessage(`已启动 ${count} 个启动项`);
        }
      } catch (error) {
        setLaunchMessage(
          error instanceof Error ? error.message : "启动失败，请检查启动项配置",
        );
      } finally {
        setLaunchingTaskId(null);
      }
    },
    [launchingTaskId, rememberLastTask],
  );

  startTaskRef.current = startTask;

  const launchLastTask = useCallback(async () => {
    const taskId = settingsRef.current.lastLaunchedTaskId;
    if (!taskId) {
      await message("还没有启动过任务。请先在主窗口点击 Start Task。", {
        title: "TaskLaunch",
      });
      return;
    }
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task) {
      await message("上次任务已不存在，请重新选择任务。", { title: "TaskLaunch" });
      return;
    }
    await startTaskRef.current(task);
  }, []);

  useGlobalShortcuts({
    settings,
    onLaunchLast: () => void launchLastTask(),
    enabled: !loading,
  });

  useEffect(() => {
    const unlisten = listen("tray-launch-last", () => {
      void launchLastTask();
    });
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, [launchLastTask]);

  const value: AppContextValue = {
    tasks,
    templates,
    settings,
    dataDir,
    selectedId,
    selectedTask,
    loading,
    launchMessage,
    launchingTaskId,
    selectTask: setSelectedId,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    saveSettings,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    startTask,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Task, TaskStatus } from "../types";
import { STATUS_LABELS } from "../types";
import { LaunchItemList } from "./LaunchItemList";

export function TaskDetail() {
  const {
    selectedTask,
    updateTask,
    deleteTask,
    startTask,
    launchMessage,
    launchingTaskId,
  } = useApp();

  const [draft, setDraft] = useState<Task | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(selectedTask);
    setDirty(false);
  }, [selectedTask]);

  if (!draft) {
    return (
      <section className="task-detail-panel empty">
        <p>选择左侧任务，或新建一个任务</p>
        <p className="tagline">One task, one workspace.</p>
      </section>
    );
  }

  function patch(partial: Partial<Task>) {
    setDraft((d) => (d ? { ...d, ...partial } : d));
    setDirty(true);
  }

  async function handleSave() {
    if (!draft) return;
    if (!draft.title.trim()) return;
    await updateTask(draft);
    setDirty(false);
  }

  async function handleDelete() {
    if (!draft) return;
    if (!confirm(`确定删除任务「${draft.title}」？`)) return;
    await deleteTask(draft.id);
  }

  return (
    <section className="task-detail-panel">
      <div className="detail-header">
        <div>
          <h2>任务详情</h2>
          {draft.workspaceName && (
            <p className="workspace-label">工作场景：{draft.workspaceName}</p>
          )}
        </div>
        <div className="detail-actions">
          <button
            type="button"
            className="btn primary large"
            disabled={launchingTaskId === draft.id || !draft.title.trim()}
            onClick={() => startTask(draft)}
          >
            {launchingTaskId === draft.id ? "Starting..." : "Start Task"}
          </button>
          {dirty && (
            <button
              type="button"
              className="btn"
              disabled={!draft.title.trim()}
              onClick={handleSave}
            >
              保存
            </button>
          )}
          <button type="button" className="btn danger" onClick={handleDelete}>
            删除
          </button>
        </div>
      </div>

      {launchMessage && (
        <div className="launch-toast">{launchMessage}</div>
      )}

      <div className="detail-form">
        <label>
          名称
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="例如：完成实验报告"
          />
        </label>
        <label>
          工作场景名称
          <input
            value={draft.workspaceName ?? ""}
            onChange={(e) =>
              patch({ workspaceName: e.target.value || undefined })
            }
            placeholder="例如：实验报告写作环境"
          />
        </label>
        <label>
          状态
          <select
            value={draft.status}
            onChange={(e) =>
              patch({ status: e.target.value as TaskStatus })
            }
          >
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          描述
          <textarea
            value={draft.description ?? ""}
            onChange={(e) =>
              patch({ description: e.target.value || undefined })
            }
            rows={4}
          />
        </label>
      </div>

      <LaunchItemList
        items={draft.launchItems}
        onChange={(launchItems) => {
          patch({ launchItems });
        }}
      />

      {dirty && (
        <div className="sticky-save">
          <button
            type="button"
            className="btn primary"
            disabled={!draft.title.trim()}
            onClick={handleSave}
          >
            保存更改
          </button>
        </div>
      )}
    </section>
  );
}

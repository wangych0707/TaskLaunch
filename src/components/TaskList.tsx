import { useState } from "react";
import { useApp } from "../context/AppContext";
import { STATUS_LABELS } from "../types";
import { NewTaskModal } from "./NewTaskModal";

export function TaskList() {
  const { tasks, selectedId, selectTask } = useApp();
  const [showNew, setShowNew] = useState(false);

  return (
    <aside className="task-list-panel">
      <div className="panel-header">
        <h2>任务列表</h2>
        <button type="button" className="btn primary" onClick={() => setShowNew(true)}>
          + 新建
        </button>
      </div>
      <ul className="task-list">
        {tasks.length === 0 && (
          <li className="empty-hint">暂无任务，点击「+ 新建」开始</li>
        )}
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              className={`task-item ${selectedId === task.id ? "active" : ""}`}
              onClick={() => selectTask(task.id)}
            >
              <span className="task-title">{task.title}</span>
              <span className={`status-badge status-${task.status}`}>
                {STATUS_LABELS[task.status]}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {showNew && <NewTaskModal onClose={() => setShowNew(false)} />}
    </aside>
  );
}

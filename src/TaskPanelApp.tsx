import { AppProvider, useApp } from "./context/AppContext";
import { showMainWindow, toggleTaskPanel } from "./api";
import { STATUS_LABELS } from "./types";
import "./App.css";

function TaskPanelShell() {
  const { tasks, loading, startTask, launchingTaskId } = useApp();

  if (loading) {
    return <div className="task-panel-app loading">加载中…</div>;
  }

  return (
    <div className="task-panel-app">
      <header className="task-panel-header">
        <h1>任务列表</h1>
      </header>
      <ul className="task-panel-list">
        {tasks.length === 0 && (
          <li className="empty-hint">暂无任务，请在主窗口新建</li>
        )}
        {tasks.map((task) => (
          <li key={task.id} className="task-panel-item">
            <div className="task-panel-item-info">
              <div className="task-panel-item-title">{task.title}</div>
              <span className={`status-badge status-${task.status}`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
            <button
              type="button"
              className="btn small primary"
              disabled={launchingTaskId !== null}
              onClick={() => void startTask(task)}
            >
              Start
            </button>
          </li>
        ))}
      </ul>
      <footer className="task-panel-footer">
        <button
          type="button"
          className="btn"
          onClick={() => void showMainWindow()}
        >
          主窗口
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => void toggleTaskPanel()}
        >
          隐藏
        </button>
      </footer>
    </div>
  );
}

export default function TaskPanelApp() {
  return (
    <AppProvider>
      <TaskPanelShell />
    </AppProvider>
  );
}

import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { TaskList } from "./components/TaskList";
import { TaskDetail } from "./components/TaskDetail";
import { TemplateManager } from "./components/TemplateManager";
import { SettingsPanel } from "./components/SettingsPanel";
import "./App.css";

function AppShell() {
  const { loading } = useApp();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return <div className="app loading">加载中...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>TaskLaunch</h1>
          <span className="subtitle">一个任务，一个工作场景</span>
        </div>
        <nav className="header-nav">
          <button
            type="button"
            className="btn"
            onClick={() => setShowTemplates(true)}
          >
            模板
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setShowSettings(true)}
          >
            设置
          </button>
        </nav>
      </header>
      <main className="app-main">
        <TaskList />
        <TaskDetail />
      </main>
      {showTemplates && (
        <TemplateManager onClose={() => setShowTemplates(false)} />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

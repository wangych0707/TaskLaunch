import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import App from "./App";
import TaskPanelApp from "./TaskPanelApp";

async function bootstrap() {
  const label = getCurrentWebviewWindow().label;
  const Root = label === "task-panel" ? TaskPanelApp : App;

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  );
}

void bootstrap();

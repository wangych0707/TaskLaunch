# TaskLaunch

**One task, one workspace.** / 一个任务，一个工作场景。

TaskLaunch is a lightweight desktop task manager that lets you attach apps, files, folders, websites, and commands to each task, so you can start your work environment with one click.

## Features

### v0.2

- **Import / export** — single JSON backup (tasks + templates + settings)
- **System tray** — close to tray, tray menu (show / launch last / quit), left-click to show window
- **Global shortcuts** — show window (`Ctrl+Shift+T`), launch last task (`Ctrl+Shift+L`), customizable in settings
- **Last task memory** — tray menu and hotkey restart the last successfully started task

### v0.1

- Task list with status: 未开始 / 进行中 / 已完成
- Work scene per task (workspace name + launch items)
- Launch item types: **App**, **File**, **Folder**, **URL**, **Command**
- **Start Task** — opens all bound items in order with configurable delay
- Missing path check with skip confirmation
- Task templates for quick setup
- Local JSON storage (no database)

## Tech stack

- **Tauri 2** + **React 19** + **TypeScript** + **Vite**
- **Rust**: serde, open, uuid — launch pipeline and JSON persistence

## Development

Prerequisites: Node.js 18+, Rust stable, Visual Studio Build Tools (Windows), WebView2.

```bash
npm install
npm run tauri dev
```

Build installer / executable:

```bash
npm run tauri build
```

Build only the desktop executable when the local Windows Installer service is unavailable:

```bash
npm run desktop:build
```

可执行文件路径：`src-tauri/target/release/tasklaunch.exe`

## Data files

Stored under the OS app data directory (shown in **设置**):

| File | Content |
|------|---------|
| `tasks.json` | All tasks and launch items |
| `settings.json` | `launchDelayMs`, tray, shortcuts, `lastLaunchedTaskId` |
| `templates.json` | Reusable templates |

Writes use atomic replace (`.tmp` → rename) to reduce corruption risk.

## Launch item examples

```json
{
  "type": "app",
  "name": "VS Code",
  "path": "C:\\Users\\You\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"
}
```

```json
{
  "type": "url",
  "name": "Overleaf",
  "path": "https://www.overleaf.com"
}
```

```json
{
  "type": "folder",
  "name": "Reports",
  "path": "D:\\Reports"
}
```

```json
{
  "type": "command",
  "name": "Dev server",
  "path": "npm run dev",
  "workingDirectory": "D:\\Projects\\my-app"
}
```

See [`tasks.example.json`](tasks.example.json) for a full task sample.

## Backup format

Export produces `tasklaunch-backup-YYYY-MM-DD.json`:

```json
{
  "version": "0.2",
  "exportedAt": "2026-05-26T12:00:00+00:00",
  "tasks": [],
  "templates": [],
  "settings": {
    "launchDelayMs": 400,
    "minimizeToTray": true,
    "shortcutShowWindow": "Ctrl+Shift+T",
    "shortcutLaunchLast": "Ctrl+Shift+L"
  }
}
```

Import supports **merge** (same id overwrites) or **replace** (full overwrite). Shortcut/tray preferences are kept when importing settings.

## Manual test checklist (Windows)

**v0.1**

- [ ] Create task, edit title/description/status, restart app — data persists
- [ ] Add one item per type (app, file, folder, url, command) and **Start Task**
- [ ] Path with spaces opens correctly
- [ ] Missing file/folder shows skip dialog, then continues
- [ ] Reorder launch items (↑↓), order respected on start
- [ ] Global delay in settings applied between items
- [ ] Create template, new task from template copies launch items

**v0.2**

- [ ] Export backup, re-import with merge and replace
- [ ] Close window → app stays in tray; tray「显示主窗口」restores
- [ ] Start a task, then `Ctrl+Shift+L` / tray「启动上次任务」runs it again
- [ ] `Ctrl+Shift+T` shows window when hidden
- [ ] Change shortcuts in settings, save, verify new bindings work

## Roadmap

- **v0.3** — Stronger pre-launch validation, task recovery prompt on startup
- **v0.4** — macOS / Linux polish

## License

MIT (add license file if publishing to GitHub).

# TaskLaunch

**One task, one workspace.** / 一个任务，一个工作场景。

TaskLaunch is a lightweight desktop task manager that lets you attach apps, files, folders, websites, and commands to each task, so you can start your work environment with one click.

## Features (v0.1)

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

仅生成 exe（跳过安装包，避免下载 WiX/NSIS 超时）：

```bash
npm run tauri build -- --bundles none
```

可执行文件路径：`src-tauri/target/release/tasklaunch.exe`

## Data files

Stored under the OS app data directory (shown in **设置**):

| File | Content |
|------|---------|
| `tasks.json` | All tasks and launch items |
| `settings.json` | Global `launchDelayMs` (default 400) |
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

## Manual test checklist (Windows)

- [ ] Create task, edit title/description/status, restart app — data persists
- [ ] Add one item per type (app, file, folder, url, command) and **Start Task**
- [ ] Path with spaces opens correctly
- [ ] Missing file/folder shows skip dialog, then continues
- [ ] Reorder launch items (↑↓), order respected on start
- [ ] Global delay in settings applied between items
- [ ] Create template, new task from template copies launch items
- [ ] Template list starts empty until the user creates one

## Roadmap

- **v0.2** — Import/export, system tray, global shortcut
- **v0.3** — Stronger pre-launch validation, task recovery UX
- **v0.4** — macOS / Linux polish

## License

MIT (add license file if publishing to GitHub).

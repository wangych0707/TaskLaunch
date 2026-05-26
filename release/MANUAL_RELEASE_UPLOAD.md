# Manual GitHub Release Upload

Open this URL in your browser:

https://github.com/wangych0707/TaskLaunch/releases/new?tag=v0.1.0

Use these fields:

- Tag: v0.1.0
- Release title: TaskLaunch v0.1.0
- Asset: D:\worklist\release\TaskLaunch-v0.1.0-windows-x64.zip

Paste this into the release description:

---

# TaskLaunch v0.1.0

First MVP release of TaskLaunch: one task, one workspace.

## Highlights

- Task list with todo / doing / done status.
- Task detail editor with workspace name, description, and launch items.
- Launch item types: app, file, folder, URL, and command.
- One-click task launch with ordered launch items and per-item/global delay.
- Missing file/folder/app path confirmation before continuing.
- User-created task templates. Built-in templates have been removed.
- Local JSON storage for tasks, settings, and templates.
- Lightweight Tauri + React + TypeScript desktop shell.

## Validation

- Frontend build passes with `npm run build`.
- Rust backend check passes with `cargo check`.
- Desktop executable build passes with `npm run desktop:build`.

## Release Asset

- Windows executable: `tasklaunch.exe`

## Known Notes

- MSI installer bundling may fail on machines where the Windows Installer service is unavailable. Use `npm run desktop:build` to produce the executable directly.
- First release focuses on Windows and local JSON storage.


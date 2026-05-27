# TaskLaunch v0.2.0

TaskLaunch v0.2.0 adds the first round of desktop polish around backup, restore, tray behavior, and global shortcuts.

## Highlights

- Import and export a single JSON backup containing tasks, templates, and settings.
- Add system tray support with show window, launch last task, and quit actions.
- Close to tray when enabled, instead of exiting immediately.
- Add global shortcuts for showing the main window and launching the last task.
- Remember the last launched task for tray and shortcut workflows.
- Add settings for launch delay, tray behavior, and shortcut bindings.
- Improve shortcut normalization and avoid duplicate shortcut registration.
- Preserve local tray and shortcut preferences when importing settings.

## Validation

- Frontend build passes with `npm run build`.
- Rust backend check passes with `cargo check`.
- Desktop executable build passes with `npm run desktop:build`.

## Release Asset

- Windows executable archive: `TaskLaunch-v0.2.0-windows-x64.zip`

## Known Notes

- MSI installer bundling may still depend on local Windows Installer / WiX availability. Use `npm run desktop:build` to produce the executable directly.
- v0.2.0 focuses on Windows desktop workflows and local JSON data.

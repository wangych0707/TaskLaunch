use tauri::Emitter;
use tauri::AppHandle;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

use crate::models::Settings;
use crate::windows;

pub const LAUNCH_LAST_EVENT: &str = "shortcut-launch-last";

pub fn register_from_settings(app: &AppHandle, settings: &Settings) -> Result<(), String> {
    let show_key = normalize_shortcut(&settings.shortcut_show_window);
    let panel_key = normalize_shortcut(&settings.shortcut_task_panel);
    let launch_key = normalize_shortcut(&settings.shortcut_launch_last);
    validate_unique_shortcuts([
        ("显示/隐藏主窗口", show_key.as_deref()),
        ("显示/隐藏任务小窗", panel_key.as_deref()),
        ("启动上次任务", launch_key.as_deref()),
    ])?;

    let shortcuts = app.global_shortcut();
    shortcuts.unregister_all().map_err(|e| e.to_string())?;

    if let Some(shortcut) = show_key.as_deref() {
        shortcuts
            .on_shortcut(shortcut, |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = windows::toggle_main_window(app);
                }
            })
            .map_err(|e| format!("显示/隐藏主窗口快捷键注册失败 ({shortcut}): {e}"))?;
    }

    if let Some(shortcut) = panel_key.as_deref() {
        shortcuts
            .on_shortcut(shortcut, |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = windows::toggle_task_panel(app);
                }
            })
            .map_err(|e| format!("显示/隐藏任务小窗快捷键注册失败 ({shortcut}): {e}"))?;
    }

    if launch_key.is_some() {
        let shortcut = launch_key.as_deref().unwrap();
        shortcuts
            .on_shortcut(shortcut, |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = app.emit(LAUNCH_LAST_EVENT, ());
                }
            })
            .map_err(|e| format!("启动上次任务快捷键注册失败 ({shortcut}): {e}"))?;
    }

    Ok(())
}

fn validate_unique_shortcuts<const N: usize>(
    shortcuts: [(&str, Option<&str>); N],
) -> Result<(), String> {
    for (index, (label, shortcut)) in shortcuts.iter().enumerate() {
        let Some(shortcut) = shortcut else {
            continue;
        };
        for (other_label, other_shortcut) in shortcuts.iter().skip(index + 1) {
            if other_shortcut.is_some_and(|other| other == *shortcut) {
                return Err(format!("{label} 与 {other_label} 的快捷键不能相同"));
            }
        }
    }
    Ok(())
}

fn normalize_shortcut(shortcut: &str) -> Option<String> {
    let parts = shortcut
        .split('+')
        .map(str::trim)
        .filter(|part| !part.is_empty())
        .map(normalize_token)
        .collect::<Vec<_>>();

    if parts.is_empty() {
        None
    } else {
        Some(parts.join("+"))
    }
}

fn normalize_token(token: &str) -> String {
    match token.to_ascii_lowercase().as_str() {
        "ctrl" | "control" => "Control".to_string(),
        "cmd" | "command" => "Command".to_string(),
        "cmdorctrl" | "cmdorcontrol" | "commandorctrl" | "commandorcontrol" => {
            "CommandOrControl".to_string()
        }
        "win" | "meta" | "super" => "Super".to_string(),
        "option" | "alt" => "Alt".to_string(),
        "shift" => "Shift".to_string(),
        other if other.len() == 1 => other.to_ascii_uppercase(),
        _ => token.to_string(),
    }
}

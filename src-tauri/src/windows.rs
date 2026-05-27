use tauri::{AppHandle, Manager, UserAttentionType};

pub const MAIN_WINDOW: &str = "main";
pub const TASK_PANEL_WINDOW: &str = "task-panel";

pub fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_always_on_top(true);
        let _ = window.set_focus();
        let _ = window.set_always_on_top(false);
        let _ = window.request_user_attention(Some(UserAttentionType::Informational));
    }
}

pub fn toggle_main_window(app: &AppHandle) -> Result<bool, String> {
    let window = app
        .get_webview_window(MAIN_WINDOW)
        .ok_or("主窗口未配置")?;
    let visible = window.is_visible().map_err(|e| e.to_string())?;
    if visible {
        window.hide().map_err(|e| e.to_string())?;
        Ok(false)
    } else {
        show_main_window(app);
        Ok(true)
    }
}

pub fn show_task_panel(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window(TASK_PANEL_WINDOW)
        .ok_or("任务小窗未配置")?;
    window.show().map_err(|e| e.to_string())?;
    window.unminimize().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

pub fn toggle_task_panel(app: &AppHandle) -> Result<bool, String> {
    let window = app
        .get_webview_window(TASK_PANEL_WINDOW)
        .ok_or("任务小窗未配置")?;
    let visible = window.is_visible().map_err(|e| e.to_string())?;
    if visible {
        window.hide().map_err(|e| e.to_string())?;
        Ok(false)
    } else {
        window.show().map_err(|e| e.to_string())?;
        window.unminimize().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        Ok(true)
    }
}

use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, Emitter};

use crate::windows;

const TRAY_ID: &str = "main-tray";

pub fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let show_i = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let panel_i = MenuItem::with_id(app, "task_panel", "任务列表小窗", true, None::<&str>)?;
    let launch_i = MenuItem::with_id(app, "launch_last", "启动上次任务", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_i, &panel_i, &launch_i, &quit_i])?;

    let icon = app
        .default_window_icon()
        .ok_or("missing default window icon")?
        .clone();

    let _tray = TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon)
        .menu(&menu)
        .tooltip("TaskLaunch")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => windows::show_main_window(app),
            "task_panel" => {
                let _ = windows::toggle_task_panel(app);
            }
            "launch_last" => {
                let _ = app.emit("tray-launch-last", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                windows::show_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

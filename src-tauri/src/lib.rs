mod import_export;
mod launcher;
mod models;
mod storage;
mod tray;

use models::{
    ImportSummary, LaunchTaskResponse, Settings, Task, Template,
};
use tauri::{AppHandle, Manager, WindowEvent};

#[tauri::command]
fn get_tasks(app: AppHandle) -> Result<Vec<Task>, String> {
    storage::load_tasks(&app)
}

#[tauri::command]
fn save_tasks(app: AppHandle, tasks: Vec<Task>) -> Result<(), String> {
    storage::save_tasks(&app, &tasks)
}

#[tauri::command]
fn get_settings(app: AppHandle) -> Result<Settings, String> {
    storage::load_settings(&app)
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    storage::save_settings(&app, &settings)
}

#[tauri::command]
fn get_templates(app: AppHandle) -> Result<Vec<Template>, String> {
    storage::load_templates(&app)
}

#[tauri::command]
fn save_templates(app: AppHandle, templates: Vec<Template>) -> Result<(), String> {
    storage::save_templates(&app, &templates)
}

#[tauri::command]
fn get_data_dir(app: AppHandle) -> Result<String, String> {
    storage::get_data_dir_path(&app)
}

#[tauri::command]
fn export_data(app: AppHandle, path: String) -> Result<(), String> {
    import_export::export_to_path(&app, &path)
}

#[tauri::command]
fn import_data(
    app: AppHandle,
    path: String,
    mode: String,
    import_settings: bool,
) -> Result<ImportSummary, String> {
    import_export::import_from_path(&app, &path, &mode, import_settings)
}

#[tauri::command]
fn show_main_window(app: AppHandle) -> Result<(), String> {
    tray::show_main_window(&app);
    Ok(())
}

#[tauri::command]
fn launch_task(
    app: AppHandle,
    task: Task,
    skip_ids: Vec<String>,
) -> Result<LaunchTaskResponse, String> {
    let settings = storage::load_settings(&app)?;
    Ok(launcher::launch_task(&task, &settings, &skip_ids))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            tray::setup(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let minimize = storage::load_settings(window.app_handle())
                    .map(|s| s.minimize_to_tray)
                    .unwrap_or(true);
                if minimize {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_tasks,
            save_tasks,
            get_settings,
            save_settings,
            get_templates,
            save_templates,
            get_data_dir,
            export_data,
            import_data,
            show_main_window,
            launch_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

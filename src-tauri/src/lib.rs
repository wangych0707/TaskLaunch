mod launcher;
mod models;
mod storage;

use models::{
    LaunchTaskResponse, Settings, Task, Template,
};
use tauri::AppHandle;

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
        .invoke_handler(tauri::generate_handler![
            get_tasks,
            save_tasks,
            get_settings,
            save_settings,
            get_templates,
            save_templates,
            get_data_dir,
            launch_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

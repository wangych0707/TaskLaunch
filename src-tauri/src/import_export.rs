use std::fs;
use std::path::Path;

use chrono::Utc;
use tauri::AppHandle;

use crate::models::{ExportBundle, ImportSummary, Settings, Task, Template};
use crate::storage;

const EXPORT_VERSION: &str = "0.2";

pub fn build_export_bundle(app: &AppHandle) -> Result<ExportBundle, String> {
    Ok(ExportBundle {
        version: EXPORT_VERSION.to_string(),
        exported_at: Utc::now().to_rfc3339(),
        tasks: storage::load_tasks(app)?,
        templates: storage::load_templates(app)?,
        settings: storage::load_settings(app)?,
    })
}

pub fn export_to_path(app: &AppHandle, path: &str) -> Result<(), String> {
    let bundle = build_export_bundle(app)?;
    let content = serde_json::to_string_pretty(&bundle).map_err(|e| e.to_string())?;
    storage::atomic_write_path(Path::new(path), &content)
}

pub fn import_from_path(
    app: &AppHandle,
    path: &str,
    mode: &str,
    import_settings: bool,
) -> Result<ImportSummary, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let bundle: ExportBundle = serde_json::from_str(&content).map_err(|e| format!("无效的备份文件: {e}"))?;

    if bundle.version.is_empty() {
        return Err("备份文件缺少 version 字段".to_string());
    }

    let current_settings = storage::load_settings(app)?;
    let tasks_imported = bundle.tasks.len();
    let templates_imported = bundle.templates.len();

    let (tasks, templates, settings) = match mode {
        "replace" => (
            bundle.tasks,
            bundle.templates,
            if import_settings {
                merge_preserved_prefs(bundle.settings, &current_settings)
            } else {
                current_settings
            },
        ),
        "merge" => (
            merge_tasks(storage::load_tasks(app)?, bundle.tasks),
            merge_templates(storage::load_templates(app)?, bundle.templates),
            if import_settings {
                merge_preserved_prefs(bundle.settings, &current_settings)
            } else {
                current_settings
            },
        ),
        _ => return Err(format!("未知导入模式: {mode}")),
    };

    storage::save_tasks(app, &tasks)?;
    storage::save_templates(app, &templates)?;
    storage::save_settings(app, &settings)?;

    Ok(ImportSummary {
        tasks_imported,
        templates_imported,
        settings_imported: import_settings,
    })
}

/// Keep tray/shortcut/last-task prefs from current install when importing settings.
fn merge_preserved_prefs(mut imported: Settings, current: &Settings) -> Settings {
    imported.minimize_to_tray = current.minimize_to_tray;
    imported.shortcut_show_window = current.shortcut_show_window.clone();
    imported.shortcut_launch_last = current.shortcut_launch_last.clone();
    imported.last_launched_task_id = current.last_launched_task_id.clone();
    imported
}

fn merge_tasks(mut current: Vec<Task>, incoming: Vec<Task>) -> Vec<Task> {
    for task in incoming {
        if let Some(idx) = current.iter().position(|t| t.id == task.id) {
            current[idx] = task;
        } else {
            current.push(task);
        }
    }
    current
}

fn merge_templates(mut current: Vec<Template>, incoming: Vec<Template>) -> Vec<Template> {
    for template in incoming {
        if let Some(idx) = current.iter().position(|t| t.id == template.id) {
            current[idx] = template;
        } else {
            current.push(template);
        }
    }
    current
}

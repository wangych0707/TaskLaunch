use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use tauri::AppHandle;
use tauri::Manager;

use crate::models::{Settings, Task, Template};

pub fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

fn ensure_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = data_dir(app)?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn atomic_write(path: &Path, content: &str) -> Result<(), String> {
    let parent = path.parent().ok_or("Invalid path")?;
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let tmp = path.with_extension("tmp");
    {
        let mut file = fs::File::create(&tmp).map_err(|e| e.to_string())?;
        file.write_all(content.as_bytes())
            .map_err(|e| e.to_string())?;
    }
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    Ok(())
}

fn read_json<T: serde::de::DeserializeOwned>(path: &Path, default: T) -> Result<T, String> {
    if !path.exists() {
        return Ok(default);
    }
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    if content.trim().is_empty() {
        return Ok(default);
    }
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

fn write_json<T: serde::Serialize + ?Sized>(path: &Path, value: &T) -> Result<(), String> {
    let content = serde_json::to_string_pretty(value).map_err(|e| e.to_string())?;
    atomic_write(path, &content)
}

pub fn load_tasks(app: &AppHandle) -> Result<Vec<Task>, String> {
    let dir = ensure_data_dir(app)?;
    read_json(&dir.join("tasks.json"), Vec::new())
}

pub fn save_tasks(app: &AppHandle, tasks: &[Task]) -> Result<(), String> {
    let dir = ensure_data_dir(app)?;
    write_json(&dir.join("tasks.json"), tasks)
}

pub fn load_settings(app: &AppHandle) -> Result<Settings, String> {
    let dir = ensure_data_dir(app)?;
    read_json(&dir.join("settings.json"), Settings::default())
}

pub fn save_settings(app: &AppHandle, settings: &Settings) -> Result<(), String> {
    let dir = ensure_data_dir(app)?;
    write_json(&dir.join("settings.json"), settings)
}

pub fn load_templates(app: &AppHandle) -> Result<Vec<Template>, String> {
    let dir = ensure_data_dir(app)?;
    let path = dir.join("templates.json");
    let templates: Vec<Template> = read_json(&path, Vec::new())?;
    let filtered: Vec<Template> = templates
        .into_iter()
        .filter(|template| !is_old_builtin_template(template))
        .collect();
    write_json(&path, &filtered)?;
    Ok(filtered)
}

fn is_old_builtin_template(template: &Template) -> bool {
    matches!(
        (template.name.as_str(), template.description.as_deref()),
        ("写论文", Some("Word + 文献管理 + 论文资料夹"))
            | ("编程开发", Some("项目文件夹 + 浏览器文档"))
    )
}

pub fn save_templates(app: &AppHandle, templates: &[Template]) -> Result<(), String> {
    let dir = ensure_data_dir(app)?;
    write_json(&dir.join("templates.json"), templates)
}

pub fn get_data_dir_path(app: &AppHandle) -> Result<String, String> {
    Ok(data_dir(app)?.to_string_lossy().to_string())
}

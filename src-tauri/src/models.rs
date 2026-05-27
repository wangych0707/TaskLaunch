use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum LaunchItemType {
    App,
    File,
    Folder,
    Url,
    Command,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchItem {
    pub id: String,
    #[serde(rename = "type")]
    pub item_type: LaunchItemType,
    pub name: String,
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub working_directory: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub delay_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Todo,
    Doing,
    Done,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub status: TaskStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace_name: Option<String>,
    pub launch_items: Vec<LaunchItem>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Template {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub launch_items: Vec<LaunchItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomThemeColors {
    pub accent: String,
    pub background: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub surface: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(default = "default_launch_delay")]
    pub launch_delay_ms: u64,
    #[serde(default = "default_minimize_to_tray")]
    pub minimize_to_tray: bool,
    #[serde(default = "default_shortcut_show")]
    pub shortcut_show_window: String,
    #[serde(default = "default_shortcut_task_panel")]
    pub shortcut_task_panel: String,
    #[serde(default = "default_shortcut_launch")]
    pub shortcut_launch_last: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_launched_task_id: Option<String>,
    #[serde(default = "default_color_theme")]
    pub color_theme: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_colors: Option<CustomThemeColors>,
}

fn default_launch_delay() -> u64 {
    400
}

fn default_minimize_to_tray() -> bool {
    true
}

fn default_shortcut_show() -> String {
    "Ctrl+Shift+T".to_string()
}

fn default_shortcut_task_panel() -> String {
    "Ctrl+Alt+P".to_string()
}

fn default_shortcut_launch() -> String {
    "Ctrl+Shift+L".to_string()
}

fn default_color_theme() -> String {
    "mint".to_string()
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            launch_delay_ms: default_launch_delay(),
            minimize_to_tray: default_minimize_to_tray(),
            shortcut_show_window: default_shortcut_show(),
            shortcut_task_panel: default_shortcut_task_panel(),
            shortcut_launch_last: default_shortcut_launch(),
            last_launched_task_id: None,
            color_theme: default_color_theme(),
            custom_colors: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportBundle {
    pub version: String,
    pub exported_at: String,
    pub tasks: Vec<Task>,
    pub templates: Vec<Template>,
    pub settings: Settings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummary {
    pub tasks_imported: usize,
    pub templates_imported: usize,
    pub settings_imported: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchItemResult {
    pub item_id: String,
    pub name: String,
    pub success: bool,
    pub skipped: bool,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MissingItem {
    pub item_id: String,
    pub name: String,
    pub path: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchTaskResponse {
    pub status: String,
    pub results: Vec<LaunchItemResult>,
    pub missing: Vec<MissingItem>,
}

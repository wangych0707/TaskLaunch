use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::Duration;

use crate::models::{
    LaunchItem, LaunchItemResult, LaunchItemType, LaunchTaskResponse, MissingItem, Settings, Task,
};

pub fn sorted_items(task: &Task) -> Vec<LaunchItem> {
    let mut items = task.launch_items.clone();
    items.sort_by(|a, b| {
        let oa = a.order.unwrap_or(i32::MAX);
        let ob = b.order.unwrap_or(i32::MAX);
        oa.cmp(&ob).then_with(|| a.name.cmp(&b.name))
    });
    items
}

pub fn check_missing(item: &LaunchItem) -> Option<MissingItem> {
    match item.item_type {
        LaunchItemType::File | LaunchItemType::Folder | LaunchItemType::App => {
            let path = Path::new(&item.path);
            if !path.exists() {
                return Some(MissingItem {
                    item_id: item.id.clone(),
                    name: item.name.clone(),
                    path: item.path.clone(),
                    reason: format!("路径不存在: {}", item.path),
                });
            }
        }
        LaunchItemType::Command => {
            if let Some(wd) = &item.working_directory {
                if !Path::new(wd).exists() {
                    return Some(MissingItem {
                        item_id: item.id.clone(),
                        name: item.name.clone(),
                        path: wd.clone(),
                        reason: format!("工作目录不存在: {wd}"),
                    });
                }
            }
        }
        LaunchItemType::Url => {}
    }
    None
}

pub fn launch_task(
    task: &Task,
    settings: &Settings,
    skip_ids: &[String],
) -> LaunchTaskResponse {
    let items = sorted_items(task);
    let mut missing = Vec::new();

    for item in &items {
        if skip_ids.contains(&item.id) {
            continue;
        }
        if let Some(m) = check_missing(item) {
            missing.push(m);
        }
    }

    if !missing.is_empty() {
        return LaunchTaskResponse {
            status: "needs_confirmation".to_string(),
            results: vec![],
            missing,
        };
    }

    let mut results = Vec::new();

    for item in items {
        if skip_ids.contains(&item.id) {
            results.push(LaunchItemResult {
                item_id: item.id.clone(),
                name: item.name.clone(),
                success: true,
                skipped: true,
                message: Some("已跳过".to_string()),
            });
            continue;
        }

        let launch_result = launch_single_item(&item);
        let delay = item
            .delay_ms
            .unwrap_or(settings.launch_delay_ms);
        if delay > 0 {
            thread::sleep(Duration::from_millis(delay));
        }

        results.push(launch_result);
    }

    LaunchTaskResponse {
        status: "completed".to_string(),
        results,
        missing: vec![],
    }
}

fn launch_single_item(item: &LaunchItem) -> LaunchItemResult {
    let result = match item.item_type {
        LaunchItemType::Url => open::that(&item.path).map_err(|e| e.to_string()),
        LaunchItemType::File | LaunchItemType::Folder => {
            open::that(&item.path).map_err(|e| e.to_string())
        }
        LaunchItemType::App => launch_app(item),
        LaunchItemType::Command => launch_command(item),
    };

    match result {
        Ok(()) => LaunchItemResult {
            item_id: item.id.clone(),
            name: item.name.clone(),
            success: true,
            skipped: false,
            message: None,
        },
        Err(msg) => LaunchItemResult {
            item_id: item.id.clone(),
            name: item.name.clone(),
            success: false,
            skipped: false,
            message: Some(msg),
        },
    }
}

fn launch_app(item: &LaunchItem) -> Result<(), String> {
    let path = Path::new(&item.path);
    if !path.exists() {
        return Err(format!("程序不存在: {}", item.path));
    }

    let mut cmd = Command::new(&item.path);
    if let Some(args) = &item.args {
        if !args.trim().is_empty() {
            cmd.args(args.split_whitespace().map(String::from));
        }
    }
    if let Some(wd) = &item.working_directory {
        cmd.current_dir(wd);
    }

    cmd.spawn()
        .map(|_| ())
        .map_err(|e| format!("启动失败: {e}"))
}

fn launch_command(item: &LaunchItem) -> Result<(), String> {
    let wd = item.working_directory.as_deref();

    #[cfg(windows)]
    {
        let mut cmd = Command::new("cmd");
        cmd.args(["/C", &item.path]);
        if let Some(dir) = wd {
            cmd.current_dir(dir);
        }
        cmd.spawn()
            .map(|_| ())
            .map_err(|e| format!("命令执行失败: {e}"))
    }

    #[cfg(not(windows))]
    {
        let mut cmd = Command::new("sh");
        cmd.args(["-c", &item.path]);
        if let Some(dir) = wd {
            cmd.current_dir(dir);
        }
        cmd.spawn()
            .map(|_| ())
            .map_err(|e| format!("命令执行失败: {e}"))
    }
}

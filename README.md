# TaskLaunch

**一个任务，一个工作场景。**

TaskLaunch 是一个轻量级桌面任务启动器。你可以为每个任务绑定应用程序、文件、文件夹、网页和命令行命令，然后一键打开完成这个任务所需的整个工作环境。

它不是传统意义上的待办清单，而是一个“工作入口”：选中任务，点击 Start，直接回到对应的工作场景。

## 核心功能

- **任务列表**：记录任务名称、描述、状态和工作场景。
- **启动项绑定**：支持应用程序、文件、文件夹、网页、命令行命令。
- **一键启动**：按设定顺序打开任务需要的所有资源。
- **启动延迟**：为启动项之间设置间隔，避免一次性打开太多程序。
- **任务模板**：复用常见工作场景，例如写作、编程、课程学习。
- **系统托盘**：关闭窗口后可留在托盘，随时恢复。
- **全局快捷键**：快速显示/隐藏主窗口、打开任务小窗、启动上次任务。
- **导入导出**：用一个 JSON 文件备份和恢复任务、模板与设置。
- **界面配色**：提供多套预设主题，并支持自定义颜色。

## v0.2.1 更新

- 修复全局快捷键在主窗口隐藏后无法呼出的问题。
- “显示主窗口”快捷键改为“显示/隐藏主窗口”，再次按下会隐藏主界面。
- 新增“显示/隐藏任务小窗”快捷键，默认 `Ctrl+Alt+P`。
- 快捷键改为录制式设置，不需要手动输入。
- 快捷键注册迁移到 Tauri 后端，更适合托盘和隐藏窗口场景。
- 新增紧凑任务列表小窗，可快速启动任务。
- 新增配色选择与自定义颜色。
- 清理旧模板、旧发布资源和脚手架资源。

## 默认快捷键

| 功能 | 默认快捷键 |
| --- | --- |
| 显示/隐藏主窗口 | `Ctrl+Shift+T` |
| 显示/隐藏任务小窗 | `Ctrl+Alt+P` |
| 启动上次任务 | `Ctrl+Shift+L` |

如果快捷键被系统或其他软件占用，保存设置时会提示失败，请重新录制一个组合键。

## 启动项类型

| 类型 | 说明 |
| --- | --- |
| App | 打开指定应用程序 |
| File | 用系统默认程序打开文件 |
| Folder | 打开文件夹 |
| URL | 用默认浏览器打开网页 |
| Command | 在指定工作目录执行命令 |

示例：

```json
{
  "type": "app",
  "name": "VS Code",
  "path": "C:\\Users\\You\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"
}
```

```json
{
  "type": "url",
  "name": "Overleaf",
  "path": "https://www.overleaf.com"
}
```

```json
{
  "type": "command",
  "name": "启动开发服务",
  "path": "npm run dev",
  "workingDirectory": "D:\\Projects\\my-app"
}
```

完整示例见 [tasks.example.json](tasks.example.json)。

## 技术栈

- Tauri 2
- React 19
- TypeScript
- Vite
- Rust
- 本地 JSON 存储

## 本地开发

需要先安装 Node.js、Rust、Windows WebView2，以及 Windows 上的 Visual Studio Build Tools。

```bash
npm install
npm run tauri dev
```

## 构建

生成 Windows 安装包：

```bash
npm run tauri build
```

安装包通常位于：

```text
src-tauri/target/release/bundle/msi/
```

只生成免安装可执行文件：

```bash
npm run desktop:build
```

免安装版路径：

```text
src-tauri/target/release/tasklaunch.exe
```

## 数据存储

数据保存在系统应用数据目录中，可在应用的“设置”页面查看具体路径。

| 文件 | 内容 |
| --- | --- |
| `tasks.json` | 任务和启动项 |
| `templates.json` | 任务模板 |
| `settings.json` | 启动间隔、托盘、快捷键、主题等设置 |

写入数据时使用临时文件替换，降低异常退出导致文件损坏的风险。

## 备份格式

导出会生成类似 `tasklaunch-backup-YYYY-MM-DD.json` 的文件：

```json
{
  "version": "0.2.1",
  "exportedAt": "2026-05-27T12:00:00+00:00",
  "tasks": [],
  "templates": [],
  "settings": {
    "launchDelayMs": 400,
    "minimizeToTray": true,
    "shortcutShowWindow": "Ctrl+Shift+T",
    "shortcutTaskPanel": "Ctrl+Alt+P",
    "shortcutLaunchLast": "Ctrl+Shift+L"
  }
}
```

导入时可以选择合并或完全替换当前任务与模板。

## Windows 测试清单

- 新建任务，编辑名称、描述、状态，重启后数据仍然存在。
- 添加 App、File、Folder、URL、Command 五类启动项并启动任务。
- 路径包含空格时能正常打开。
- 文件或文件夹不存在时会提示是否跳过。
- 调整启动项顺序后，启动顺序正确。
- 修改全局启动间隔后，启动项之间有对应延迟。
- 创建模板后，可以用模板快速新建任务。
- 关闭主窗口后应用留在托盘。
- 主窗口快捷键按一次显示，再按一次隐藏。
- 任务小窗快捷键可以显示/隐藏小窗。
- 启动任务后，启动上次任务快捷键能再次启动该任务。
- 导出备份后，可以用合并或替换方式导入。

## 路线图

- v0.3：更完整的启动前检查、任务恢复提示、快捷键状态诊断。
- v0.4：macOS / Linux 体验优化。
- v0.5：更灵活的工作场景模板与插件能力。

## License

MIT

import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { newId } from "../api";
import type { LaunchItem, LaunchItemType } from "../types";
import { TYPE_LABELS } from "../types";

interface Props {
  item?: LaunchItem;
  onSave: (item: LaunchItem) => void;
  onCancel: () => void;
}

const TYPES: LaunchItemType[] = ["app", "file", "folder", "url", "command"];

export function LaunchItemForm({ item, onSave, onCancel }: Props) {
  const [type, setType] = useState<LaunchItemType>(item?.type ?? "file");
  const [name, setName] = useState(item?.name ?? "");
  const [path, setPath] = useState(item?.path ?? "");
  const [args, setArgs] = useState(item?.args ?? "");
  const [workingDirectory, setWorkingDirectory] = useState(
    item?.workingDirectory ?? "",
  );
  const [delayMs, setDelayMs] = useState(
    item?.delayMs?.toString() ?? "",
  );
  const hasValidDelay =
    delayMs.trim() === "" ||
    (Number.isFinite(Number(delayMs)) && Number(delayMs) >= 0);
  const canSave = name.trim().length > 0 && path.trim().length > 0 && hasValidDelay;

  async function browsePath() {
    if (type === "url") return;
    if (type === "app") {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [{ name: "Executable", extensions: ["exe"] }],
      });
      if (selected && typeof selected === "string") {
        setPath(selected);
        if (!name) setName(selected.split(/[/\\]/).pop() ?? "");
      }
      return;
    }
    if (type === "folder") {
      const selected = await open({ directory: true, multiple: false });
      if (selected && typeof selected === "string") {
        setPath(selected);
        if (!name) setName(selected.split(/[/\\]/).pop() ?? "");
      }
      return;
    }
    const selected = await open({ multiple: false, directory: false });
    if (selected && typeof selected === "string") {
      setPath(selected);
      if (!name) setName(selected.split(/[/\\]/).pop() ?? "");
    }
  }

  async function browseWorkingDirectory() {
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === "string") {
      setWorkingDirectory(selected);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      id: item?.id ?? newId(),
      type,
      name: name.trim(),
      path: path.trim(),
      args: args.trim() || undefined,
      workingDirectory: workingDirectory.trim() || undefined,
      delayMs: delayMs.trim() ? Number(delayMs) : undefined,
      order: item?.order,
    });
  }

  return (
    <form className="launch-item-form" onSubmit={handleSubmit}>
      <label>
        类型
        <select value={type} onChange={(e) => setType(e.target.value as LaunchItemType)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <label>
        显示名称
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        {type === "url" ? "网址" : type === "command" ? "命令" : "路径"}
        <div className="path-row">
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder={
              type === "url"
                ? "https://..."
                : type === "command"
                  ? "npm run dev"
                  : "D:\\path\\to\\item"
            }
          />
          {type !== "url" && type !== "command" && (
            <button type="button" className="btn" onClick={browsePath}>
              浏览
            </button>
          )}
        </div>
      </label>
      {type === "app" && (
        <label>
          启动参数
          <input
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            placeholder="可选"
          />
        </label>
      )}
      {type === "command" && (
        <label>
          工作目录
          <div className="path-row">
            <input
              value={workingDirectory}
              onChange={(e) => setWorkingDirectory(e.target.value)}
              placeholder="D:\\Projects\\my-app"
            />
            <button
              type="button"
              className="btn"
              onClick={browseWorkingDirectory}
            >
              浏览
            </button>
          </div>
        </label>
      )}
      <label>
        启动后延迟 (ms)
        <input
          type="number"
          min={0}
          value={delayMs}
          onChange={(e) => setDelayMs(e.target.value)}
          placeholder="留空使用全局设置"
        />
        {!hasValidDelay && (
          <span className="field-error">请输入 0 或更大的数字</span>
        )}
      </label>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn primary" disabled={!canSave}>
          保存
        </button>
      </div>
    </form>
  );
}

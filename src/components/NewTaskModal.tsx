import { useState } from "react";
import { useApp } from "../context/AppContext";

interface Props {
  onClose: () => void;
}

export function NewTaskModal({ onClose }: Props) {
  const { templates, createTask } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const canCreate = title.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      workspaceName: workspaceName.trim() || undefined,
      templateId: templateId || undefined,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>新建任务</h3>
        <form onSubmit={handleSubmit}>
          <label>
            任务名称
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：完成实验报告"
              autoFocus
            />
          </label>
          <label>
            工作场景名称
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="例如：实验报告写作环境"
            />
          </label>
          <label>
            描述
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="任务说明..."
            />
          </label>
          <label>
            套用模板
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="">无（空白启动项）</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn primary" disabled={!canCreate}>
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

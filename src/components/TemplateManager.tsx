import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { LaunchItem, Template } from "../types";
import { LaunchItemList } from "./LaunchItemList";

export function TemplateManager({ onClose }: { onClose: () => void }) {
  const { templates, createTemplate, updateTemplate, deleteTemplate } =
    useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Template | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (!selectedId && templates.length > 0) {
      setSelectedId(templates[0].id);
    }
  }, [templates, selectedId]);

  const selected = templates.find((t) => t.id === selectedId) ?? null;
  const editing = draft ?? selected;
  const canSave = Boolean(editing?.name.trim());

  function startNew() {
    setIsNew(true);
    setSelectedId(null);
    setDraft({
      id: "",
      name: "新模板",
      description: "",
      launchItems: [],
    });
  }

  function selectTemplate(id: string) {
    setIsNew(false);
    setDraft(null);
    setSelectedId(id);
  }

  async function handleSave() {
    const toSave = draft ?? selected;
    if (!toSave) return;
    if (isNew) {
      const id = await createTemplate({
        name: toSave.name,
        description: toSave.description,
        launchItems: toSave.launchItems,
      });
      setSelectedId(id);
    } else {
      await updateTemplate(toSave);
    }
    setDraft(null);
    setIsNew(false);
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`删除模板「${selected.name}」？`)) return;
    await deleteTemplate(selected.id);
    setSelectedId(null);
    setDraft(null);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h3>任务模板</h3>
        <div className="template-layout">
          <aside>
            <button type="button" className="btn primary" onClick={startNew}>
              + 新模板
            </button>
            <ul className="template-list">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={selectedId === t.id && !isNew ? "active" : ""}
                    onClick={() => selectTemplate(t.id)}
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="template-editor">
            {editing ? (
              <>
                <label>
                  模板名称
                  <input
                    value={draft?.name ?? editing.name}
                    onChange={(e) =>
                      setDraft({ ...(draft ?? editing), name: e.target.value })
                    }
                  />
                </label>
                <label>
                  描述
                  <input
                    value={draft?.description ?? editing.description ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...(draft ?? editing),
                        description: e.target.value,
                      })
                    }
                  />
                </label>
                <LaunchItemList
                  items={draft?.launchItems ?? editing.launchItems}
                  onChange={(launchItems: LaunchItem[]) =>
                    setDraft({ ...(draft ?? editing), launchItems })
                  }
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn primary"
                    disabled={!canSave}
                    onClick={handleSave}
                  >
                    保存模板
                  </button>
                  {!isNew && selected && (
                    <button
                      type="button"
                      className="btn danger"
                      onClick={handleDelete}
                    >
                      删除
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="empty-hint">选择或创建模板</p>
            )}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

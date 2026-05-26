import { useState } from "react";
import type { LaunchItem } from "../types";
import { TYPE_LABELS } from "../types";
import { LaunchItemForm } from "./LaunchItemForm";

interface Props {
  items: LaunchItem[];
  onChange: (items: LaunchItem[]) => void;
}

export function LaunchItemList({ items, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const sorted = [...items].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );

  function reindex(next: LaunchItem[]) {
    return next.map((item, i) => ({ ...item, order: i }));
  }

  function handleSave(item: LaunchItem) {
    const exists = items.some((x) => x.id === item.id);
    const next = exists
      ? items.map((x) => (x.id === item.id ? item : x))
      : [...items, item];
    onChange(reindex(next));
    setEditingId(null);
    setAdding(false);
  }

  function handleDelete(id: string) {
    onChange(reindex(items.filter((x) => x.id !== id)));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = sorted.findIndex((x) => x.id === id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(reindex(next));
  }

  return (
    <div className="launch-items">
      <div className="section-header">
        <h3>启动项</h3>
        <button
          type="button"
          className="btn small"
          onClick={() => {
            setAdding(true);
            setEditingId(null);
          }}
        >
          + 添加
        </button>
      </div>

      {adding && (
        <LaunchItemForm
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      <ul className="launch-item-list">
        {sorted.map((item) =>
          editingId === item.id ? (
            <li key={item.id} className="editing">
              <LaunchItemForm
                item={item}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li key={item.id}>
              <div className="launch-item-row">
                <span className={`type-tag type-${item.type}`}>
                  [{TYPE_LABELS[item.type]}]
                </span>
                <span className="item-name">{item.name}</span>
                <span className="item-path" title={item.path}>
                  {item.path}
                </span>
                <div className="item-actions">
                  <button
                    type="button"
                    className="btn icon"
                    title="上移"
                    onClick={() => move(item.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn icon"
                    title="下移"
                    onClick={() => move(item.id, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => {
                      setEditingId(item.id);
                      setAdding(false);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="btn small danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            </li>
          ),
        )}
      </ul>
      {sorted.length === 0 && !adding && (
        <p className="empty-hint">尚未添加启动项</p>
      )}
    </div>
  );
}

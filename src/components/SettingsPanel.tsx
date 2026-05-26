import { useState } from "react";
import { useApp } from "../context/AppContext";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, dataDir, saveSettings } = useApp();
  const [delay, setDelay] = useState(settings.launchDelayMs.toString());

  async function handleSave() {
    const ms = Number(delay);
    if (Number.isNaN(ms) || ms < 0) return;
    await saveSettings({ launchDelayMs: ms });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>设置</h3>
        <label>
          全局启动间隔 (ms)
          <input
            type="number"
            min={0}
            step={100}
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
          />
          <span className="hint">每个启动项之间的默认等待时间</span>
        </label>
        <label>
          数据目录
          <input value={dataDir} readOnly />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

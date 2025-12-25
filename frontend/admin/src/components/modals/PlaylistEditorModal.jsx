import { createPortal } from "react-dom";

export default function PlaylistEditorOverlay({ items, setItems, onClose }) {
  const move = (index, dir) => {
    const copy = [...items];
    const t = index + dir;
    if (t < 0 || t >= copy.length) return;
    [copy[index], copy[t]] = [copy[t], copy[index]];
    setItems(copy);
  };

  const updateDuration = (id, duration) => {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, duration } : i)
    );
  };

  const remove = (id) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  return createPortal(
    <div className="editor-overlay">
      {/* ---------- HEADER ---------- */}
      <div className="editor-header">
        <h2>Edit Playlist</h2>
        <button onClick={onClose}>Done</button>
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="editor-content">
        {items.map((item, idx) => (
          <div key={item.id} className="editor-row">
            <img src={item.previewUrl} className="editor-thumb" />

            <div className="editor-meta">
              <span>#{idx + 1}</span>
              <input
                type="number"
                min={2}
                max={30}
                value={item.duration}
                onChange={e =>
                  updateDuration(item.id, +e.target.value)
                }
              />
            </div>

            <div className="editor-actions">
              <button onClick={() => move(idx, -1)}>↑</button>
              <button onClick={() => move(idx, 1)}>↓</button>
              <button className="danger" onClick={() => remove(item.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body   // 🚨 THIS IS THE KEY
  );
}

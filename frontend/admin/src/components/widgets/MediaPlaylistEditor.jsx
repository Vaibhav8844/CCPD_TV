import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export default function MediaPlaylistEditor() {
  const [items, setItems] = useState([]);
  const [url, setUrl] = useState("");
  const [type, setType] = useState("pdf");
  const [duration, setDuration] = useState(6);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  /* ADD ITEM */
  const addItem = () => {
    if (!url) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        url,
        duration
      }
    ]);

    setUrl("");
  };

  /* REMOVE */
  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  /* REORDER */
  const moveItem = (index, dir) => {
    const copy = [...items];
    const target = index + dir;

    if (target < 0 || target >= copy.length) return;

    [copy[index], copy[target]] = [copy[target], copy[index]];
    setItems(copy);
  };

  /* PUSH TO BACKEND */
  const save = async () => {
    if (!items.length) return;

    try {
      setLoading(true);
      setMsg("");

      await axios.post(`${BACKEND_URL}/update-playlist`, {
        playlist: items
      });

      setMsg("Playlist pushed to TV");
    } catch {
      setMsg("Failed to push playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-box">
      <h4>Media Playlist</h4>

      {/* ADD FORM */}
      <div className="row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
        </select>

        <input
          type="url"
          placeholder="Paste PDF or Image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <input
          type="number"
          min={2}
          max={30}
          value={duration}
          onChange={(e) => setDuration(+e.target.value)}
        />

        <button onClick={addItem}>Add</button>
      </div>

      {/* PLAYLIST */}
      <ul className="playlist">
        {items.map((item, idx) => (
          <li key={item.id}>
            <span>
              {idx + 1}. {item.type.toUpperCase()} — {item.duration}s
            </span>

            <div className="controls">
              <button onClick={() => moveItem(idx, -1)}>↑</button>
              <button onClick={() => moveItem(idx, 1)}>↓</button>
              <button onClick={() => removeItem(item.id)}>✕</button>
            </div>
          </li>
        ))}
      </ul>

      <button className="save" onClick={save} disabled={loading}>
        {loading ? "Saving..." : "Push Playlist to TV"}
      </button>

      {msg && <p className="status">{msg}</p>}
    </div>
  );
}

import { useState,useEffect } from "react";
import api from "../../services/api";
import { BACKEND_URL } from "../../config";
import PlaylistEditorModal from "../modals/PlaylistEditorModal";
import { useDashboard } from "../../context/DashboardContext";

export default function MediaPlaylistWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const { dashboard } = useDashboard();
  useEffect(() => {
    if (!dashboard) return;

    const slides = dashboard.widgets?.mediaSlideshow;
    if (!slides || slides.length === 0) return;

    setItems(
      slides.map((s) => ({
        id: crypto.randomUUID(),
        sourceType: "image",
        backendUrl: s.url,
        duration: s.duration,
        previewUrl: s.url,
      }))
    );
  }, [dashboard]);

  const uploadImage = async (file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("duration", 6);

    setLoading(true);
    setMsg("");

    try {
      const res = await api.post(`${BACKEND_URL}/upload-file`, form);

      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sourceType: "image",
          previewUrl: URL.createObjectURL(file),
          backendUrl: res.data.items[0].url,
          duration: 6,
        },
      ]);
    } catch {
      setMsg("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      files.forEach(uploadImage);
    };
    input.click();
  };

  /* PUSH PLAYLIST */
  const save = async () => {
    if (items.length === 0) {
      alert("⚠️ Please add at least one item to the playlist");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      await api.post(`${BACKEND_URL}/update-playlist`, {
        playlist: items.map((i) => ({
          type: "image",
          url: i.backendUrl,
          duration: i.duration,
        })),
      });
      setMsg(`✓ Playlist saved! ${items.length} item(s)`);
      alert(`✓ Playlist pushed to TV successfully!\n${items.length} items in playlist`);
    } catch (error) {
      setMsg("❌ Failed to push playlist");
      alert("❌ Failed to push playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-box">
      <h4>Media Playlist</h4>

      {items.length > 0 && (
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "5px 0" }}>
          {items.length} item(s) in playlist
        </p>
      )}

      <div className="editor-actions" style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <button onClick={pickImage} disabled={loading} style={{ flex: 1 }}>
          {loading ? "⏳" : "➕"} Add
        </button>

        <button onClick={() => setOpen(true)} disabled={items.length === 0 || loading} style={{ flex: 1 }}>
          ✏️ Edit
        </button>

        <button onClick={save} disabled={loading} style={{ flex: 1 }}>
          {loading ? "⏳ Saving..." : "💾 Save"}
        </button>
      </div>

      {msg && (
        <p style={{ 
          fontSize: "0.75rem", 
          color: msg.includes("✓") ? "#22c55e" : "#ef4444",
          margin: "8px 0 0 0",
          textAlign: "center"
        }}>
          {msg}
        </p>
      )}

      {open && (
        <PlaylistEditorModal
          items={items}
          setItems={setItems}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

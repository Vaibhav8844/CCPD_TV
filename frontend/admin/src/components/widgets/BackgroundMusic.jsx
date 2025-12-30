import { useState, useEffect } from "react";
import api from "../../services/api";
import { BACKEND_URL } from "../../config";
import { useDashboard } from "../../context/DashboardContext";

const MUSIC_OPTIONS = [
  { id: "none", name: "None", url: "" },
  { id: "calm-piano", name: "Professional Piano", url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3" },
  { id: "ambient", name: "Corporate Ambient", url: "https://www.bensound.com/bensound-music/bensound-perception.mp3" },
  { id: "soft-jazz", name: "Office Jazz", url: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3" },
  { id: "classical", name: "Classical Elegance", url: "https://www.bensound.com/bensound-music/bensound-pianomoment.mp3" },
  { id: "lofi", name: "Focus & Productivity", url: "https://www.bensound.com/bensound-music/bensound-actionable.mp3" },
  { id: "custom", name: "Upload Custom Audio", url: "" }
];

export default function BackgroundMusic() {
  const [enabled, setEnabled] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState("none");
  const [volume, setVolume] = useState(30);
  const [customAudioUrl, setCustomAudioUrl] = useState("");
  const [customFilename, setCustomFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const { dashboard } = useDashboard();

  useEffect(() => {
    if (!dashboard) return;
    
    const music = dashboard.widgets?.backgroundMusic;
    if (music) {
      setEnabled(music.enabled || false);
      setSelectedMusic(music.musicId || "none");
      setVolume(music.volume || 30);
      setCustomAudioUrl(music.customUrl || "");
    }
  }, [dashboard]);

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await api.post(`${BACKEND_URL}/upload-audio`, formData);
      setCustomAudioUrl(res.data.url);
      setCustomFilename(res.data.filename);
      alert("Audio uploaded successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const pickAudio = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/mp3,audio/mpeg,audio/wav,audio/ogg";
    input.onchange = handleAudioUpload;
    input.click();
  };

  const [saving, setSaving] = useState(false);

  const saveMusic = async () => {
    const selectedOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    
    if (enabled && selectedMusic === "custom" && !customAudioUrl) {
      alert("⚠️ Please upload a custom audio file first");
      return;
    }

    let musicUrl = "";
    if (selectedMusic === "custom" && customAudioUrl) {
      musicUrl = customAudioUrl;
    } else if (selectedOption) {
      musicUrl = selectedOption.url;
    }

    setSaving(true);
    try {
      await api.post(`${BACKEND_URL}/update-widget`, {
        widget: "backgroundMusic",
        data: {
          enabled: enabled && selectedMusic !== "none",
          musicId: selectedMusic,
          musicUrl,
          volume: volume / 100
        }
      });
      alert(`✓ Background music settings saved!\nStatus: ${enabled ? "Enabled" : "Disabled"}`);
    } catch (error) {
      alert("❌ Failed to save music settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h4>Background Music</h4>
      </div>

      <div className="widget-body">
        <div className="input-group">
          <label className="checkbox-label" style={{ fontWeight: "600" }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            Enable Background Music
          </label>
        </div>

        {enabled && (
          <>
            <div className="input-group">
              <label className="form-label">Select Music:</label>
              <select
                className="widget-select"
                value={selectedMusic}
                onChange={(e) => setSelectedMusic(e.target.value)}
              >
                {MUSIC_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMusic === "custom" && (
              <div className="input-group">
                <button className="secondary-btn" onClick={pickAudio} disabled={uploading}>
                  {uploading ? "⏳ Uploading..." : "📁 Choose Audio File"}
                </button>
                {customFilename && (
                  <p className="success-text">
                    ✓ Selected: {customFilename}
                  </p>
                )}
              </div>
            )}

            <div className="input-group">
              <label className="form-label">Volume: {volume}%</label>
              <input
                className="widget-range"
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>
          </>
        )}
      </div>

      <div className="widget-footer">
        <button className="widget-btn" onClick={saveMusic} disabled={uploading || saving}>
          {saving ? "⏳ Saving..." : "💾 Save Music Settings"}
        </button>
      </div>
    </div>
  );
}

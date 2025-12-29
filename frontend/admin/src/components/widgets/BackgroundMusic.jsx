import { useState, useEffect } from "react";
import api from "../../services/api";
import { BACKEND_URL } from "../../config";
import { useDashboard } from "../../context/DashboardContext";

const MUSIC_OPTIONS = [
  { id: "none", name: "None", url: "" },
  { id: "calm-piano", name: "Calm Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "ambient", name: "Ambient Atmosphere", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "soft-jazz", name: "Soft Jazz", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "classical", name: "Classical", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: "lofi", name: "Lo-Fi Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
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

  const saveMusic = async () => {
    const selectedOption = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    
    let musicUrl = "";
    if (selectedMusic === "custom" && customAudioUrl) {
      musicUrl = customAudioUrl;
    } else if (selectedOption) {
      musicUrl = selectedOption.url;
    }

    await api.post(`${BACKEND_URL}/update-widget`, {
      widget: "backgroundMusic",
      data: {
        enabled: enabled && selectedMusic !== "none",
        musicId: selectedMusic,
        musicUrl,
        volume: volume / 100
      }
    });

    alert("Background music settings saved!");
  };

  return (
    <div className="editor background-music-editor">
      <h4>Background Music</h4>

      <label style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          style={{ marginRight: "8px" }}
        />
        <strong>Enable Background Music</strong>
      </label>

      {enabled && (
        <>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Select Music:
            </label>
            <select
              value={selectedMusic}
              onChange={(e) => setSelectedMusic(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px", 
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            >
              {MUSIC_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {selectedMusic === "custom" && (
            <div style={{ marginBottom: "15px" }}>
              <button onClick={pickAudio} disabled={uploading}>
                {uploading ? "Uploading..." : "📁 Choose Audio File"}
              </button>
              {customFilename && (
                <p style={{ margin: "8px 0", fontSize: "14px", color: "#666" }}>
                  Selected: {customFilename}
                </p>
              )}
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Volume: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        </>
      )}

      <button onClick={saveMusic} style={{ width: "100%" }}>
        Save Music Settings
      </button>
    </div>
  );
}

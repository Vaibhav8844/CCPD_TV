import { useState } from "react";
import api from "../../services/api";
import { BACKEND_URL } from "../../config";

function extractVideoId(url) {
  if (!url) return "";

  // Full URL
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : url; // fallback = raw ID
}

export default function YoutubePlayer() {
  const [videoSource, setVideoSource] = useState("youtube"); // "youtube" or "uploaded"
  const [url, setUrl] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [loop, setLoop] = useState(true);
  const [mute, setMute] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await api.post(`${BACKEND_URL}/upload-video`, formData);
      setUploadedVideoUrl(res.data.url);
      setUploadedFilename(res.data.filename);
      alert("Video uploaded successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const pickVideo = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm,video/ogg,video/quicktime";
    input.onchange = handleVideoUpload;
    input.click();
  };

  const saveVideo = async () => {
    if (videoSource === "youtube") {
      const videoId = extractVideoId(url);
      if (!videoId) {
        alert("⚠️ Invalid YouTube URL\nPlease enter a valid YouTube URL or video ID");
        return;
      }

      setSaving(true);
      try {
        await api.post(`${BACKEND_URL}/update-widget`, {
          widget: "youtube",
          data: {
            videoSource: "youtube",
            videoId,
            videoUrl: "",
            autoplay: true,
            mute,
            loop
          }
        });
        alert(`✓ YouTube video sent to TV!\nVideo ID: ${videoId}`);
      } catch (error) {
        alert("❌ Failed to save video. Please try again.");
      } finally {
        setSaving(false);
      }
    } else {
      if (!uploadedVideoUrl) {
        alert("⚠️ Please upload a video file first");
        return;
      }

      setSaving(true);
      try {
        await api.post(`${BACKEND_URL}/update-widget`, {
          widget: "youtube",
          data: {
            videoSource: "uploaded",
            videoId: "",
            videoUrl: uploadedVideoUrl,
            autoplay: true,
            mute,
            loop
          }
        });
        alert(`✓ Uploaded video sent to TV!\nFile: ${uploadedFilename}`);
      } catch (error) {
        alert("❌ Failed to save video. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h4>Video Player</h4>
      </div>

      <div className="widget-body">
        <div className="input-group" style={{ marginBottom: "15px" }}>
          <label className="radio-label">
            <input
              type="radio"
              name="videoSource"
              value="youtube"
              checked={videoSource === "youtube"}
              onChange={(e) => setVideoSource(e.target.value)}
            />
            {" "}YouTube URL
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="videoSource"
              value="uploaded"
              checked={videoSource === "uploaded"}
              onChange={(e) => setVideoSource(e.target.value)}
            />
            {" "}Upload Video File
          </label>
        </div>

        {videoSource === "youtube" ? (
          <div className="input-group">
            <input
              className="widget-input"
              placeholder="YouTube URL or Video ID"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        ) : (
          <div className="input-group">
            <button className="secondary-btn" onClick={pickVideo} disabled={uploading}>
              {uploading ? "⏳ Uploading..." : "📁 Choose Video File"}
            </button>
            {uploadedFilename && (
              <p className="success-text">
                ✓ Selected: {uploadedFilename}
              </p>
            )}
          </div>
        )}

        <div className="input-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={mute}
              onChange={() => setMute(!mute)}
            />
            Mute (required for autoplay)
          </label>
        </div>

        <div className="input-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={loop}
              onChange={() => setLoop(!loop)}
            />
            Loop video
          </label>
        </div>
      </div>

      <div className="widget-footer">
        <button className="widget-btn" onClick={saveVideo} disabled={uploading || saving}>
          {saving ? "⏳ Sending to TV..." : "📺 Play on TV"}
        </button>
      </div>
    </div>
  );
}

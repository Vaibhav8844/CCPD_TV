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
      if (!videoId) return alert("Invalid YouTube URL");

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

      alert("YouTube video sent to TV");
    } else {
      if (!uploadedVideoUrl) return alert("Please upload a video first");

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

      alert("Uploaded video sent to TV");
    }
  };

  return (
    <div className="editor youtube-editor">
      <h4>Video Player</h4>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          <input
            type="radio"
            name="videoSource"
            value="youtube"
            checked={videoSource === "youtube"}
            onChange={(e) => setVideoSource(e.target.value)}
          />
          {" "}YouTube URL
        </label>

        <label style={{ display: "block" }}>
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
        <div>
          <input
            placeholder="YouTube URL or Video ID"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      ) : (
        <div style={{ marginBottom: "15px" }}>
          <button onClick={pickVideo} disabled={uploading}>
            {uploading ? "Uploading..." : "📁 Choose Video File"}
          </button>
          {uploadedFilename && (
            <p style={{ margin: "8px 0", fontSize: "14px", color: "#666" }}>
              Selected: {uploadedFilename}
            </p>
          )}
        </div>
      )}

      <label>
        <input
          type="checkbox"
          checked={mute}
          onChange={() => setMute(!mute)}
        />
        Mute (required for autoplay)
      </label>

      <label>
        <input
          type="checkbox"
          checked={loop}
          onChange={() => setLoop(!loop)}
        />
        Loop video
      </label>

      <button onClick={saveVideo}>Play on TV</button>
    </div>
  );
}

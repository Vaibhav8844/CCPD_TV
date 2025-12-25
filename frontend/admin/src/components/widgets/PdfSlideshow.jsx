import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export default function PdfSlideshow() {
  const [file, setFile] = useState(null);
  const [interval, setIntervalTime] = useState(5);
  const [loading, setLoading] = useState(false);

  const uploadAndSave = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("duration", interval);

    try {
      setLoading(true);

      // 1️⃣ Upload PDF → backend converts to images
      const res = await axios.post(
        `${BACKEND_URL}/upload-file`,
        form
      );

      // Backend returns image slides
      const images = res.data.items.map(i => i.url);

      // 2️⃣ Send images to TV (same widget as before)
      await axios.post(`${BACKEND_URL}/update-widget`, {
        widget: "pdfslideshow",
        data: {
          images,
          interval
        }
      });

      alert("PDF slideshow sent to TV");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to upload PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor">
      <h4>PDF Slideshow</h4>

      {/* PDF Picker */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Interval */}
      <input
        type="number"
        min="1"
        value={interval}
        onChange={(e) => setIntervalTime(Number(e.target.value))}
        placeholder="Seconds per slide"
      />

      <button onClick={uploadAndSave} disabled={loading}>
        {loading ? "Uploading..." : "Upload & Save"}
      </button>
    </div>
  );
}

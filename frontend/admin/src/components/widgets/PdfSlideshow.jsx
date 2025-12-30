import { useState,useEffect } from "react";
import api from "../../services/api";
import { BACKEND_URL } from "../../config";
import { useDashboard } from "../../context/DashboardContext";

export default function PdfSlideshow() {
  const [file, setFile] = useState(null);
  const [interval, setIntervalTime] = useState(5);
  const [loading, setLoading] = useState(false);
  const { dashboard } = useDashboard();

  useEffect(() => {
  if (!dashboard) return;

  const widget = dashboard.widgets?.pdfslideshow;
  if (!widget) return;

  if (widget.interval) {
    setIntervalTime(widget.interval);
  }

}, [dashboard]);

  const uploadAndSave = async () => {
    if (!file) {
      alert("⚠️ Please select a PDF file first");
      return;
    }

    if (interval < 1 || interval > 60) {
      alert("⚠️ Slide duration must be between 1 and 60 seconds");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("duration", interval);

    try {
      setLoading(true);

      const res = await api.post(
        `${BACKEND_URL}/upload-file`,
        form
      );

      const images = res.data.items.map(i => i.url);

      await api.post(`${BACKEND_URL}/update-widget`, {
        widget: "pdfslideshow",
        data: {
          images,
          interval
        }
      });

      alert(`✓ PDF slideshow uploaded successfully!\n${images.length} slides • ${interval}s per slide`);
      setFile(null);
    } catch (err) {
      alert("❌ Failed to upload PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h4>PDF Slideshow</h4>
      </div>

      <div className="widget-body">
        <div className="input-group">
          <label className="form-label">Select PDF File:</label>
          <input
            className="widget-input"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading}
          />
          {file && (
            <p className="success-text">
              ✓ Selected: {file.name}
            </p>
          )}
        </div>

        <div className="input-group">
          <label className="form-label">Seconds per slide (1-60):</label>
          <input
            className="widget-input"
            type="number"
            min="1"
            max="60"
            value={interval}
            onChange={(e) => setIntervalTime(Number(e.target.value))}
            placeholder="Duration"
            disabled={loading}
          />
        </div>
      </div>

      <div className="widget-footer">
        <button className="widget-btn" onClick={uploadAndSave} disabled={loading}>
          {loading ? "⏳ Processing PDF..." : "📤 Upload & Display on TV"}
        </button>
      </div>
    </div>
  );
}

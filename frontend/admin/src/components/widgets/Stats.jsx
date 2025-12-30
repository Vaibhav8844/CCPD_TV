import { useState } from "react";
import api from "../../services/api";
import { BACKEND_URL } from "../../config";

export default function Stats() {
  const [placed, setPlaced] = useState("");
  const [total, setTotal] = useState("");
  const [avgPackage, setAvgPackage] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const placedNum = parseInt(placed);
    const totalNum = parseInt(total);

    if (!placed || !total) {
      alert("⚠️ Please enter both placed and total students");
      return;
    }

    if (placedNum < 0 || totalNum < 0) {
      alert("⚠️ Numbers cannot be negative");
      return;
    }

    if (placedNum > totalNum) {
      alert("⚠️ Placed students cannot exceed total students");
      return;
    }

    setLoading(true);
    try {
      await api.post(`${BACKEND_URL}/update-widget`, {
        widget: "stats",
        data: { placed, total, avgPackage }
      });
      alert(`✓ Placement stats updated!
${placed}/${total} students placed
${avgPackage ? `Avg Package: ${avgPackage}` : ''}`);
    } catch (error) {
      alert("❌ Failed to save stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h4>Placement Stats</h4>
      </div>

      <div className="widget-body">
        <div className="input-group">
          <label className="form-label">Students Placed:</label>
          <input
            className="widget-input"
            type="number"
            min="0"
            placeholder="e.g., 85"
            value={placed}
            onChange={(e) => setPlaced(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="form-label">Total Students:</label>
          <input
            className="widget-input"
            type="number"
            min="0"
            placeholder="e.g., 100"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="form-label">Average Package (Optional):</label>
          <input
            className="widget-input"
            placeholder="e.g., 8.5 LPA"
            value={avgPackage}
            onChange={(e) => setAvgPackage(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="widget-footer">
        <button className="widget-btn" onClick={save} disabled={loading}>
          {loading ? "⏳ Saving..." : "💾 Save Stats"}
        </button>
      </div>
    </div>
  );
}

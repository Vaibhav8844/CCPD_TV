import { useState } from "react";
import api from "../../services/api";
import { BACKEND_URL } from "../../config";

export default function Spotlight() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [ctc, setCtc] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!company.trim()) {
      alert("⚠️ Company name is required");
      return;
    }

    setLoading(true);
    try {
      await api.post(`${BACKEND_URL}/update-widget`, {
        widget: "spotlight",
        data: { company, role, ctc }
      });
      alert(`✓ Spotlight updated for ${company}!`);
    } catch (error) {
      alert("Failed to update spotlight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h4>Company Spotlight</h4>
      </div>

      <div className="widget-body">
        <div className="input-group">
          <input 
            className="widget-input"
            placeholder="Company Name *" 
            value={company}
            onChange={(e) => setCompany(e.target.value)} 
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <input 
            className="widget-input"
            placeholder="Role (e.g., Software Engineer)" 
            value={role}
            onChange={(e) => setRole(e.target.value)} 
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <input 
            className="widget-input"
            placeholder="CTC (e.g., 12 LPA)" 
            value={ctc}
            onChange={(e) => setCtc(e.target.value)} 
            disabled={loading}
          />
        </div>
      </div>

      <div className="widget-footer">
        <button className="widget-btn" onClick={save} disabled={loading}>
          {loading ? "⏳ Saving..." : "💾 Save Spotlight"}
        </button>
      </div>
    </div>
  );
}

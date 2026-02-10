import React from "react";
import { useNavigate } from "react-router-dom";

function HealthAnalysis() {
  const navigate = useNavigate();

  return (
    <div className="analysis-container">
      <style>{css}</style>

      <h1>🏥 Smart Healthcare AI Monitor</h1>

      {/* ================= DIABETES ================= */}
      <div className="card danger">
        <h2>🩸 Diabetes</h2>
        <p><strong>Status:</strong> Diabetes Detected</p>
        <p><strong>Risk:</strong> 84% | <span className="high">High</span></p>

        <ul>
          <li>Consult an endocrinologist</li>
          <li>Monitor blood glucose daily</li>
          <li>Reduce sugar intake</li>
        </ul>

        <button className="download-btn">📄 Download Medical Report</button>
      </div>

      {/* ================= HEART ================= */}
      <div className="card warning">
        <h2>❤️ Heart Disease</h2>
        <p><strong>Status:</strong> Heart Disease Detected</p>
        <p><strong>Risk:</strong> 64.5% | <span className="medium">Medium</span></p>

        <ul>
          <li>Monitor heart health regularly</li>
          <li>Adopt a low-salt diet</li>
          <li>Engage in light physical activity</li>
        </ul>

        <button className="download-btn">📄 Download Medical Report</button>
      </div>

      {/* ================= LIVER ================= */}
      <div className="card danger">
        <h2>🧪 Liver Disease</h2>
        <p><strong>Status:</strong> Liver Disease Detected</p>
        <p><strong>Risk:</strong> 87% | <span className="high">High</span></p>

        <ul>
          <li>Consult a hepatologist immediately</li>
          <li>Avoid alcohol completely</li>
          <li>Schedule liver function tests</li>
        </ul>

        <button className="download-btn">📄 Download Medical Report</button>
      </div>

      {/* ================= RECOMMENDATION BUTTON ================= */}
      <div className="recommend-section">
        <button
          className="recommend-btn"
          onClick={() => navigate("/recommendations")}
        >
          📺 View Full Health Recommendations
        </button>
      </div>
    </div>
  );
}

const css = `
.analysis-container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: #f1f5f9;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.card h2 {
  margin-bottom: 10px;
}

.card ul {
  margin: 10px 0;
  padding-left: 20px;
}

.card ul li {
  margin-bottom: 6px;
}

.danger {
  border-left: 6px solid #dc2626;
}

.warning {
  border-left: 6px solid #f59e0b;
}

.high {
  color: #dc2626;
  font-weight: bold;
}

.medium {
  color: #f59e0b;
  font-weight: bold;
}

.download-btn {
  margin-top: 10px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #0f172a;
  color: white;
  cursor: pointer;
}

.recommend-section {
  text-align: center;
  margin-top: 30px;
}

.recommend-btn {
  padding: 16px 24px;
  font-size: 16px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #22c55e);
  color: white;
  cursor: pointer;
}
`;

export default HealthAnalysis;

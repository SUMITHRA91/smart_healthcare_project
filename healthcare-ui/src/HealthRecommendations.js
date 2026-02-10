import React from "react";
import { useNavigate } from "react-router-dom";

function HealthRecommendations() {
  const navigate = useNavigate();

  return (
    <div className="rec-container">
      <style>{css}</style>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back to Report
      </button>

      <h1>🩺 Personalized Health Recommendations</h1>

      {/* BP SECTION */}
      <section className="card">
        <h2>🩸 Blood Pressure Care</h2>
        <ul>
          <li>Maintain BP below 120/80 mmHg</li>
          <li>Reduce salt intake (less than 5g/day)</li>
          <li>Avoid smoking and alcohol</li>
          <li>Practice daily walking or yoga</li>
        </ul>

        <div className="video-grid">
          <iframe
            src="https://www.youtube.com/embed/xmi9qghwQEY?si=TPPEl5d6c-_FK_6O"
            title="BP control tips"
            allowFullScreen
          />
          <iframe
            src="https://www.youtube.com/embed/yaf1swrS1_c?si=2biPwDXLg2dm5lCt"
            title="Lower BP naturally"
            allowFullScreen
          />
        </div>
      </section>

      {/* DIABETES */}
      <section className="card">
        <h2>🩸 Diabetes Management</h2>
        <ul>
          <li>Monitor glucose levels daily</li>
          <li>Follow low-GI diet</li>
          <li>Exercise 30 minutes/day</li>
          <li>Take medicines as prescribed</li>
        </ul>

        <div className="video-grid">
          <iframe
            src="https://www.youtube.com/embed/fVSMzcQfeSM?si=9Qom0gTontdHDDpF"
            title="Diabetes care"
            allowFullScreen
          />
        </div>
      </section>

      {/* HEART */}
      <section className="card">
        <h2>❤️ Heart Health</h2>
        <ul>
          <li>Avoid fatty & fried food</li>
          <li>Manage cholesterol</li>
          <li>Regular ECG checkups</li>
          <li>Light cardio exercises</li>
        </ul>

        <div className="video-grid">
          <iframe
            src="https://www.youtube.com/embed/0wXWEdipBEg?si=mLo5ZANawBvCbMZR"
            title="Heart health tips"
            allowFullScreen
          />
        </div>
      </section>

      {/* LIVER */}
      <section className="card">
        <h2>🧪 Liver Care</h2>
        <ul>
          <li>Avoid alcohol completely</li>
          <li>Drink plenty of water</li>
          <li>Schedule liver function tests</li>
          <li>Eat fruits & leafy vegetables</li>
        </ul>

        <div className="video-grid">
          <iframe
            src="https://www.youtube.com/embed/dJwC5k4l8O0"
            title="Liver health"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}

const css = `
.rec-container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  background: #f8fafc;
  font-family: Arial, sans-serif;
  color: #0f172a; /* ✅ MAIN TEXT COLOR */
}

.back-btn {
  margin-bottom: 12px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #1e293b;
  color: white;
  cursor: pointer;
}

h1, h2, h3 {
  color: #020617; /* ✅ DARK HEADINGS */
}

.risk-card {
  border-left: 6px solid;
  background: #ffffff;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.card {
  background: #ffffff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.card ul {
  padding-left: 20px;
}

.card ul li {
  color: #020617;       /* ✅ BULLET TEXT */
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.6;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

iframe {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  border: none;
}
`;


export default HealthRecommendations;

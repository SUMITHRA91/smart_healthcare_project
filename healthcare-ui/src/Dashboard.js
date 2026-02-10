import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import heroImage from "./vitalAI.jpeg"; // ✅ IMAGE IMPORT

function Dashboard() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello 👋 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [stress, setStress] = useState("Normal");

  /* ================= ECG ANIMATION ================= */
  useEffect(() => {
    const canvas = document.getElementById("ecgCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let offset = 0;

    const draw = () => {
      ctx.fillStyle = "#f4f6f8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = stress === "High" ? "#ff1744" : "#26c6da";
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      for (let x = 0; x < canvas.width; x++) {
        let spike = Math.random() > 0.98 ? -35 : 0;
        let y =
          canvas.height / 2 +
          Math.sin((x + offset) * 0.05) * 18 +
          spike;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
      offset += 4;
      requestAnimationFrame(draw);
    };

    draw();
  }, [stress]);

  /* ================= RISK TREND ================= */
  useEffect(() => {
    const canvas = document.getElementById("riskChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const data = [25, 40, 55, 60, 78];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#26c6da";
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * canvas.width;
      const y = canvas.height - (v / 100) * canvas.height;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, []);

  /* ================= CHATBOT ================= */
  const reply = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes("chest")) {
      setStress("High");
      return "⚠ Chest pain detected. Emergency care recommended.";
    }
    if (m.includes("bp")) {
      setStress("Medium");
      return "Monitor BP daily and reduce salt intake.";
    }
    if (m.includes("stress")) {
      setStress("High");
      return "High stress detected. Please rest.";
    }
    return "Please describe your symptoms clearly.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { from: "user", text: input },
      { from: "bot", text: reply(input) }
    ]);
    setInput("");
  };

  return (
    <>
      {/* ===== HERO IMAGE ===== */}
      <div className="hero-section">
        <img src={heroImage} alt="VitalAI" className="hero-image" />
        <div className="hero-overlay">
          <h1>VitalAI</h1>
          <p>Your Heart & Health, Powered by AI</p>
          <button className="primary-btn">Analyze Now</button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* 🚨 EMERGENCY BANNER */}
        {stress === "High" && (
          <div className="alert-banner">
            🚨 EMERGENCY ALERT — CONSULT A DOCTOR IMMEDIATELY
          </div>
        )}

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="card">
            <h3>Daily Vitals</h3>
            <div className="vitals">
              <VitalRing label="Heart Rate" value={72} />
              <VitalRing label="Blood Pressure" value={80} />
            </div>
          </div>

          <div className="card">
            <h3>Risk Level Symptoms</h3>
            <div className="wave-placeholder"></div>
            <p>✔ Mild symptoms detected</p>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="center-panel">
          <div className="card">
            <h3>Input Your Health Data</h3>
            <div className="form-grid">
              <input placeholder="Glucose Level (mg/dL)" />
              <input placeholder="Blood Pressure (mmHg)" />
              <input placeholder="BMI" />
              <input placeholder="Age" />
              <input placeholder="Cholesterol" />
            </div>
            <button className="primary-btn">Analyze Health</button>
            <p className="confidence">AI Confidence: 92%</p>
          </div>

          <div className="card">
            <h3>ECG Analyzer</h3>
            <canvas id="ecgCanvas" width="600" height="140"></canvas>
          </div>

          <div className="card">
            <h3>🧑‍⚕️ Virtual Doctor Chatbot</h3>
            <div className="chat-box">
              {messages.map((m, i) => (
                <div key={i} className={m.from === "bot" ? "bot-msg" : "user-msg"}>
                  {m.text}
                </div>
              ))}
            </div>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button className="primary-btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="card">
            <h3>Recent Activity</h3>
            <canvas id="riskChart" width="260" height="120"></canvas>
            <p className={`stress ${stress.toLowerCase()}`}>
              Stress Level: {stress}
            </p>
          </div>

          <div className="card">
            <h3>Dietary Tips</h3>
            <ul className="tips">
              <li>🥗 Reduce salt intake</li>
              <li>🚶 Walk 30 minutes daily</li>
              <li>💧 Drink enough water</li>
              <li>😴 Sleep 7–8 hours</li>
            </ul>
          </div>

          <div className="card">
            <h3>Video Tutorials</h3>
            <div className="video-card">▶ Easy BP Control Exercises</div>
            <div className="video-card">▶ Heart Health Yoga</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== CIRCULAR PROGRESS ===== */
function VitalRing({ label, value }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="vital-ring pulse">
      <svg width="120" height="120">
        <circle cx="60" cy="60" r={radius} className="ring-bg" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="ring-progress"
          style={{ strokeDashoffset: offset }}
        />
        <text x="50%" y="50%" dy="6" textAnchor="middle" className="ring-text">
          {value}%
        </text>
      </svg>
      <p>{label}</p>
    </div>
  );
}

export default Dashboard;

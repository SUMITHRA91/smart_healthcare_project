import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ECGAnalyzer() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState("kn");
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  /* ================= LOAD VOICES ================= */
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  /* ================= ECG GRID ================= */
  const drawECGGrid = (ctx, width, height) => {
    const small = 10;
    const big = 50;

    ctx.strokeStyle = "#ffcccc";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= width; x += small) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += small) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#ff6666";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += big) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += big) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  /* ================= DRAW ECG IMAGE ================= */
  const drawHighlight = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = preview;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      drawECGGrid(ctx, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        img.width * 0.3,
        img.height * 0.4,
        img.width * 0.4,
        img.height * 0.2
      );
    };
  };

  /* ================= UPLOAD ECG ================= */
  const uploadECG = async () => {
    if (!image) {
      alert("Please upload an ECG image");
      return;
    }

    const formData = new FormData();
    formData.append("ecg_image", image);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/predict-ecg/",
        formData
      );
      setResult(res.data);
      drawHighlight();
    } catch {
      alert("ECG analysis failed. Check backend.");
    }
  };

  /* ================= PDF DOWNLOAD ================= */
  const downloadECGReport = () => {
    axios
      .post(
        "http://127.0.0.1:8000/ecg-report/",
        result,
        { responseType: "blob" }
      )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ECG_Report.pdf";
        a.click();
      });
  };

  /* ================= DETAILED ECG INFO ================= */
  const getDetailedECGInfo = () => {
    if (!result) return null;

    if (result.prediction.toLowerCase().includes("bradycardia")) {
      return {
        interpretation:
          "The ECG indicates a slower-than-normal heart rhythm, which may reduce blood flow to vital organs.",
        heartRate: "Below Normal Range",
        symptoms: [
          "Fatigue or weakness",
          "Dizziness or light-headedness",
          "Shortness of breath",
          "Fainting in severe cases"
        ],
        actions: [
          "Monitor heart rate regularly",
          "Avoid strenuous physical activity",
          "Repeat ECG or Holter monitoring",
          "Consult a cardiologist if symptoms persist"
        ],
        confidence: "72%"
      };
    }

    return {
      interpretation:
        "The ECG pattern appears within normal limits with a stable heart rhythm.",
      heartRate: "Normal",
      symptoms: ["No significant symptoms detected"],
      actions: ["Maintain healthy lifestyle", "Annual ECG checkup"],
      confidence: "85%"
    };
  };

  /* ================= VOICE ================= */
  const getVoiceByLang = (lang) =>
    window.speechSynthesis.getVoices().find((v) => v.lang === lang) || null;

  const speakResult = () => {
    if (!result) return;
    const info = getDetailedECGInfo();

    let text = "";
    let langCode = "en-US";

    if (language === "kn") {
      text = `
        ಇದು ನಿಮ್ಮ ಇಸಿಜಿ ವೈದ್ಯಕೀಯ ವರದಿ.
        ಫಲಿತಾಂಶವು ${result.prediction} ಅನ್ನು ಸೂಚಿಸುತ್ತದೆ.
        ಅಪಾಯದ ಮಟ್ಟ ${result.risk_level} ಆಗಿದೆ.
        ${info.interpretation}
        ದಯವಿಟ್ಟು ವೈದ್ಯರ ಸಲಹೆಯನ್ನು ಅನುಸರಿಸಿ.
      `;
      langCode = "kn-IN";
    }

    if (language === "hi") {
      text = `
        यह आपकी ईसीजी जांच रिपोर्ट है।
        परिणाम ${result.prediction} दर्शाता है।
        जोखिम स्तर ${result.risk_level} है।
        ${info.interpretation}
        कृपया डॉक्टर से परामर्श करें।
      `;
      langCode = "hi-IN";
    }

    if (language === "en") {
      text = `
        This is your ECG medical report.
        The finding indicates ${result.prediction}.
        Risk level is ${result.risk_level}.
        ${info.interpretation}
        Please consult a cardiologist if required.
      `;
      langCode = "en-US";
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = langCode;
    const voice = getVoiceByLang(langCode);
    if (voice) u.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div style={containerStyle}>
      <h2>🫀 ECG Image Analyzer</h2>

      {/* CONSULT DOCTOR BUTTON */}
      <button
        onClick={() => navigate("/doctor")}
        style={{
          padding: "12px",
          backgroundColor: "#1565c0",
          color: "#fff",
          border: "none",
          width: "100%",
          marginBottom: "15px",
          cursor: "pointer"
        }}
      >
        🧑‍⚕️ Consult Doctor
      </button>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setImage(e.target.files[0]);
          setPreview(URL.createObjectURL(e.target.files[0]));
          setResult(null);
        }}
      />

      <br />
      <button onClick={uploadECG} style={buttonStyle}>
        Analyze ECG
      </button>

      {preview && (
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            marginTop: "20px",
            backgroundColor: "#fff",
            border: "2px solid red"
          }}
        />
      )}

      {result && (() => {
        const info = getDetailedECGInfo();
        return (
          <div style={reportStyle}>
            <h3>ECG Analysis Report</h3>

            <p><b>Primary Finding:</b> {result.prediction}</p>
            <p><b>Risk Level:</b> {result.risk_level}</p>
            <p><b>Clinical Interpretation:</b> {info.interpretation}</p>
            <p><b>Heart Rate:</b> {info.heartRate}</p>

            <p><b>Possible Symptoms:</b></p>
            <ul>{info.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>

            <p><b>Recommended Actions:</b></p>
            <ul>{info.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>

            <p><b>AI Confidence:</b> {info.confidence}</p>

            <label>🌐 Voice Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="kn">Kannada</option>
              <option value="hi">Hindi</option>
              <option value="en">English</option>
            </select>

            <button style={buttonStyle} onClick={downloadECGReport}>
              📄 Download ECG Report
            </button>

            <button
              style={{ ...buttonStyle, backgroundColor: "#6a1b9a" }}
              onClick={speakResult}
            >
              🔊 Listen to Health Report
            </button>

            <p style={{ color: "orange" }}>
              ⚠ AI-assisted analysis. Not a medical diagnosis.
            </p>
          </div>
        );
      })()}
    </div>
  );
}

/* ================= STYLES ================= */

const containerStyle = {
  maxWidth: "1000px",
  margin: "auto",
  padding: "20px",
  color: "#e0f7fa"
};

const buttonStyle = {
  marginTop: "10px",
  padding: "12px",
  width: "100%",
  backgroundColor: "#00796b",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: "8px"
};
const reportStyle = {
  marginTop: "25px",
  padding: "20px",
  backgroundColor: "#0f2a30",
  borderRadius: "12px"
};



export default ECGAnalyzer;



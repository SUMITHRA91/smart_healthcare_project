import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

/* ================= MAIN COMPONENT ================= */
function DoctorChatbot() {
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en");

  /* ===== CHAT ===== */
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");

  /* ===== PATIENT MEMORY ===== */
  const [patient, setPatient] = useState(() => {
    const saved = localStorage.getItem("patient");
    return saved
      ? JSON.parse(saved)
      : { name: null, conditions: [], severity: "normal" };
  });

  /* ===== FOLLOW-UP ===== */
  const [followUp, setFollowUp] = useState(null);

  /* ===== WEBCAM ===== */
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [stressLevel, setStressLevel] = useState("Normal");

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  /* ================= CAMERA START (SAFE) ================= */
  const startCamera = async () => {
    if (cameraOn) return;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    setCameraOn(true);

    // Load detector once
    if (!detectorRef.current) {
      detectorRef.current =
        await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: "tfjs" }
        );
    }
  };

  /* ===== Attach stream AFTER video mounts ===== */
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  /* ================= SIMPLE STRESS DETECTION ================= */
  useEffect(() => {
    if (!cameraOn || !detectorRef.current) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const faces =
        await detectorRef.current.estimateFaces(videoRef.current);

      if (!faces || faces.length === 0) {
        setStressLevel("Unknown");
      } else {
        setStressLevel("Normal");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [cameraOn]);

  /* ================= AI LOGIC ================= */
  const detectDisease = (text) => {
    if (text.match(/(heart|pulse|bradycardia)/)) return "heart";
    if (text.match(/(diabetes|sugar|glucose)/)) return "diabetes";
    if (text.match(/(liver|hepatitis)/)) return "liver";
    return "general";
  };

  const detectIntent = (text) => {
    if (text.match(/(hi|hello|hey)/)) return "greeting";
    if (text.match(/(my name is|i am)/)) return "name";
    if (text.match(/(pain|symptom|feeling|hurt)/)) return "symptoms";
    if (text.match(/(advice|suggest|what should i do)/)) return "advice";
    if (text.match(/(risk|chance|probability)/)) return "risk";
    if (text.match(/(thank|thanks)/)) return "thanks";
    return "general";
  };

  const followUpQuestions = {
    heart: [
      "Do you experience chest pain or discomfort?",
      "Do you feel shortness of breath?",
      "Is your heart rate slow or irregular?"
    ],
    diabetes: [
      "Do you feel excessive thirst or frequent urination?",
      "Have you noticed sudden weight changes?",
      "Do you monitor your blood sugar regularly?"
    ],
    liver: [
      "Do you feel abdominal pain or swelling?",
      "Have you noticed yellowing of eyes or skin?",
      "Do you consume alcohol frequently?"
    ]
  };

  /* ================= DOCTOR BRAIN ================= */
  const doctorReply = async (q) => {
    const text = q.toLowerCase();
    const intent = detectIntent(text);
    const disease = detectDisease(text);

    if (stressLevel === "High") {
      return "I notice signs of stress. Please stay calm and consider medical consultation.";
    }

    if (followUp) {
      const { disease, index } = followUp;
      const next = index + 1;

      if (next < followUpQuestions[disease].length) {
        setFollowUp({ disease, index: next });
        return followUpQuestions[disease][next];
      } else {
        setFollowUp(null);
        return "Thank you. Based on your responses, consulting a specialist is recommended.";
      }
    }

    if (intent === "greeting") {
      return patient.name
        ? `Hello ${patient.name}. How are you feeling today?`
        : "Hello. I am your virtual doctor. How can I help you?";
    }

    if (intent === "name") {
      const name = text.replace(/(my name is|i am)/, "").trim();
      setPatient({ ...patient, name });
      return `Nice to meet you, ${name}. I will remember you.`;
    }

    if (intent === "symptoms" && disease !== "general") {
      setFollowUp({ disease, index: 0 });
      return followUpQuestions[disease][0];
    }

    if (intent === "advice") {
      return "Maintain a balanced diet, exercise regularly, sleep well, and manage stress.";
    }

    if (intent === "risk") {
      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/heart/",
          { age: 50, cp: 1, chol: 220, thalach: 140, oldpeak: 2 }
        );
        return `Your AI risk level is ${res.data.risk_level} (${res.data.risk_percentage}%).`;
      } catch {
        return "Unable to fetch risk data at the moment.";
      }
    }

    if (intent === "thanks") {
      return "You're welcome. I'm always here to support your health.";
    }

    return "Please describe your symptoms or ask about heart, diabetes, or liver health.";
  };

  /* ================= VOICE ================= */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech not supported");

    const rec = new SR();
    rec.lang =
      language === "hi" ? "hi-IN" :
      language === "kn" ? "kn-IN" : "en-US";

    setListening(true);
    rec.start();

    rec.onresult = async (e) => {
      handleUserMessage(e.results[0][0].transcript);
    };

    rec.onend = () => setListening(false);
  };

  const speakDoctor = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang =
      language === "hi" ? "hi-IN" :
      language === "kn" ? "kn-IN" : "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  /* ================= MESSAGE FLOW ================= */
  const handleUserMessage = async (msg) => {
    setMessages(prev => [...prev, { from: "user", text: msg }]);
    const reply = await doctorReply(msg);
    setMessages(prev => [...prev, { from: "doctor", text: reply }]);
    speakDoctor(reply);
  };

  const sendTextMessage = () => {
    if (!textInput.trim()) return;
    handleUserMessage(textInput);
    setTextInput("");
  };

  return (
    <div className="container">
      <style>{css}</style>

      <h2 className="title">🧑‍⚕️ Virtual Doctor Chatbot</h2>

      <button className="cam-btn" onClick={startCamera}>
        📷 Start Webcam
      </button>

      {cameraOn && <video ref={videoRef} autoPlay muted className="video" />}

      <p className="stress">🧠 Stress Level: {stressLevel}</p>

      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>{m.text}</div>
        ))}
      </div>

      <div className="input-row">
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendTextMessage}>Send</button>
      </div>

      <button className="voice-btn" onClick={startListening}>
        {listening ? "🎙 Listening..." : "🎤 Speak"}
      </button>

      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="kn">Kannada</option>
      </select>
    </div>
  );
}

/* ================= CSS ================= */
const css = `
.container {
  max-width: 420px;
  margin: auto;
  padding: 20px;
  background: #020617;
  color: white;
  border-radius: 16px;
  font-family: Arial;
}
.title { text-align: center; }
.chat-box {
  height: 220px;
  overflow-y: auto;
  background: #0f172a;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}
.msg {
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 14px;
  max-width: 80%;
}
.msg.user { background: #2563eb; margin-left: auto; }
.msg.doctor { background: #334155; }
.input-row { display: flex; gap: 6px; }
input { flex: 1; padding: 10px; border-radius: 8px; }
.voice-btn, .cam-btn {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
}
.video {
  width: 100%;
  border-radius: 10px;
  margin: 8px 0;
}
.stress { text-align: center; font-size: 14px; }
select {
  width: 100%;
  margin-top: 6px;
  padding: 8px;
}
`;

export default DoctorChatbot;

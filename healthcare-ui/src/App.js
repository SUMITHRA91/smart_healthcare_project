import { useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate
} from "react-router-dom";
import axios from "axios";
import "./App.css";

import ECGAnalyzer from "./ECGAnalyzer";
import DoctorChatbot from "./DoctorChatbot";
import RealSensorModule from "./RealSensorModule";
import HealthAnalysis from "./HealthAnalysis";
import HealthRecommendations from "./HealthRecommendations";
import HealthPlan from "./HealthPlan";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

/* ======================= PROTECTED ROUTE ======================= */

function ProtectedRoute({ loggedIn, children }) {
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* ======================= MAIN APP ======================= */

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("user_id")
  );

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user_id");
    setLoggedIn(false);
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1>VitalAI: Empowering your Health Journey</h1>

      {/* NAVIGATION */}
      {loggedIn && (
        <div style={styles.nav}>
          <Link to="/dash" style={styles.navLink}>📊 Dashboard</Link>
          <Link to="/" style={styles.navLink}>🏠 Health Analysis</Link>
          <Link to="/ecg" style={styles.navLink}>🫀 ECG Analyzer</Link>
          <Link to="/doctor" style={styles.navLink}>🧑‍⚕️ Doctor</Link>
          <Link to="/sensors" style={styles.navLink}>🧠 Sensors</Link>
          

          <button
            onClick={logout}
            style={{
              marginLeft: "15px",
              background: "transparent",
              color: "#ff5252",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}

      <Routes>
        {/* AUTH */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                setLoggedIn(true);
                navigate("/dash");
              }}
            />
          }
        />
        <Route path="/register" element={<Register />} />

        {/* MAIN */}
        <Route
          path="/"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <HealthDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dash"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ecg"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <ECGAnalyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <DoctorChatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sensors"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <RealSensorModule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <HealthAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommendations"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <HealthRecommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health-plan"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <HealthPlan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

/* ======================= HEALTH DASHBOARD ======================= */

function HealthDashboard() {
  const [formData, setFormData] = useState({
    pregnancies: "",
    glucose: "",
    bp: "",
    skin: "",
    insulin: "",
    bmi: "",
    dpf: "",
    age: "",
    cp: "",
    chol: "",
    thalach: "",
    oldpeak: "",
    bilirubin: "",
    albumin: "",
    alkphos: ""
  });

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const predictAll = async () => {
    setLoading(true);
    try {
      const [diabetes, heart, liver] = await Promise.all([
        axios.post("http://127.0.0.1:8000/api/diabetes/", formData),
        axios.post("http://127.0.0.1:8000/api/heart/", formData),
        axios.post("http://127.0.0.1:8000/api/liver/", formData)
      ]);

      setResults({
        diabetes: diabetes.data,
        heart: heart.data,
        liver: liver.data
      });
    } catch {
      alert("Backend not running or API error");
    }
    setLoading(false);
  };

  return (
    <>
      <div style={styles.card}>
        {Object.keys(formData).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.toUpperCase()}
            value={formData[key]}
            onChange={handleChange}
            style={styles.input}
          />
        ))}

        <button onClick={predictAll} style={styles.button}>
          {loading ? "Analyzing..." : "Run Full Health Analysis"}
        </button>
      </div>

      <div style={styles.resultsGrid}>
        {results.diabetes && (
          <RiskCard title="🩸 Diabetes" data={results.diabetes} />
        )}
        {results.heart && (
          <RiskCard title="❤️ Heart Disease" data={results.heart} />
        )}
        {results.liver && (
          <RiskCard title="🧪 Liver Disease" data={results.liver} />
        )}
      </div>

      {/* 📄 DOWNLOAD MEDICAL REPORT */}
      {Object.keys(results).length > 0 && (
        <button
          style={styles.downloadBtn}
          onClick={() =>
            axios
              .post(
                "http://127.0.0.1:8000/api/report/",
                results,
                { responseType: "blob" }
              )
              .then((res) => {
                const file = new Blob([res.data], {
                  type: "application/pdf"
                });
                const url = window.URL.createObjectURL(file);
                const a = document.createElement("a");
                a.href = url;
                a.download = "Smart_Healthcare_Report.pdf";
                a.click();
              })
          }
        >
          📄 Download Medical Report
        </button>
      )}
    </>
  );
}

/* ======================= RESULT CARD ======================= */

function RiskCard({ title, data }) {
  const navigate = useNavigate();

  return (
    <div style={styles.resultCard}>
      <h3>{title}</h3>
      <p>{data.prediction}</p>

      <div style={styles.meter}>
        <div
          style={{
            ...styles.meterFill,
            width: `${data.risk_percentage}%`,
            background:
              data.risk_level === "High"
                ? "#f44336"
                : data.risk_level === "Medium"
                ? "#ffc107"
                : "#4caf50"
          }}
        />
      </div>

      <p>
        Risk: <b>{data.risk_percentage}%</b> | Level:{" "}
        <b>{data.risk_level}</b>
      </p>

      <button
        style={styles.button}
        onClick={() => navigate("/recommendations")}
      >
        📺 View Full Recommendations
      </button>

      <button
        style={styles.button}
        onClick={() =>
          navigate("/health-plan", {
            state: { title, data }
          })
        }
      >
        🩺 View Health Plan
      </button>
    </div>
  );
}

/* ======================= STYLES ======================= */

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0b1c1f",
    color: "#e0f7fa",
    fontFamily: "Segoe UI, Arial",
    padding: "30px",
    textAlign: "center"
  },
  nav: { marginBottom: "20px" },
  navLink: {
    margin: "0 15px",
    color: "#26c6da",
    textDecoration: "none",
    fontWeight: "bold"
  },
  card: {
    backgroundColor: "#102a2e",
    maxWidth: "700px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "12px"
  },
  input: {
    width: "48%",
    padding: "10px",
    margin: "6px 1%",
    borderRadius: "6px"
  },
  button: {
    width: "100%",
    padding: "14px",
    marginTop: "10px"
  },
  downloadBtn: {
    marginTop: "25px",
    width: "100%",
    padding: "14px",
    background: "#6a1b9a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "30px"
  },
  resultCard: {
    backgroundColor: "#08181b",
    padding: "20px",
    borderRadius: "12px"
  },
  meter: {
    width: "100%",
    height: "16px",
    backgroundColor: "#1c313a",
    borderRadius: "10px",
    overflow: "hidden"
  },
  meterFill: { height: "100%" }
};

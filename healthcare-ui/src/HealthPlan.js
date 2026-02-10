import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function HealthPlan() {
  const location = useLocation();
  const navigate = useNavigate();

  const title = location.state?.title;
  const data = location.state?.data;

  const storageKey = `healthTasks-${title}`;

  const [completedTasks, setCompletedTasks] = useState({});

  /* ================= SAFETY CHECK ================= */
  useEffect(() => {
    if (!data) navigate(-1);
  }, [data, navigate]);

  /* ================= LOAD SAVED TASKS ================= */
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, [storageKey]);

  /* ================= SAVE TASKS ================= */
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completedTasks));
  }, [completedTasks, storageKey]);

  /* ================= PLAN LOGIC ================= */
  const getPlan = () => {
    if (!data) return null;

    if (title.includes("Diabetes")) {
      return {
        color: "#f44336",
        tasks: [
          "Check fasting blood sugar",
          "Take insulin / oral medicine",
          "Avoid sugar & refined flour",
          "Walk for 45 minutes",
          "Drink 3 liters of water",
          "Record glucose readings"
        ],
        diet: {
          Breakfast: "Oats / Ragi dosa / Boiled eggs",
          Lunch: "Brown rice + dal + vegetables",
          Snack: "Green tea + nuts",
          Dinner: "Vegetable soup + salad"
        }
      };
    }

    if (title.includes("Heart")) {
      return {
        color: "#ffc107",
        tasks: [
          "Monitor blood pressure",
          "Reduce salt intake",
          "30 minutes walking",
          "Stress management",
          "Avoid smoking & alcohol"
        ],
        diet: {
          Breakfast: "Oats + fruits",
          Lunch: "Chapati + vegetables",
          Dinner: "Steamed food + curd"
        }
      };
    }

    if (title.includes("Liver")) {
      return {
        color: "#f44336",
        tasks: [
          "Avoid alcohol completely",
          "Eat low-fat meals",
          "Stay hydrated",
          "Follow medication schedule",
          "Liver function monitoring"
        ],
        diet: {
          Breakfast: "Boiled vegetables",
          Lunch: "Steamed rice + dal",
          Dinner: "Clear vegetable soup"
        }
      };
    }

    return null;
  };

  const plan = getPlan();
  if (!plan) return null;

  /* ================= TASK HANDLER ================= */
  const toggleTask = (task) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [task]: !prev[task]
    }));
  };

  /* ================= PROGRESS ================= */
  const totalTasks = plan.tasks.length;
  const completedCount = plan.tasks.filter(
    (t) => completedTasks[t]
  ).length;
  const progress = Math.round((completedCount / totalTasks) * 100);

  return (
    <div style={{ padding: "30px", color: "#e0f7fa" }}>
      <h2>{title} – Personalized Health Plan</h2>
      <p>
        Risk: <b>{data.risk_percentage}%</b> | Level:{" "}
        <b style={{ color: plan.color }}>{data.risk_level}</b>
      </p>

      {/* PROGRESS BAR */}
      <div style={{ marginTop: "15px" }}>
        <p>📊 Task Completion: <b>{progress}%</b></p>
        <div
          style={{
            width: "100%",
            height: "14px",
            background: "#1c313a",
            borderRadius: "10px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: plan.color,
              transition: "width 0.5s"
            }}
          />
        </div>
      </div>

      {/* TASKS */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          background: "#08181b",
          borderRadius: "12px",
          borderLeft: `6px solid ${plan.color}`
        }}
      >
        <h3>✅ Daily Health Tasks</h3>
        {plan.tasks.map((task, i) => (
          <label
            key={i}
            style={{
              display: "block",
              marginBottom: "8px",
              cursor: "pointer",
              opacity: completedTasks[task] ? 0.6 : 1
            }}
          >
            <input
              type="checkbox"
              checked={!!completedTasks[task]}
              onChange={() => toggleTask(task)}
              style={{ marginRight: "10px" }}
            />
            {task}
          </label>
        ))}
      </div>

      {/* DIET */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          background: "#102a2e",
          borderRadius: "12px"
        }}
      >
        <h3>🥗 AI-Generated Diet Plan</h3>
        {Object.entries(plan.diet).map(([time, food]) => (
          <p key={time}>
            <b>{time}:</b> {food}
          </p>
        ))}
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px"
        }}
      >
        🔙 Go Back
      </button>
    </div>
  );
}

export default HealthPlan;

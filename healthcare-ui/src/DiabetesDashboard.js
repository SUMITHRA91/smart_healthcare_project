import { useState } from "react";
import axios from "axios";

function DiabetesDashboard() {
  const [result, setResult] = useState(null);

  const submitData = async () => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/diabetes/",
      {
        pregnancies: 2,
        glucose: 138,
        bp: 80,
        skin: 35,
        insulin: 120,
        bmi: 28.4,
        dpf: 0.52,
        age: 45
      }
    );
    setResult(response.data);
  };

  return (
    <div>
      <h2>AI Diabetes Prediction</h2>
      <button onClick={submitData}>Predict</button>

      {result && (
        <>
          <h3>{result.prediction}</h3>
          <p>Risk: {result.risk_percentage}%</p>
          <p>Level: {result.risk_level}</p>
        </>
      )}
    </div>
  );
}

export default DiabetesDashboard;

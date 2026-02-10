import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

function Register({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    if (!username || !password) {
      setError("All fields required");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username,
        password
      });
      setMessage("Registration successful. Please login.");
      setError("");
    } catch {
      setError("User already exists");
    }
  };

  return (
    <div style={styles.card}>
      <h3>📝 Sign Up</h3>

      <input
        style={styles.input}
        placeholder="Username"
        onChange={e => setUsername(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <button style={styles.button} onClick={register}>
        Register
      </button>
      
      <p style={{ marginTop: "10px" }}>
        Already have an account? <Link to="/login">Login</Link></p>

    </div>
  );
}

const styles = {
  card: {
    maxWidth: 360,
    margin: "40px auto",
    padding: 20,
    borderRadius: 16,
    background: "#ffffff",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 8
  },
  error: { color: "red" },
  success: { color: "green" },
  link: {
    marginTop: 10,
    cursor: "pointer",
    color: "#2563eb"
  }
};

export default Register;

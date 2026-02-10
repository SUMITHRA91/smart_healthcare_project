import React, { useRef, useState, useEffect } from "react";
import "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

function RealSensorModule({ onUpdate = () => {} }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);

  const faceIntervalRef = useRef(null);
  const alarmRef = useRef(null);
  const lastMotionTimeRef = useRef(Date.now());
  const greenSignalRef = useRef([]);

  const [status, setStatus] = useState({
    faceDetected: false,
    movement: "Inactive",
    stress: "Normal",
    fall: false,
    emergency: false,
    heartRate: "--"
  });

  /* ================= ALARM ================= */
  const startAlarm = () => {
    if (alarmRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();

    alarmRef.current = { audioCtx, oscillator };
  };

  const stopAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.oscillator.stop();
      alarmRef.current.audioCtx.close();
      alarmRef.current = null;
    }

    setStatus(prev => ({
      ...prev,
      emergency: false,
      fall: false,
      stress: "Normal"
    }));
  };

  /* ================= CAMERA ================= */
  const startCamera = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.onloadedmetadata = async () => {
        await videoRef.current.play();

        detectorRef.current =
          await faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            { runtime: "tfjs" }
          );

        if (!faceIntervalRef.current) {
          faceIntervalRef.current = setInterval(detectFaceAndHeart, 300);
        }
      };
    } catch (err) {
      alert("Camera access denied");
      console.error(err);
    }
  };

  /* ================= FACE + HEART ================= */
  const detectFaceAndHeart = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !video ||
      !canvas ||
      !detectorRef.current ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) return;

    const faces = await detectorRef.current.estimateFaces(video);

    if (!faces.length) {
      setStatus(prev => ({ ...prev, faceDetected: false, heartRate: "--" }));
      return;
    }

    setStatus(prev => ({ ...prev, faceDetected: true }));

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const box = faces[0].box;
    if (!box || box.width <= 0 || box.height <= 0) return;

    const fx = Math.max(0, box.xMin + box.width * 0.3);
    const fy = Math.max(0, box.yMin + box.height * 0.1);
    const fw = Math.min(box.width * 0.4, canvas.width - fx);
    const fh = Math.min(box.height * 0.15, canvas.height - fy);

    if (fw <= 0 || fh <= 0) return;

    const pixels = ctx.getImageData(fx, fy, fw, fh).data;

    let green = 0;
    for (let i = 1; i < pixels.length; i += 4) {
      green += pixels[i];
    }
    green /= pixels.length / 4;

    greenSignalRef.current.push(green);
    if (greenSignalRef.current.length > 150) {
      greenSignalRef.current.shift();
    }

    estimateHeartRate();
  };

  /* ================= HEART RATE ================= */
  const estimateHeartRate = () => {
    const signal = greenSignalRef.current;
    if (!signal || signal.length < 60) return;

    let peaks = 0;
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
        peaks++;
      }
    }

    const bpm = Math.round((peaks / (signal.length / 30)) * 60);

    if (bpm > 40 && bpm < 180 && !isNaN(bpm)) {
      setStatus(prev => {
        const updated = {
          ...prev,
          heartRate: bpm,
          stress: bpm > 110 ? "High" : "Normal"
        };
        onUpdate(updated);
        return updated;
      });
    }
  };

  /* ================= MOTION + FALL ================= */
  const startMotionDetection = () => {
    if (!window.DeviceMotionEvent) {
      alert("Motion sensor not supported on this device");
      return;
    }

    window.addEventListener("devicemotion", event => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const magnitude =
        Math.abs(acc.x || 0) +
        Math.abs(acc.y || 0) +
        Math.abs(acc.z || 0);

      lastMotionTimeRef.current = Date.now();

      if (magnitude > 45) {
        setStatus(prev => ({
          ...prev,
          fall: true,
          movement: "Fallen",
          stress: "High"
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          movement: "Active"
        }));
      }
    });
  };

  /* ================= UNRESPONSIVE CHECK ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        Date.now() - lastMotionTimeRef.current > 60000 &&
        !status.faceDetected
      ) {
        startAlarm();
        setStatus(prev => ({
          ...prev,
          emergency: true,
          stress: "CRITICAL"
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status.faceDetected]);

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "#08181b",
        color: "#e0f7fa"
      }}
    >
      <h3>❤️ Heart Rate from Face & Fall Detection</h3>

      <button
        onClick={startCamera}
        style={btnStyle}
      >
        📷 Start Camera
      </button>

      <button
        onClick={startMotionDetection}
        style={btnStyle}
      >
        🏃 Start Motion
      </button>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          marginTop: "10px",
          borderRadius: "10px",
          background: "#000"
        }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <p>👤 Face: {status.faceDetected ? "Detected" : "Not Detected"}</p>
      <p>❤️ Heart Rate: <b>{status.heartRate} BPM</b></p>
      <p>🏃 Movement: {status.movement}</p>
      <p>⚠️ Stress: {status.stress}</p>

      {status.emergency && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            background: "#b71c1c",
            color: "#fff",
            borderRadius: "10px",
            fontWeight: "bold"
          }}
        >
          🚨 EMERGENCY ALERT  
          <br />
          Person may be unresponsive!

          <button
            onClick={stopAlarm}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px",
              background: "#1b5e20",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            ✅ I am Safe – Stop Alarm
          </button>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  background: "#26c6da",
  color: "#00363a",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer"
};

export default RealSensorModule;

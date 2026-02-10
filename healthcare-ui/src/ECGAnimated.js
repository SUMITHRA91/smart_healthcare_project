import { useEffect, useRef } from "react";

function ECGAnimated() {
  const canvasRef = useRef(null);
  let x = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 150;

    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;

    const draw = () => {
      ctx.fillStyle = "#0b1c1f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      for (let i = 0; i < canvas.width; i++) {
        const y =
          canvas.height / 2 +
          Math.sin((i + x) * 0.05) * 20 +
          (Math.random() > 0.98 ? -40 : 0);

        ctx.lineTo(i, y);
      }

      ctx.stroke();
      x += 4;
      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return (
    <div className="card">
      <h3>🫀 Live ECG Monitor</h3>
      <canvas ref={canvasRef} style={{ width: "100%" }} />
    </div>
  );
}

export default ECGAnimated;

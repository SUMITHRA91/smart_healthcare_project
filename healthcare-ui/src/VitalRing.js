function VitalRing({ value, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#e0e0e0"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray="314"
          strokeDashoffset={314 - (314 * value) / 100}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#263238"
          fontSize="18"
          fontWeight="bold"
        >
          {value}%
        </text>
      </svg>
      <p>{label}</p>
    </div>
  );
}

export default VitalRing;

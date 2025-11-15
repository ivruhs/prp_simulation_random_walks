import React from "react";

function ControlBar({
  isRunning,
  onStartPause,
  onReset,
  onChangeSpeed,
  simulationSpeed,
  startNode,
  nodeOptions = [],
  onChangeStartNode,
}) {
  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0 }}>Simulation Controls</h3>
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <button
          onClick={onStartPause}
          style={{
            padding: "10px 22px",
            fontSize: "15px",
            background: isRunning
              ? "linear-gradient(135deg,#f43f5e,#fb7185)"
              : "linear-gradient(135deg,#10b981,#34d399)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={onReset}
          style={{
            padding: "10px 22px",
            fontSize: "15px",
            background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Reset
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ minWidth: 90, fontSize: 13, opacity: 0.8 }}>
            Start Node
          </label>
          <select
            value={startNode}
            onChange={(e) => onChangeStartNode?.(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              color: "#f8fafc",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {nodeOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{ color: "#0f172a" }}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
          Simulation Speed: <strong>{simulationSpeed}ms</strong>
        </label>
        <input
          type="range"
          min="10"
          max="1000"
          value={simulationSpeed}
          onChange={(e) => onChangeSpeed(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export default ControlBar;

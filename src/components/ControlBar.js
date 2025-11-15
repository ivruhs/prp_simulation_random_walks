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
    <div
      style={{
        padding: "20px",
        background: "linear-gradient(180deg,#f8f9fa, #ffffff)",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <h3>Simulation Controls</h3>
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <button
          onClick={onStartPause}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: isRunning ? "#ff6b6b" : "#51cf66",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={onReset}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#339af0",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <label style={{ minWidth: 100 }}>Start Node:</label>
        <select
          value={startNode}
          onChange={(e) => onChangeStartNode?.(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ced4da" }}
        >
          {nodeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Simulation Speed: {simulationSpeed}ms
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

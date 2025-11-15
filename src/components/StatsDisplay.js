import React from "react";

function StatsDisplay({ totalSteps, visitCounts, currentNode }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#f5f5f5",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <h2>Total Steps: {totalSteps}</h2>
      <div style={{ marginBottom: 10 }}>
        Current Node: <strong>{currentNode}</strong>
      </div>
      <h3>Visit Counts:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {Object.entries(visitCounts).map(([nodeId, count]) => (
          <li key={nodeId} style={{ padding: "5px 0", fontSize: "16px" }}>
            <strong>{nodeId}:</strong> {count}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StatsDisplay;

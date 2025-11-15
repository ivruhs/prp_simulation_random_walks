import React, { useMemo } from "react";

function StatsDisplay({ totalSteps, visitCounts, currentNode, nodeLabels }) {
  const ordered = useMemo(() => {
    return Object.keys(visitCounts).map((id) => ({
      id,
      name: nodeLabels?.[id] || id,
      count: visitCounts[id],
    }));
  }, [visitCounts, nodeLabels]);

  return (
    <div className="panel stats-panel">
      <div className="panel-header">
        <h2 style={{ margin: 0 }}>Simulation Stats</h2>
        <small style={{ opacity: 0.7 }}>Live random walk metrics</small>
      </div>
      <div
        style={{ marginTop: 14, display: "flex", gap: 20, flexWrap: "wrap" }}
      >
        <div className="metric-box">
          <span className="metric-label">Total Steps</span>
          <span className="metric-value">{totalSteps}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Current Node</span>
          <span className="metric-value">
            {currentNode} · {nodeLabels?.[currentNode]}
          </span>
        </div>
      </div>
      <h3 style={{ marginTop: 24 }}>Visit Counts</h3>
      <div style={{ maxHeight: 260, overflowY: "auto", marginTop: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <th style={{ padding: "6px 4px", fontWeight: 500 }}>ID</th>
              <th style={{ padding: "6px 4px", fontWeight: 500 }}>Name</th>
              <th style={{ padding: "6px 4px", fontWeight: 500 }}>Visits</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background:
                    row.id === currentNode
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                }}
              >
                <td style={{ padding: "4px 4px", fontWeight: 600 }}>
                  {row.id}
                </td>
                <td style={{ padding: "4px 4px" }}>{row.name}</td>
                <td style={{ padding: "4px 4px" }}>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatsDisplay;

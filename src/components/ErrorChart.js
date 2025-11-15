import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ErrorChart({ errorHistory }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Convergence Error (Total Variation Distance)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={errorHistory}>
          <XAxis dataKey="step" type="number" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="error" stroke="#ff0000" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ErrorChart;

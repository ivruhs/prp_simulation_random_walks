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
    <div className="panel" style={{ marginTop: "20px" }}>
      <h3 style={{ marginTop: 0 }}>
        Convergence Error (Total Variation Distance)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={errorHistory}>
          <XAxis dataKey="step" type="number" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="error"
            stroke="#f43f5e"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ErrorChart;

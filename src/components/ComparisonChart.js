import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ComparisonChart({ analyticalPi, empiricalPi }) {
  const chartData = useMemo(() => {
    if (!analyticalPi || Object.keys(analyticalPi).length === 0) return [];

    return Object.keys(analyticalPi).map((nodeId) => {
      const analyticalVal = analyticalPi?.[nodeId];
      const empiricalVal = empiricalPi?.[nodeId];
      return {
        name: nodeId,
        Analytical: Number.isFinite(analyticalVal) ? analyticalVal : 0,
        Simulation: Number.isFinite(empiricalVal) ? empiricalVal : 0,
      };
    });
  }, [analyticalPi, empiricalPi]);

  return (
    <div className="panel" style={{ marginTop: "20px" }}>
      <h3 style={{ marginTop: 0 }}>Distribution Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Analytical" fill="#6366f1" />
          <Bar dataKey="Simulation" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ComparisonChart;

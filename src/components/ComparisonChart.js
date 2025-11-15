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
    <div style={{ marginTop: "20px" }}>
      <h3>Distribution Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Analytical" fill="#8884d8" />
          <Bar dataKey="Simulation" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ComparisonChart;

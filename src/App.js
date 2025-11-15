import React, { useState, useEffect, useMemo } from "react";
import NetworkGraph from "./components/NetworkGraph";
import ComparisonChart from "./components/ComparisonChart";
import ErrorChart from "./components/ErrorChart";
import ControlBar from "./components/ControlBar";
import StatsDisplay from "./components/StatsDisplay";
import { useRandomWalkLoop } from "./hooks/useRandomWalkLoop";
import { calculateAnalyticalPi } from "./utils/analyticalMath";
import "./components/App.css";

// DA-IICT Campus Graph (Nodes from legend A..T)
const NODE_LABELS = {
  A: "Admin",
  B: "Faculty-4",
  C: "Faculty-3",
  D: "Faculty-2",
  E: "Faculty-1",
  F: "Library",
  G: "CEP",
  H: "Lab",
  I: "Lecture Theatre-1",
  J: "Lecture Theatre-2",
  K: "Lecture Theatre-3",
  L: "Boys Hostel",
  M: "Canteen",
  N: "Food Court",
  O: "SAC-1",
  P: "SAC-2",
  Q: "Girls Hostel",
  R: "Bungalows",
};

// Approximate positions laid out to resemble the map
// Base positions with good separation (scaled at runtime for spacing)
const BASE_POS = {
  L: { x: 100, y: 180 },
  H: { x: 280, y: 180 },
  I: { x: 220, y: 360 },
  J: { x: 160, y: 460 },
  K: { x: 110, y: 540 },
  G: { x: 500, y: 160 },
  A: { x: 600, y: 220 },
  B: { x: 660, y: 270 },
  C: { x: 630, y: 340 },
  D: { x: 570, y: 390 },
  E: { x: 500, y: 390 },
  F: { x: 450, y: 460 },
  M: { x: 700, y: 140 },
  N: { x: 740, y: 180 },
  O: { x: 820, y: 230 },
  P: { x: 900, y: 320 },
  Q: { x: 860, y: 480 },
  R: { x: 830, y: 560 },
};

const SCALE = 1.35;
const OFFSET = { x: 0, y: 0 };

const INITIAL_NODES = Object.keys(BASE_POS).map((id) => ({
  id,
  position: {
    x: BASE_POS[id].x * SCALE + OFFSET.x,
    y: BASE_POS[id].y * SCALE + OFFSET.y,
  },
  data: { label: NODE_LABELS[id] },
}));

// Adjacency list inferred from map paths (approximate)
const GRAPH_ADJACENCY = {
  // Left and academic block area (removed S & T)
  L: ["K", "H"],
  H: ["L", "I", "G"],
  I: ["H", "J", "F"],
  J: ["I", "K", "F"],
  K: ["J", "L", "F"],

  // Central ring and connections
  G: ["A", "B", "C", "H", "M", "D"],
  A: ["G", "B", "E"],
  B: ["A", "C", "G"],
  C: ["B", "D", "G"],
  D: ["C", "E", "F", "G"],
  E: ["A", "D", "F"],
  F: ["E", "D", "I", "J", "K"],

  // Right cluster
  M: ["N", "G", "O"],
  N: ["M", "O"],
  O: ["N", "P", "M"],
  P: ["O", "Q"],
  Q: ["P", "R"],
  R: ["Q"],
};

const NODE_IDS = Object.keys(NODE_LABELS);

function buildEdgesFromAdj(adj) {
  const set = new Set();
  const edges = [];
  Object.entries(adj).forEach(([u, nbrs]) => {
    nbrs.forEach((v) => {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!set.has(key)) {
        set.add(key);
        edges.push({ id: key, source: u, target: v, type: "smoothstep" });
      }
    });
  });
  return edges;
}

const INITIAL_EDGES = buildEdgesFromAdj(GRAPH_ADJACENCY);

function App() {
  // State management
  const [isRunning, setIsRunning] = useState(false);
  const [currentNode, setCurrentNode] = useState("A");
  const [totalSteps, setTotalSteps] = useState(1);
  const [simulationSpeed, setSimulationSpeed] = useState(100);
  const [analyticalPi, setAnalyticalPi] = useState(null);
  const [errorHistory, setErrorHistory] = useState([]);

  // Initialize visit counts with all nodes set to 0
  const [visitCounts, setVisitCounts] = useState(() => {
    const initialCounts = {};
    NODE_IDS.forEach((id) => {
      initialCounts[id] = 0;
    });
    initialCounts["A"] = 1; // Starting position
    return initialCounts;
  });

  // Calculate analytical pi on initial load
  useEffect(() => {
    const pi = calculateAnalyticalPi(GRAPH_ADJACENCY, NODE_IDS);
    setAnalyticalPi(pi);
  }, []);

  // Derive empirical pi efficiently using useMemo
  const empiricalPi = useMemo(() => {
    const empPi = {};
    NODE_IDS.forEach((id) => {
      empPi[id] = visitCounts[id] / totalSteps;
    });
    return empPi;
  }, [visitCounts, totalSteps]);

  // Use the random walk hook
  useRandomWalkLoop({
    isRunning,
    simulationSpeed,
    currentNode,
    adjList: GRAPH_ADJACENCY,
    setCurrentNode,
    setVisitCounts,
    setTotalSteps,
    setErrorHistory,
    analyticalPi: analyticalPi || {},
    totalSteps,
    empiricalPi,
  });

  // Handler functions
  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentNode("A");
    setTotalSteps(1);
    const resetCounts = {};
    NODE_IDS.forEach((id) => {
      resetCounts[id] = 0;
    });
    resetCounts["A"] = 1;
    setVisitCounts(resetCounts);
    setErrorHistory([]);
  };

  const handleChangeStartNode = (startId) => {
    setIsRunning(false);
    setCurrentNode(startId);
    setTotalSteps(1);
    const counts = {};
    NODE_IDS.forEach((id) => (counts[id] = 0));
    counts[startId] = 1;
    setVisitCounts(counts);
    setErrorHistory([]);
  };

  const handleChangeSpeed = (newSpeed) => {
    setSimulationSpeed(Number(newSpeed));
  };

  return (
    <div className="app-container">
      <header>
        <h1>🎲 Random Walk on DA-IICT Campus Network</h1>
        <p style={{ marginTop: 8, opacity: 0.8 }}>
          Analytical vs Simulation — stationary distribution convergence
        </p>
      </header>
      <div className="main-content">
        <div className="left-column">
          <ControlBar
            isRunning={isRunning}
            onStartPause={handleStartPause}
            onReset={handleReset}
            onChangeSpeed={handleChangeSpeed}
            simulationSpeed={simulationSpeed}
            startNode={currentNode}
            nodeOptions={INITIAL_NODES.map((n) => ({
              value: n.id,
              label: `${n.id} — ${n.data.label}`,
            }))}
            onChangeStartNode={handleChangeStartNode}
          />
          <NetworkGraph
            nodes={INITIAL_NODES}
            edges={INITIAL_EDGES}
            currentNode={currentNode}
          />
        </div>
        <div className="right-column">
          <StatsDisplay
            totalSteps={totalSteps}
            visitCounts={visitCounts}
            currentNode={currentNode}
            nodeLabels={NODE_LABELS}
          />
          <ComparisonChart
            analyticalPi={analyticalPi}
            empiricalPi={empiricalPi}
          />
          <ErrorChart errorHistory={errorHistory} />
        </div>
      </div>
    </div>
  );
}

export default App;

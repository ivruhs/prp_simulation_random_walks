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
  S: "STP & RO Plant",
  T: "DG/Sub Station",
};

// Approximate positions laid out to resemble the map
const INITIAL_NODES = [
  { id: "S", position: { x: 60, y: 60 }, data: { label: NODE_LABELS.S } },
  { id: "L", position: { x: 130, y: 260 }, data: { label: NODE_LABELS.L } },
  { id: "H", position: { x: 300, y: 260 }, data: { label: NODE_LABELS.H } },
  { id: "I", position: { x: 240, y: 420 }, data: { label: NODE_LABELS.I } },
  { id: "J", position: { x: 180, y: 500 }, data: { label: NODE_LABELS.J } },
  { id: "K", position: { x: 120, y: 560 }, data: { label: NODE_LABELS.K } },
  { id: "T", position: { x: 160, y: 620 }, data: { label: NODE_LABELS.T } },

  { id: "G", position: { x: 520, y: 220 }, data: { label: NODE_LABELS.G } },
  { id: "A", position: { x: 620, y: 260 }, data: { label: NODE_LABELS.A } },
  { id: "B", position: { x: 680, y: 310 }, data: { label: NODE_LABELS.B } },
  { id: "C", position: { x: 650, y: 380 }, data: { label: NODE_LABELS.C } },
  { id: "D", position: { x: 590, y: 430 }, data: { label: NODE_LABELS.D } },
  { id: "E", position: { x: 520, y: 430 }, data: { label: NODE_LABELS.E } },
  { id: "F", position: { x: 470, y: 490 }, data: { label: NODE_LABELS.F } },

  { id: "M", position: { x: 700, y: 200 }, data: { label: NODE_LABELS.M } },
  { id: "N", position: { x: 740, y: 230 }, data: { label: NODE_LABELS.N } },
  { id: "O", position: { x: 820, y: 280 }, data: { label: NODE_LABELS.O } },
  { id: "P", position: { x: 900, y: 360 }, data: { label: NODE_LABELS.P } },
  { id: "Q", position: { x: 860, y: 520 }, data: { label: NODE_LABELS.Q } },
  { id: "R", position: { x: 830, y: 600 }, data: { label: NODE_LABELS.R } },
];

// Adjacency list inferred from map paths (approximate)
const GRAPH_ADJACENCY = {
  // Left and academic block area
  S: ["L", "H"],
  L: ["S", "K", "H"],
  H: ["L", "I", "G"],
  I: ["H", "J", "F"],
  J: ["I", "K", "F"],
  K: ["J", "L", "T", "F"],
  T: ["K"],

  // Central ring and connections
  G: ["A", "B", "C", "H", "M"],
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

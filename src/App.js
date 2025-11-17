// src/App.js
import React, { useState, useEffect, useMemo } from "react";
import NetworkGraph from "./components/NetworkGraph";
import ComparisonChart from "./components/ComparisonChart";
import ErrorChart from "./components/ErrorChart";
import ControlBar from "./components/ControlBar";
import StatsDisplay from "./components/StatsDisplay";
import { useRandomWalkLoop } from "./hooks/useRandomWalkLoop";
import {
  calculateAnalyticalPi,
  validateAndSymmetrizeAdj,
} from "./utils/analyticalMath";
import "./components/App.css";

/*
  App.js
  - High-level wiring for the DA-IICT Random Walk demo.
  - Uses the improved simulation hook and mathematically-sound analytical pi.
*/

/* ---------------------------
   Static graph definition
   --------------------------- */
const NODE_LABELS = {
  A: "Admin",
  B: "Faculty-4",
  C: "Faculty-3",
  D: "Faculty-2",
  E: "Faculty-1",
  F: "RC",
  G: "CEP",
  H: "Lab",
  I: "Lecture Theatre-1",
  J: "Lecture Theatre-2",
  K: "Lecture Theatre-3",
  L: "HOR Men",
  M: "Mess",
  N: "Cafeteria",
  O: "SAC-1",
  P: "SAC-2",
  Q: "HOR Women",
  R: "Campus Residencies",
};

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

// Static adjacency (intended as undirected). We will symmetrize/validate it in code.
const GRAPH_ADJACENCY_RAW = {
  L: ["K", "H"],
  H: ["L", "I", "G"],
  I: ["H", "J", "F"],
  J: ["I", "K", "F"],
  K: ["J", "L", "F"],
  G: ["A", "B", "C", "H", "M", "D"],
  A: ["G", "B", "E"],
  B: ["A", "C", "G"],
  C: ["B", "D", "G"],
  D: ["C", "E", "F", "G"],
  E: ["A", "D", "F"],
  F: ["E", "D", "I", "J", "K"],
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

function makeInitialNodes() {
  return Object.keys(BASE_POS).map((id) => ({
    id,
    position: {
      x: BASE_POS[id].x * SCALE + OFFSET.x,
      y: BASE_POS[id].y * SCALE + OFFSET.y,
    },
    data: { label: NODE_LABELS[id] },
  }));
}

/* ---------------------------
   App component
   --------------------------- */
function App() {
  // ----- UI / simulation state -----
  const [isRunning, setIsRunning] = useState(false);
  const [currentNode, setCurrentNode] = useState("A");
  const [totalSteps, setTotalSteps] = useState(0); // 0-based counting
  const [simulationSpeed, setSimulationSpeed] = useState(100); // ms per step
  const [errorHistory, setErrorHistory] = useState([]);

  // ----- visit counts (initialized to zero) -----
  const [visitCounts, setVisitCounts] = useState(() => {
    const initial = {};
    NODE_IDS.forEach((id) => (initial[id] = 0));
    return initial;
  });

  // ----- static data memoized -----
  const INITIAL_NODES = useMemo(makeInitialNodes, []);
  const [GRAPH_ADJACENCY, setGraphAdjacency] = useState(
    () => GRAPH_ADJACENCY_RAW
  );
  const INITIAL_EDGES = useMemo(
    () => buildEdgesFromAdj(GRAPH_ADJACENCY),
    [GRAPH_ADJACENCY]
  );

  // ----- Validate & symmetrize adjacency on mount (and warn if inconsistencies) -----
  useEffect(() => {
    const sym = validateAndSymmetrizeAdj(GRAPH_ADJACENCY_RAW, NODE_IDS);
    setGraphAdjacency(sym);
  }, []);

  // ----- Analytical stationary distribution (recompute if adjacency changes) -----
  const analyticalPi = useMemo(() => {
    if (!GRAPH_ADJACENCY) return null;
    return calculateAnalyticalPi(GRAPH_ADJACENCY, NODE_IDS);
  }, [GRAPH_ADJACENCY]);

  // ----- Empirical π: safe handling for totalSteps === 0 -----
  const empiricalPi = useMemo(() => {
    const emp = {};
    if (totalSteps === 0) {
      NODE_IDS.forEach((id) => (emp[id] = 0));
      return emp;
    }
    NODE_IDS.forEach((id) => {
      emp[id] = (visitCounts[id] || 0) / totalSteps;
    });
    return emp;
  }, [visitCounts, totalSteps]);

  // ----- Hook that runs the random walk loop -----
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

  /* -----------------------
     Handlers
     ----------------------- */
  const handleStartPause = () => {
    setIsRunning((s) => !s);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentNode("A");
    setTotalSteps(0);
    const reset = {};
    NODE_IDS.forEach((id) => (reset[id] = 0));
    setVisitCounts(reset);
    setErrorHistory([]);
  };

  const handleChangeStartNode = (startId) => {
    setIsRunning(false);
    setCurrentNode(startId);
    setTotalSteps(0);
    const reset = {};
    NODE_IDS.forEach((id) => (reset[id] = 0));
    reset[startId] = 1; // treat start node as visited once at t=0 if desired
    setVisitCounts(reset);
    setErrorHistory([]);
  };

  const handleChangeSpeed = (newSpeed) => {
    setSimulationSpeed(Number(newSpeed));
  };

  return (
    <div className="app-container">
      <header>
        <h1>🎲 Random Walk on DA-IICT Campus Network</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          Analytical π (power iteration) vs empirical π (Monte Carlo)
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
            visitCounts={visitCounts}
            analyticalPi={analyticalPi}
          />
        </div>

        <div className="right-column">
          <StatsDisplay
            totalSteps={totalSteps}
            visitCounts={visitCounts}
            currentNode={currentNode}
            nodeLabels={NODE_LABELS}
            analyticalPi={analyticalPi}
            empiricalPi={empiricalPi}
          />

          <ComparisonChart
            analyticalPi={analyticalPi}
            empiricalPi={empiricalPi}
            nodeLabels={NODE_LABELS}
          />

          <ErrorChart errorHistory={errorHistory} />
        </div>
      </div>
    </div>
  );
}

export default App;

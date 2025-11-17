// src/hooks/useRandomWalkLoop.js
import { useEffect, useRef } from "react";

/*
  useRandomWalkLoop
  - Stable, ref-driven simulation loop (no interval recreation per step).
  - Records visits and increments steps atomically.
  - Pushes TV error into history at a moderate cadence to avoid noisy charts.
  - Designed to be Safe in React StrictMode (cleans up intervals and guards duplicates).
*/

export function useRandomWalkLoop({
  isRunning,
  simulationSpeed,
  currentNode,
  adjList,
  setCurrentNode,
  setVisitCounts,
  setTotalSteps,
  setErrorHistory,
  analyticalPi,
  totalSteps,
  empiricalPi,
}) {
  const intervalRef = useRef(null);
  const currentNodeRef = useRef(currentNode);
  const adjRef = useRef(adjList);
  const speedRef = useRef(simulationSpeed);

  // Keep refs in sync without causing re-creation of interval
  useEffect(() => {
    currentNodeRef.current = currentNode;
  }, [currentNode]);

  useEffect(() => {
    adjRef.current = adjList;
  }, [adjList]);

  useEffect(() => {
    speedRef.current = simulationSpeed;
  }, [simulationSpeed]);

  // Main simulation effect: only depends on isRunning.
  useEffect(() => {
    // Clear existing interval to avoid duplicates (StrictMode safe)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning) {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    intervalRef.current = setInterval(() => {
      const node = currentNodeRef.current;
      const neighbors = adjRef.current[node] || [node];
      // uniform random neighbor
      const nextNode =
        neighbors[Math.floor(Math.random() * neighbors.length)] || node;

      // update ref immediately
      currentNodeRef.current = nextNode;

      // Update React state (these will be batched by React)
      setCurrentNode(nextNode);
      setTotalSteps((prev) => prev + 1);
      setVisitCounts((prev) => ({
        ...prev,
        [nextNode]: (prev[nextNode] || 0) + 1,
      }));
    }, speedRef.current);

    // cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, setCurrentNode, setVisitCounts, setTotalSteps]);

  // Error logging: record TV error every N steps
  useEffect(() => {
    const LOG_EVERY = 500; // aggregation cadence; adjust for smoothness
    if (!analyticalPi || Object.keys(analyticalPi).length === 0) return;
    if (totalSteps > 0 && totalSteps % LOG_EVERY === 0) {
      // compute TV distance
      const nodeIds = Object.keys(analyticalPi);
      let tv = 0;
      for (const id of nodeIds) {
        const a = analyticalPi[id] || 0;
        const e = empiricalPi[id] || 0;
        tv += Math.abs(a - e);
      }
      tv = 0.5 * tv;

      setErrorHistory((prev) => [...prev, { step: totalSteps, error: tv }]);
    }
  }, [totalSteps, analyticalPi, empiricalPi, setErrorHistory]);
}

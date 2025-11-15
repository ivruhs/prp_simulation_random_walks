import { useEffect, useRef } from "react";

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

  // Random walk simulation
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // 1. Get neighbors (safe fallback to self)
        const neighbors = adjList[currentNode] || [currentNode];
        // 2. Choose next node at random
        const nextNode =
          neighbors[Math.floor(Math.random() * neighbors.length)] ||
          currentNode;

        // 3. Update state
        setCurrentNode(nextNode);
        setTotalSteps((prev) => prev + 1);
        setVisitCounts((prevCounts) => ({
          ...prevCounts,
          [nextNode]: (prevCounts[nextNode] || 0) + 1,
        }));
      }, simulationSpeed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [
    isRunning,
    simulationSpeed,
    currentNode,
    adjList,
    setCurrentNode,
    setVisitCounts,
    setTotalSteps,
  ]);

  // Error calculation effect - separate from simulation loop
  useEffect(() => {
    if (
      totalSteps > 1 &&
      totalSteps % 100 === 0 &&
      Object.keys(analyticalPi).length > 0
    ) {
      // Calculate Total Variation Distance (error)
      let error = 0;
      const nodeIds = Object.keys(analyticalPi);
      for (const id of nodeIds) {
        error += Math.abs(analyticalPi[id] - (empiricalPi[id] || 0));
      }
      error = 0.5 * error;

      setErrorHistory((prevHistory) => [
        ...prevHistory,
        { step: totalSteps, error: error },
      ]);
    }
  }, [totalSteps, analyticalPi, empiricalPi, setErrorHistory]);
}

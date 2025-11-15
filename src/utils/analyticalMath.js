// Robust analytical stationary distribution via power iteration (no external eigs)
export function calculateAnalyticalPi(adjList, nodeIds) {
  const numNodes = nodeIds.length;
  const indexOf = new Map(nodeIds.map((id, i) => [id, i]));

  // Build adjacency matrix
  const A = Array.from({ length: numNodes }, () => Array(numNodes).fill(0));
  for (const id of nodeIds) {
    const i = indexOf.get(id);
    const neighbors = adjList[id] || [];
    for (const nbr of neighbors) {
      if (!indexOf.has(nbr)) continue;
      const j = indexOf.get(nbr);
      A[i][j] = 1;
    }
  }

  // Transition matrix P (row-stochastic). If degree=0 make absorbing.
  const P = A.map((row, i) => {
    const degree = row.reduce((a, b) => a + b, 0);
    if (degree === 0) {
      const selfLoop = Array(numNodes).fill(0);
      selfLoop[i] = 1;
      return selfLoop;
    }
    return row.map((v) => v / degree);
  });

  // Power iteration on left eigenvector: pi = pi * P
  let pi = Array(numNodes).fill(1 / numNodes);
  const maxIter = 1500;
  const tol = 1e-12;
  for (let iter = 0; iter < maxIter; iter++) {
    const next = Array(numNodes).fill(0);
    for (let i = 0; i < numNodes; i++) {
      const row = P[i];
      const weight = pi[i];
      if (weight === 0) continue;
      for (let j = 0; j < numNodes; j++) {
        const p = row[j];
        if (p !== 0) next[j] += weight * p;
      }
    }
    const sum = next.reduce((a, b) => a + b, 0);
    if (sum === 0 || !Number.isFinite(sum)) break;
    for (let j = 0; j < numNodes; j++) next[j] /= sum;
    let diff = 0;
    for (let j = 0; j < numNodes; j++) diff += Math.abs(next[j] - pi[j]);
    pi = next;
    if (diff < tol) break;
  }

  const sumPi = pi.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(sumPi) || Math.abs(sumPi - 1) > 1e-6) {
    const degrees = A.map((row) => row.reduce((a, b) => a + b, 0));
    const totalDegree = degrees.reduce((a, b) => a + b, 0);
    if (totalDegree > 0) {
      pi = degrees.map((d) => d / totalDegree);
      console.warn(
        "Power iteration normalization issue; used degree-based distribution"
      );
    } else {
      pi = Array(numNodes).fill(1 / numNodes);
      console.warn("Graph empty; using uniform distribution");
    }
  }

  const result = {};
  nodeIds.forEach((id, i) => (result[id] = pi[i]));
  return result;
}

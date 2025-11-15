import { matrix, transpose, eigs } from "mathjs";

// Function to calculate the stationary distribution (pi)
export function calculateAnalyticalPi(adjList, nodeIds) {
  const numNodes = nodeIds.length;
  const nodeIndex = new Map(nodeIds.map((id, i) => [id, i]));

  // 1. Create Adjacency Matrix (A)
  let A = Array(numNodes)
    .fill(0)
    .map(() => Array(numNodes).fill(0));
  for (const nodeId of nodeIds) {
    const i = nodeIndex.get(nodeId);
    for (const neighborId of adjList[nodeId]) {
      const j = nodeIndex.get(neighborId);
      A[i][j] = 1;
    }
  }

  // 2. Create Transition Matrix (P)
  let P = A.map((row) => {
    const degree = row.reduce((a, b) => a + b, 0);
    return degree === 0 ? row : row.map((val) => val / degree);
  });

  // 3. Solve for stationary distribution using math.js
  // We need the eigenvector of P.T for eigenvalue 1
  try {
    const P_T = transpose(matrix(P));
    const result = eigs(P_T);

    // Safely coerce outputs to plain arrays
    const valuesRaw = result.values;
    const eigenvectorsRaw = result.eigenvectors;
    const values =
      typeof valuesRaw?.toArray === "function"
        ? valuesRaw.toArray()
        : Array.isArray(valuesRaw)
        ? valuesRaw
        : [];
    const eigenvectorsMatrix =
      typeof eigenvectorsRaw?.toArray === "function"
        ? eigenvectorsRaw.toArray()
        : Array.isArray(eigenvectorsRaw)
        ? eigenvectorsRaw
        : [];

    if (!values.length || !eigenvectorsMatrix.length) {
      throw new Error("Empty eigs() result");
    }

    // Find eigenvalue with real part closest to 1
    let idx = 0;
    let bestDelta = Infinity;
    for (let i = 0; i < values.length; i++) {
      const ev = values[i];
      const re =
        ev && typeof ev === "object" && "re" in ev ? ev.re : Number(ev);
      const d = Math.abs(1 - re);
      if (d < bestDelta) {
        bestDelta = d;
        idx = i;
      }
    }

    // Eigenvectors are columns; pick column idx
    let piVector = eigenvectorsMatrix.map((row) => {
      const v = row[idx];
      const re = v && typeof v === "object" && "re" in v ? v.re : Number(v);
      return Number.isFinite(re) ? Math.abs(re) : 0;
    });

    let sum = piVector.reduce((a, b) => a + b, 0);
    if (!Number.isFinite(sum) || sum === 0) {
      throw new Error("Invalid eigenvector sum");
    }

    const normalizedPi = piVector.map((v) => v / sum);

    const piDict = {};
    nodeIds.forEach((id, i) => {
      piDict[id] = normalizedPi[i];
    });
    return piDict;
  } catch (err) {
    // Fallback: for undirected graphs, pi_i ∝ degree(i)
    try {
      const degrees = A.map((row) => row.reduce((a, b) => a + b, 0));
      const totalDegree = degrees.reduce((a, b) => a + b, 0);
      if (totalDegree > 0) {
        const piDict = {};
        nodeIds.forEach((id, i) => {
          piDict[id] = degrees[i] / totalDegree;
        });
        console.warn(
          "eigs() failed, using degree-based stationary distribution:",
          err?.message || err
        );
        return piDict;
      }
    } catch (_) {}
    console.error("Error in analytical calculation and fallback:", err);
    return {};
  }
}

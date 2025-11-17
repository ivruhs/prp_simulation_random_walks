// src/utils/analyticalMath.js
/*
  Analytical math utilities:
  - validateAndSymmetrizeAdj: ensures adjacency is undirected (symmetrize & warn)
  - calculateAnalyticalPi: power-iteration left eigenvector π s.t. π = π P
    with safe fallback to degree-based distribution π_i = deg(i) / (2|E|).
*/

export function validateAndSymmetrizeAdj(adjRaw, nodeIds = []) {
  // Make a copy and ensure every edge is present in both directions.
  const adj = {};
  const allowed = new Set(nodeIds);
  nodeIds.forEach((id) => (adj[id] = []));
  for (const [u, nbrs] of Object.entries(adjRaw)) {
    if (!allowed.has(u)) continue;
    for (const v of nbrs) {
      if (!allowed.has(v)) continue;
      // add both directions
      if (!adj[u].includes(v)) adj[u].push(v);
      if (!adj[v].includes(u)) adj[v].push(u);
    }
  }

  // Detect if any asymmetry existed and log a warning (non-fatal)
  for (const u of nodeIds) {
    const rawNbrs = new Set(adjRaw[u] || []);
    const symNbrs = new Set(adj[u] || []);
    for (const v of rawNbrs) {
      if (!symNbrs.has(v)) {
        // This case won't happen due to our construction, but keep the check
        console.warn(
          `Adjacency asymmetry detected: ${u} -> ${v} was added symmetrically.`
        );
      }
    }
  }

  return adj;
}

export function calculateAnalyticalPi(adjList, nodeIds) {
  const n = nodeIds.length;
  if (n === 0) return {};

  // index map
  const indexOf = new Map(nodeIds.map((id, i) => [id, i]));

  // Build symmetric adjacency sets (assume adjList already symmetrized by validateAndSymmetrizeAdj)
  const neighbors = Array.from({ length: n }, () => []);
  for (const id of nodeIds) {
    const i = indexOf.get(id);
    const nbrs = adjList[id] || [];
    for (const v of nbrs) {
      if (!indexOf.has(v)) continue;
      neighbors[i].push(v);
    }
  }

  // Build transition matrix P (row-stochastic)
  const P = Array.from({ length: n }, () => Array(n).fill(0));
  const degrees = Array(n).fill(0);
  let totalDegree = 0;

  for (let i = 0; i < n; i++) {
    degrees[i] = neighbors[i].length;
    totalDegree += degrees[i];
    if (degrees[i] === 0) {
      P[i][i] = 1; // isolated node absorbing
    } else {
      const inv = 1 / degrees[i];
      for (const v of neighbors[i]) {
        const j = indexOf.get(v);
        P[i][j] = inv;
      }
    }
  }

  // Power iteration: compute left eigenvector satisfying π = π P
  let pi = Array(n).fill(1 / n);
  const maxIter = 3000;
  const tol = 1e-14;

  for (let iter = 0; iter < maxIter; iter++) {
    const next = Array(n).fill(0);

    // next[j] = sum_i pi[i] * P[i][j]  (i.e. next = pi * P)
    for (let i = 0; i < n; i++) {
      const weight = pi[i];
      if (weight === 0) continue;
      const row = P[i];
      for (let j = 0; j < n; j++) {
        const pij = row[j];
        if (pij !== 0) next[j] += weight * pij;
      }
    }

    // normalize
    const s = next.reduce((a, b) => a + b, 0);
    if (!Number.isFinite(s) || s <= 0) break;
    for (let j = 0; j < n; j++) next[j] /= s;

    // check convergence
    let diff = 0;
    for (let j = 0; j < n; j++) diff += Math.abs(next[j] - pi[j]);

    pi = next;
    if (diff < tol) break;
  }

  // Validate normalization; fallback to degree formula if necessary
  const sumPi = pi.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(sumPi) || Math.abs(sumPi - 1) > 1e-9) {
    if (totalDegree > 0) {
      // For an undirected connected graph, π_i = degree(i) / (2|E|)
      const fallback = {};
      for (let i = 0; i < n; i++) {
        fallback[nodeIds[i]] = degrees[i] / totalDegree;
      }
      console.warn(
        "Power iteration unstable. Falling back to degree-based stationary distribution."
      );
      return fallback;
    } else {
      // empty graph: uniform
      const uniform = {};
      for (let i = 0; i < n; i++) uniform[nodeIds[i]] = 1 / n;
      console.warn("Empty graph: using uniform stationary distribution.");
      return uniform;
    }
  }

  // Map back to object
  const result = {};
  for (let i = 0; i < n; i++) result[nodeIds[i]] = pi[i];
  return result;
}

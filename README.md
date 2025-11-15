# Random Walk on Networks — Simulation + Analytical Report

An interactive React dashboard that simulates a simple random walk on the DA-IICT campus network, and compares the empirical (simulated) distribution with the analytical stationary distribution. This README doubles as a concise report you can present.

## What You’ll Show

- The network graph and an animated walker moving along edges
- Theoretical stationary probabilities per node and the reason behind them
- Live empirical probabilities converging to theory
- A convergence error chart (Total Variation Distance)

## Theory (In Brief)

We run a simple random walk on an undirected, connected, aperiodic graph. From any node i, the next node is chosen uniformly at random among its neighbors.

- Transition matrix P is row-stochastic: P[i, j] = 1/deg(i) if (i, j) is an edge, else 0.
- For such graphs, the unique stationary distribution π satisfies π = πP and, crucially:

  π(i) = deg(i) / (2|E|)

Intuition: In steady state, the walk visits nodes in proportion to how many edges “lead into” them.

## Analytical Computation in App

We compute π by numerical power iteration on P (robust and eigen-free):

1. Build P from the adjacency list (isolated nodes become absorbing if any).
2. Start with uniform π0 and iterate πk+1 = πk P.
3. Normalize each step; stop when L1-difference < 1e-12 or after 1500 iters.
4. As a safety net, if normalization is off (e.g., degenerate graph), fall back to deg/Σdeg.

This matches the closed-form π(i) ∝ deg(i) on undirected graphs like ours.

## Our Graph (After Cleanup)

We removed two nodes (STP & RO Plant, DG/Sub Station) and ensured symmetry. The only previous asymmetry was missing D in G’s neighbor list; it is fixed (G ↔ D).

Nodes and degrees (deg):

- L: 2
- H: 3
- I: 3
- J: 3
- K: 3
- G: 6
- A: 3
- B: 3
- C: 3
- D: 4
- E: 3
- F: 5
- M: 3
- N: 2
- O: 3
- P: 2
- Q: 2
- R: 1

Total degree Σ deg = 54 → number of edges |E| = 54/2 = 27.

Therefore theoretical stationary probabilities are:

- L: 2/54 ≈ 0.0370
- H: 3/54 ≈ 0.0556
- I: 3/54 ≈ 0.0556
- J: 3/54 ≈ 0.0556
- K: 3/54 ≈ 0.0556
- G: 6/54 ≈ 0.1111
- A: 3/54 ≈ 0.0556
- B: 3/54 ≈ 0.0556
- C: 3/54 ≈ 0.0556
- D: 4/54 ≈ 0.0741
- E: 3/54 ≈ 0.0556
- F: 5/54 ≈ 0.0926
- M: 3/54 ≈ 0.0556
- N: 2/54 ≈ 0.0370
- O: 3/54 ≈ 0.0556
- P: 2/54 ≈ 0.0370
- Q: 2/54 ≈ 0.0370
- R: 1/54 ≈ 0.0185

These sum to 1 (up to rounding). Nodes with higher degree (e.g., G, F) have higher stationary probability.

## What the App Shows Live

- Empirical distribution (visit counts / total steps) per node
- Analytical distribution from power iteration (matches deg/2|E|)
- TVD error every 100 steps: 0.5 × Σi |π(i) − p_emp(i)|.
  You can point out how error decreases as the simulation runs longer.

## Visual/UX Notes (What We Improved)

- Removed STP & RO Plant and DG/Sub Station nodes per request
- Increased spacing by scaling node coordinates and enlarging the canvas
- Added fit/zoom options for better readability and less clutter
- Dark, professional theme with glassy panels and legible typography

## Run It

```bash
npm install
npm start
```

Open http://localhost:3000 and present:

- Start/Pause to control the walk, Reset to restart
- Adjust speed with the slider
- Watch the stats panel for current node and visit counts (full names)
- Use the charts to argue convergence and validate theory

## Source Map

```
/src
|-- /components
|   |-- NetworkGraph.js      # React Flow graph visualization (spaced + themed)
|   |-- ComparisonChart.js   # Bar chart comparing distributions
|   |-- ErrorChart.js        # Line chart showing convergence
|   |-- ControlBar.js        # Simulation controls (styled)
|   |-- StatsDisplay.js      # Visit counts with full node names
|   |-- App.css              # Theme, panels, typography
|-- /hooks
|   |-- useRandomWalkLoop.js # Simulation loop + error sampling
|-- /utils
|   |-- analyticalMath.js    # Power-iteration stationary distribution
|-- App.js                   # Graph data, layout, glue
|-- index.js                 # Entry point
```

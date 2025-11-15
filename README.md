# Random Walk on Networks - Interactive Simulation Dashboard

An interactive React application that simulates and visualizes random walks on a network graph, comparing theoretical (analytical) vs. empirical (simulated) stationary distributions.

## Features

- **Real-time Network Visualization**: Interactive graph showing the walker's current position
- **Analytical Calculations**: Uses eigenvector analysis to calculate theoretical stationary distribution
- **Live Simulation**: Runs a random walk simulation with real-time updates
- **Comparison Charts**: Bar chart comparing theoretical vs. simulated distributions
- **Convergence Tracking**: Line chart showing how the simulation converges to the analytical solution

## Technologies Used

- **React** - UI framework
- **React Flow** - Network graph visualization
- **Recharts** - Data visualization charts
- **Math.js** - Matrix calculations and eigenvector analysis

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## How It Works

1. The application calculates the theoretical stationary distribution π using eigenvector analysis
2. A random walk simulation runs in real-time, visiting nodes according to the graph's adjacency structure
3. The simulation tracks visit counts and calculates the empirical distribution
4. Charts update live to show the convergence of the simulation to the theoretical distribution

## Project Structure

```
/src
|-- /components
|   |-- NetworkGraph.js      # React Flow graph visualization
|   |-- ComparisonChart.js   # Bar chart comparing distributions
|   |-- ErrorChart.js        # Line chart showing convergence
|   |-- ControlBar.js        # Simulation controls
|   |-- StatsDisplay.js      # Visit count statistics
|   |-- App.css              # Main styling
|-- /hooks
|   |-- useRandomWalkLoop.js # Custom hook for simulation loop
|-- /utils
|   |-- analyticalMath.js    # Analytical calculations
|-- App.js                   # Main application component
|-- index.js                 # Application entry point
```

## Controls

- **Start/Pause**: Begin or pause the random walk simulation
- **Reset**: Reset the simulation to initial state
- **Speed Slider**: Adjust simulation speed (10ms - 1000ms per step)

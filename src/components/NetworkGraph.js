import React, { useMemo } from "react";
import ReactFlow, { Controls, MiniMap, Background } from "reactflow";
import "reactflow/dist/style.css";

function NetworkGraph({ nodes, edges, currentNode }) {
  const styledNodes = useMemo(() => {
    return nodes.map((node) => {
      if (node.id === currentNode) {
        return {
          ...node,
          style: {
            background: "linear-gradient(135deg,#dc2626,#ef4444)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.35)",
            fontWeight: 600,
            borderRadius: 14,
            boxShadow: "0 10px 30px -5px rgba(239,68,68,0.55)",
            padding: 6,
          },
        };
      }
      return {
        ...node,
        style: {
          background:
            "linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))",
          color: "#f1f5f9",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 14,
          boxShadow: "0 6px 20px -6px rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          padding: 6,
          fontSize: 13,
        },
      };
    });
  }, [nodes, currentNode]);

  return (
    <div style={{ height: "760px", borderRadius: 18, overflow: "hidden" }}>
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.25}
        maxZoom={1.6}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          animated: true,
          type: "smoothstep",
          style: { stroke: "#60a5fa", strokeWidth: 2 },
        }}
      >
        <MiniMap
          nodeStrokeColor={(n) =>
            n.id === currentNode ? "#ef4444" : "#64748b"
          }
          nodeColor={(n) => (n.id === currentNode ? "#dc2626" : "#334155")}
        />
        <Controls position="bottom-right" />
        <Background gap={40} color="#1e293b" />
      </ReactFlow>
    </div>
  );
}

export default NetworkGraph;

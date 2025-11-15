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
            background: "#e03131",
            color: "white",
            border: "2px solid #e03131",
            fontWeight: "bold",
            boxShadow: "0 8px 20px rgba(224,49,49,0.35)",
          },
        };
      }
      return {
        ...node,
        style: {
          background: "#ffffff",
          color: "#222",
          border: "1px solid #ced4da",
          borderRadius: 8,
          boxShadow: "0 4px 14px rgba(33,37,41,0.08)",
        },
      };
    });
  }, [nodes, currentNode]);

  return (
    <div
      style={{
        height: "620px",
        border: "1px solid #e9ecef",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          animated: true,
          type: "smoothstep",
          style: { stroke: "#5c7cfa" },
        }}
      >
        <MiniMap
          nodeStrokeColor={(n) =>
            n.id === currentNode ? "#e03131" : "#495057"
          }
          nodeColor={(n) => (n.id === currentNode ? "#fa5252" : "#adb5bd")}
        />
        <Controls position="bottom-right" />
        <Background gap={24} color="#f1f3f5" />
      </ReactFlow>
    </div>
  );
}

export default NetworkGraph;

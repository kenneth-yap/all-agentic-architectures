"use client";
import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Architecture, FlowNode, FlowEdge } from "@/lib/types";
import {
  A1InputNode,
  A2DecisionNode,
  A3MemoryNode,
  A4CoordinationNode,
  A5OutputNode,
  StartNode,
  EndNode,
} from "./nodes/CustomNodes";

const nodeTypes = {
  a1input:        A1InputNode,
  a2decision:     A2DecisionNode,
  a3memory:       A3MemoryNode,
  a4coordination: A4CoordinationNode,
  a5output:       A5OutputNode,
  start:          StartNode,
  end:            EndNode,
};

interface Props {
  architecture: Architecture;
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
}

function toReactFlowNodes(nodes: FlowNode[], activeNodeId?: string): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      nodeType: n.type,
      isActive: n.id === activeNodeId,
      description: n.description,
    },
  }));
}

function toReactFlowEdges(edges: FlowEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "smoothstep",
    animated: !!e.conditional,
    style: {
      stroke: e.conditional ? "#94a3b8" : "#475569",
      strokeWidth: 1.5,
    },
    labelStyle: { fontSize: 10, fill: "#64748b" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
  }));
}

export default function FlowDiagram({ architecture, activeNodeId, onNodeClick }: Props) {
  const nodes = useMemo(
    () => toReactFlowNodes(architecture.nodes, activeNodeId),
    [architecture.nodes, activeNodeId]
  );
  const edges = useMemo(() => toReactFlowEdges(architecture.edges), [architecture.edges]);

  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

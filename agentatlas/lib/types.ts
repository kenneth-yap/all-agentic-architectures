export type ControlFlow = "linear" | "conditional" | "parallel" | "emergent";
export type LoopType = "none" | "fixed" | "reactive" | "iterative" | "bfs";
export type MemoryType = "none" | "message_history" | "faiss+neo4j" | "neo4j" | "grid";
export type NodeType = "llm" | "tool" | "memory" | "human" | "rule" | "start" | "end" | "controller";

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  description?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  conditional?: boolean;
}

export interface TraceStep {
  activeNodeId: string;
  label: string;
  stateSnapshot: Record<string, unknown>;
  explanation: string;
}

export interface Architecture {
  id: string;
  number: number;
  name: string;
  part: 1 | 2 | 3 | 4 | 5;
  tagline: string;
  controlFlow: ControlFlow;
  loopType: LoopType;
  memoryType: MemoryType;
  toolUse: boolean;
  llmDriven: boolean;
  llmCallsPerTask: string;
  keyDifferentiator: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  executionTrace: TraceStep[];
  codeSnippets: Record<string, string>;
  demoInput: string;
  demoOutput: string;
  color: string;
}

export const PART_LABELS: Record<number, string> = {
  1: "Foundational Single-Agent",
  2: "Multi-Agent Collaboration",
  3: "Advanced Memory & Reasoning",
  4: "Safety & Reliability",
  5: "Learning & Adaptation",
};

export const PART_COLORS: Record<number, string> = {
  1: "#6366f1",
  2: "#10b981",
  3: "#f59e0b",
  4: "#ef4444",
  5: "#8b5cf6",
};

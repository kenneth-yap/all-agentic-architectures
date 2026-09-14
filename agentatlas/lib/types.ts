export type ControlFlow = "linear" | "conditional" | "parallel" | "emergent";
export type LoopType = "none" | "fixed" | "reactive" | "iterative" | "bfs";
export type MemoryType = "none" | "message_history" | "faiss+neo4j" | "neo4j" | "grid";
export type NodeType =
  | "a1input"
  | "a2decision"
  | "a3memory"
  | "a4coordination"
  | "a5output"
  | "start"
  | "end";
export type Paradigm =
  | "reactive"
  | "deliberative"
  | "hybrid"
  | "bdi"
  | "learning"
  | "mas"
  | "emergent";

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

export interface WhenToUseItem {
  useCase: string;
  reason: string;
}

export interface ComparedToItem {
  name: string;
  insight: string;
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
  paradigm: Paradigm;
  conceptualInsight: string;
  whenToUse: WhenToUseItem[];
  strengths: string[];
  weaknesses: string[];
  comparedTo?: ComparedToItem[];
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

export const A_COMPONENT_LABELS: Record<NodeType, string> = {
  a1input: "A1 — Input",
  a2decision: "A2 — Decision",
  a3memory: "A3 — Memory",
  a4coordination: "A4 — Coordination",
  a5output: "A5 — Output",
  start: "",
  end: "",
};

export const A_COMPONENT_COLORS: Record<NodeType, { bg: string; border: string; badge: string; text: string }> = {
  a1input:       { bg: "#f0f9ff", border: "#38bdf8", badge: "#0ea5e9", text: "#0c4a6e" },
  a2decision:    { bg: "#f5f3ff", border: "#8b5cf6", badge: "#7c3aed", text: "#2e1065" },
  a3memory:      { bg: "#fffbeb", border: "#fbbf24", badge: "#d97706", text: "#451a03" },
  a4coordination:{ bg: "#f0fdfa", border: "#2dd4bf", badge: "#0d9488", text: "#042f2e" },
  a5output:      { bg: "#f0fdf4", border: "#4ade80", badge: "#16a34a", text: "#052e16" },
  start:         { bg: "#1e293b", border: "#475569", badge: "#1e293b", text: "#f8fafc" },
  end:           { bg: "#1e293b", border: "#475569", badge: "#1e293b", text: "#f8fafc" },
};

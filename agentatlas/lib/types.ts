export type ControlFlow = "linear" | "conditional" | "parallel" | "emergent";
export type LoopType = "none" | "fixed" | "reactive" | "iterative" | "bfs";
export type MemoryType = "none" | "message_history" | "faiss+neo4j" | "neo4j" | "grid";
export type NodeType =
  | "llm"
  | "rule"
  | "tool"
  | "memory"
  | "human"
  | "controller"
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

export interface A1A5Profile {
  a1input: string;
  a2decision: string;
  a3memory: string;
  a4coordination: string;
  a5output: string;
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
  a1a5Profile: A1A5Profile;
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

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  llm:        "LLM",
  rule:       "Rule",
  tool:       "Tool",
  memory:     "Memory",
  human:      "Human",
  controller: "Controller",
  start:      "",
  end:        "",
};

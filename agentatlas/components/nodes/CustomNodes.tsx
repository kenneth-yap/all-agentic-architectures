"use client";
import { Handle, Position } from "@xyflow/react";

const BASE = "rounded-lg border-2 px-3 py-2 text-center text-xs font-semibold min-w-[80px] shadow-md whitespace-pre-line leading-tight";

const NODE_STYLES: Record<string, string> = {
  llm: "bg-indigo-50 border-indigo-400 text-indigo-900",
  tool: "bg-emerald-50 border-emerald-400 text-emerald-900",
  memory: "bg-amber-50 border-amber-400 text-amber-900",
  human: "bg-rose-50 border-rose-400 text-rose-900",
  rule: "bg-slate-50 border-slate-400 text-slate-900",
  controller: "bg-purple-50 border-purple-400 text-purple-900",
  start: "bg-gray-800 border-gray-600 text-white rounded-full px-4",
  end: "bg-gray-800 border-gray-600 text-white rounded-full px-4",
};

const NODE_ICONS: Record<string, string> = {
  llm: "🧠",
  tool: "🔧",
  memory: "💾",
  human: "👤",
  rule: "⚙️",
  controller: "🎛️",
  start: "",
  end: "",
};

interface NodeData {
  label: string;
  nodeType: string;
  isActive: boolean;
  description?: string;
}

function makeNode(type: string) {
  return function CustomNode({ data }: { data: NodeData }) {
    const isTerminal = type === "start" || type === "end";
    const activeRing = data.isActive ? "ring-4 ring-yellow-400 ring-offset-2 scale-105" : "";
    return (
      <div className={`${BASE} ${NODE_STYLES[type]} ${activeRing} transition-all duration-300`}>
        {!isTerminal && <Handle type="target" position={Position.Top} className="!bg-gray-400" />}
        <span className="mr-1">{NODE_ICONS[type]}</span>
        {data.label}
        {!isTerminal && <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />}
      </div>
    );
  };
}

export const LLMNode = makeNode("llm");
export const ToolNode = makeNode("tool");
export const MemoryNode = makeNode("memory");
export const HumanNode = makeNode("human");
export const RuleNode = makeNode("rule");
export const ControllerNode = makeNode("controller");
export const StartNode = makeNode("start");
export const EndNode = makeNode("end");

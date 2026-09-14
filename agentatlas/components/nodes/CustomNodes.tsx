"use client";
import { Handle, Position } from "@xyflow/react";

interface NodeData {
  label: string;
  nodeType: string;
  isActive: boolean;
  description?: string;
}

const NODE_CONFIG: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  llm:        { bg: "bg-violet-50",  border: "border-violet-400", text: "text-violet-900", icon: "🧠" },
  rule:       { bg: "bg-sky-50",     border: "border-sky-400",    text: "text-sky-900",    icon: "⚙️" },
  tool:       { bg: "bg-emerald-50", border: "border-emerald-400",text: "text-emerald-900",icon: "🔧" },
  memory:     { bg: "bg-amber-50",   border: "border-amber-400",  text: "text-amber-900",  icon: "🗄️" },
  human:      { bg: "bg-orange-50",  border: "border-orange-400", text: "text-orange-900", icon: "👤" },
  controller: { bg: "bg-teal-50",    border: "border-teal-500",   text: "text-teal-900",   icon: "🔄" },
};

function TypedNode({ data, type }: { data: NodeData; type: string }) {
  const cfg = NODE_CONFIG[type];
  const active = data.isActive ? "ring-4 ring-yellow-400 ring-offset-2 scale-105" : "";
  return (
    <div
      className={`relative rounded-lg border-2 px-3 py-2 text-center text-xs font-semibold min-w-[110px] shadow-md whitespace-pre-line leading-tight transition-all duration-300 ${cfg.bg} ${cfg.border} ${cfg.text} ${active}`}
    >
      <Handle type="target" position={Position.Top}    className="!bg-gray-400" />
      <Handle type="target" position={Position.Left}   className="!bg-gray-400" style={{ top: "50%" }} />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
      <Handle type="source" position={Position.Right}  className="!bg-gray-400" style={{ top: "50%" }} />
      <div className="absolute -top-2 -left-2 text-[10px] leading-none">{cfg.icon}</div>
      {data.label}
    </div>
  );
}

function TerminalNode({ data, type }: { data: NodeData; type: string }) {
  const active = data.isActive ? "ring-4 ring-yellow-400 ring-offset-2 scale-105" : "";
  const isStart = type === "start";
  return (
    <div
      className={`bg-slate-800 border-2 border-slate-600 text-white rounded-full px-5 py-2 text-xs font-bold text-center shadow-md transition-all duration-300 ${active}`}
    >
      {isStart && <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />}
      {!isStart && <Handle type="target" position={Position.Top} className="!bg-gray-400" />}
      {data.label}
    </div>
  );
}

export const LlmNode        = ({ data }: { data: NodeData }) => <TypedNode data={data} type="llm" />;
export const RuleNode       = ({ data }: { data: NodeData }) => <TypedNode data={data} type="rule" />;
export const ToolNode       = ({ data }: { data: NodeData }) => <TypedNode data={data} type="tool" />;
export const MemoryNode     = ({ data }: { data: NodeData }) => <TypedNode data={data} type="memory" />;
export const HumanNode      = ({ data }: { data: NodeData }) => <TypedNode data={data} type="human" />;
export const ControllerNode = ({ data }: { data: NodeData }) => <TypedNode data={data} type="controller" />;
export const StartNode      = ({ data }: { data: NodeData }) => <TerminalNode data={data} type="start" />;
export const EndNode        = ({ data }: { data: NodeData }) => <TerminalNode data={data} type="end" />;

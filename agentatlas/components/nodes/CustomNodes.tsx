"use client";
import { Handle, Position } from "@xyflow/react";

interface NodeData {
  label: string;
  nodeType: string;
  isActive: boolean;
  description?: string;
}

const NODE_CONFIG: Record<string, { bg: string; border: string; badge: string; text: string; badgeLabel: string; icon: string }> = {
  a1input:        { bg: "bg-sky-50",     border: "border-sky-400",    badge: "bg-sky-500",     text: "text-sky-900",    badgeLabel: "A1", icon: "📡" },
  a2decision:     { bg: "bg-violet-50",  border: "border-violet-500", badge: "bg-violet-600",  text: "text-violet-900", badgeLabel: "A2", icon: "🧠" },
  a3memory:       { bg: "bg-amber-50",   border: "border-amber-400",  badge: "bg-amber-500",   text: "text-amber-900",  badgeLabel: "A3", icon: "🗄️" },
  a4coordination: { bg: "bg-teal-50",    border: "border-teal-500",   badge: "bg-teal-600",    text: "text-teal-900",   badgeLabel: "A4", icon: "🔄" },
  a5output:       { bg: "bg-emerald-50", border: "border-emerald-500",badge: "bg-emerald-600", text: "text-emerald-900",badgeLabel: "A5", icon: "⚡" },
};

function AComponentNode({ data, type }: { data: NodeData; type: string }) {
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
      <div className={`absolute -top-2 -left-2 flex items-center gap-0.5 ${cfg.badge} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none`}>
        <span>{cfg.icon}</span>
        <span>{cfg.badgeLabel}</span>
      </div>
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

export const A1InputNode        = ({ data }: { data: NodeData }) => <AComponentNode data={data} type="a1input" />;
export const A2DecisionNode     = ({ data }: { data: NodeData }) => <AComponentNode data={data} type="a2decision" />;
export const A3MemoryNode       = ({ data }: { data: NodeData }) => <AComponentNode data={data} type="a3memory" />;
export const A4CoordinationNode = ({ data }: { data: NodeData }) => <AComponentNode data={data} type="a4coordination" />;
export const A5OutputNode       = ({ data }: { data: NodeData }) => <AComponentNode data={data} type="a5output" />;
export const StartNode          = ({ data }: { data: NodeData }) => <TerminalNode   data={data} type="start" />;
export const EndNode            = ({ data }: { data: NodeData }) => <TerminalNode   data={data} type="end" />;

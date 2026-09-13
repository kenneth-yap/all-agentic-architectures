"use client";
import Link from "next/link";
import { Architecture, PART_LABELS, PART_COLORS } from "@/lib/types";

interface Props {
  arch: Architecture;
}

const CONTROL_FLOW_LABELS: Record<string, string> = {
  linear: "Linear",
  conditional: "Conditional",
  parallel: "Parallel",
  emergent: "Emergent",
};

const LOOP_LABELS: Record<string, string> = {
  none: "One-pass",
  fixed: "Fixed loop",
  reactive: "Reactive loop",
  iterative: "Iterative",
  bfs: "BFS search",
};

export default function ArchitectureCard({ arch }: Props) {
  const partColor = PART_COLORS[arch.part];

  return (
    <Link href={`/architectures/${arch.id}`}>
      <div className="group rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-200 p-5 h-full flex flex-col gap-3 cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: partColor }}
          >
            Part {arch.part}
          </div>
          <span className="text-slate-400 text-xs font-mono">#{arch.number.toString().padStart(2, "0")}</span>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition-colors">
            {arch.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{arch.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          <Pill label={CONTROL_FLOW_LABELS[arch.controlFlow]} color="blue" />
          <Pill label={LOOP_LABELS[arch.loopType]} color="slate" />
          {!arch.llmDriven && <Pill label="No LLM" color="amber" />}
          {arch.toolUse && <Pill label="Tool Use" color="green" />}
        </div>

        <div className="text-xs text-slate-400 border-t border-slate-100 pt-2 mt-1">
          LLM calls: <span className="font-semibold text-slate-600">{arch.llmCallsPerTask}</span>
        </div>
      </div>
    </Link>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>
      {label}
    </span>
  );
}

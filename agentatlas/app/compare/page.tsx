"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { architectures } from "@/lib/architectures";
import { Architecture } from "@/lib/types";

const FlowDiagram = dynamic(() => import("@/components/FlowDiagram"), { ssr: false });

const A1A5_PROFILE_ROWS = [
  { key: "a1input"        as const, label: "A1 Input",        icon: "📡", color: "text-sky-700"     },
  { key: "a2decision"     as const, label: "A2 Decision",     icon: "🧠", color: "text-violet-700"  },
  { key: "a3memory"       as const, label: "A3 Memory",       icon: "🗄️", color: "text-amber-700"   },
  { key: "a4coordination" as const, label: "A4 Coordination", icon: "🔄", color: "text-teal-700"    },
  { key: "a5output"       as const, label: "A5 Output",       icon: "⚡", color: "text-emerald-700" },
];

const METRICS = [
  { key: "controlFlow", label: "Control Flow" },
  { key: "loopType", label: "Loop Type" },
  { key: "memoryType", label: "Memory" },
  { key: "llmDriven", label: "LLM-Driven", render: (v: unknown) => (v ? "Yes" : "No") },
  { key: "toolUse", label: "Tool Use", render: (v: unknown) => (v ? "Yes" : "No") },
  { key: "llmCallsPerTask", label: "LLM Calls/Task" },
] as const;

export default function ComparePage() {
  const [idA, setIdA] = useState(architectures[0].id);
  const [idB, setIdB] = useState(architectures[2].id);

  const archA = architectures.find((a) => a.id === idA)!;
  const archB = architectures.find((a) => a.id === idB)!;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">← Home</Link>
          <h1 className="text-3xl font-extrabold text-slate-900">Compare Architectures</h1>
          <p className="text-slate-500 mt-1">Select two architectures to see their flow diagrams and metrics side by side</p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[{ id: idA, setId: setIdA, label: "Architecture A" }, { id: idB, setId: setIdB, label: "Architecture B" }].map(({ id, setId, label }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
              <select
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {architectures.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.number.toString().padStart(2, "0")} — {a.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Flow diagrams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ArchPanel arch={archA} />
          <ArchPanel arch={archB} />
        </div>

        {/* Metrics diff */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="px-4 py-3">Metric</div>
            <div className="px-4 py-3 text-indigo-700">{archA.name}</div>
            <div className="px-4 py-3 text-emerald-700">{archB.name}</div>
            <div className="px-4 py-3">Same?</div>
          </div>
          {METRICS.map((m) => {
            const valA = archA[m.key as keyof Architecture];
            const valB = archB[m.key as keyof Architecture];
            const renderFn = (m as { render?: (v: unknown) => string }).render;
            const dispA = renderFn ? renderFn(valA) : String(valA);
            const dispB = renderFn ? renderFn(valB) : String(valB);
            const same = dispA === dispB;
            return (
              <div key={m.key} className="grid grid-cols-4 border-b border-slate-100 text-sm">
                <div className="px-4 py-3 font-medium text-slate-600">{m.label}</div>
                <div className="px-4 py-3 text-indigo-800 font-mono text-xs">{dispA}</div>
                <div className="px-4 py-3 text-emerald-800 font-mono text-xs">{dispB}</div>
                <div className="px-4 py-3">{same ? <span className="text-slate-400">—</span> : <span className="text-rose-500 text-xs font-semibold">Different</span>}</div>
              </div>
            );
          })}
        </div>

        {/* A1-A5 Profile comparison */}
        {archA.a1a5Profile && archB.a1a5Profile && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3">A1-A5 Architecture Profile</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-[160px_1fr_1fr] bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="px-4 py-3">Component</div>
                <div className="px-4 py-3 text-indigo-700">{archA.name}</div>
                <div className="px-4 py-3 text-emerald-700">{archB.name}</div>
              </div>
              {A1A5_PROFILE_ROWS.map(({ key, label, icon, color }) => {
                const valA = archA.a1a5Profile![key];
                const valB = archB.a1a5Profile![key];
                const differ = valA !== valB;
                return (
                  <div key={key} className={`grid grid-cols-[160px_1fr_1fr] border-b border-slate-100 text-sm ${differ ? "bg-amber-50/40" : ""}`}>
                    <div className={`px-4 py-3 flex items-center gap-1.5 font-semibold text-xs ${color}`}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                    <div className={`px-4 py-3 border-l border-slate-100 ${valA.startsWith("None") ? "text-slate-400 italic text-xs" : "text-indigo-900 text-xs"}`}>{valA}</div>
                    <div className={`px-4 py-3 border-l border-slate-100 ${valB.startsWith("None") ? "text-slate-400 italic text-xs" : "text-emerald-900 text-xs"}`}>{valB}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Key differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiffBox arch={archA} color="indigo" />
          <DiffBox arch={archB} color="emerald" />
        </div>
      </div>
    </div>
  );
}

function ArchPanel({ arch }: { arch: Architecture }) {
  return (
    <div>
      <div className="font-bold text-slate-800 mb-2">
        <Link href={`/architectures/${arch.id}`} className="hover:text-indigo-600 transition-colors">
          #{arch.number.toString().padStart(2, "0")} {arch.name} →
        </Link>
      </div>
      <div className="h-[400px]">
        <FlowDiagram architecture={arch} />
      </div>
    </div>
  );
}

function DiffBox({ arch, color }: { arch: Architecture; color: "indigo" | "emerald" }) {
  const styles = {
    indigo: "border-indigo-200 bg-indigo-50",
    emerald: "border-emerald-200 bg-emerald-50",
  };
  const textStyles = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[color]}`}>
      <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${textStyles[color]}`}>
        {arch.name} — Key Differentiator
      </div>
      <p className="text-sm text-slate-700">{arch.keyDifferentiator}</p>
    </div>
  );
}

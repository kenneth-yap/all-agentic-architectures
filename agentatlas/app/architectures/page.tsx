"use client";
import { useState } from "react";
import { architectures } from "@/lib/architectures";
import ArchitectureCard from "@/components/ArchitectureCard";
import { PART_LABELS } from "@/lib/types";
import Link from "next/link";

const PARTS = [1, 2, 3, 4, 5] as const;
const CONTROL_FLOWS = ["linear", "conditional", "parallel", "emergent"] as const;

export default function ArchitecturesPage() {
  const [partFilter, setPartFilter] = useState<number | null>(null);
  const [flowFilter, setFlowFilter] = useState<string | null>(null);
  const [llmFilter, setLlmFilter] = useState<boolean | null>(null);

  const filtered = architectures.filter((a) => {
    if (partFilter !== null && a.part !== partFilter) return false;
    if (flowFilter !== null && a.controlFlow !== flowFilter) return false;
    if (llmFilter !== null && a.llmDriven !== llmFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">All Architectures</h1>
          <p className="text-slate-500 mt-1">
            {filtered.length} of {architectures.length} patterns
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <FilterGroup label="Part">
            {PARTS.map((p) => (
              <FilterChip
                key={p}
                label={`Part ${p}`}
                active={partFilter === p}
                onClick={() => setPartFilter(partFilter === p ? null : p)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Control Flow">
            {CONTROL_FLOWS.map((f) => (
              <FilterChip
                key={f}
                label={f}
                active={flowFilter === f}
                onClick={() => setFlowFilter(flowFilter === f ? null : f)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="LLM-driven">
            <FilterChip label="Yes" active={llmFilter === true} onClick={() => setLlmFilter(llmFilter === true ? null : true)} />
            <FilterChip label="No" active={llmFilter === false} onClick={() => setLlmFilter(llmFilter === false ? null : false)} />
          </FilterGroup>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((arch) => (
            <ArchitectureCard key={arch.id} arch={arch} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-slate-400 py-20">
            No architectures match your filters.
            <button onClick={() => { setPartFilter(null); setFlowFilter(null); setLlmFilter(null); }} className="block mx-auto mt-3 text-indigo-500 hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}:</span>
      {children}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
      }`}
    >
      {label}
    </button>
  );
}

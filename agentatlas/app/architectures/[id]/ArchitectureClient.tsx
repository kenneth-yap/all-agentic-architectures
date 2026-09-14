"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getArchitecture, architectures } from "@/lib/architectures";
import { PART_LABELS, PART_COLORS } from "@/lib/types";
import StepController from "@/components/StepController";
import CodePanel from "@/components/CodePanel";

const FlowDiagram = dynamic(() => import("@/components/FlowDiagram"), { ssr: false });

const A1A5_ROWS = [
  { key: "a1input",        label: "A1 Input",        icon: "📡", color: "text-sky-700",    bg: "bg-sky-50",    border: "border-sky-200"    },
  { key: "a2decision",     label: "A2 Decision",     icon: "🧠", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  { key: "a3memory",       label: "A3 Memory",       icon: "🗄️", color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"  },
  { key: "a4coordination", label: "A4 Coordination", icon: "🔄", color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-200"   },
  { key: "a5output",       label: "A5 Output",       icon: "⚡", color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200"},
] as const;

export default function ArchitectureClient({ arch }: { arch: NonNullable<ReturnType<typeof getArchitecture>> }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState(arch.executionTrace[0]?.activeNodeId || "");
  const [clickedNodeId, setClickedNodeId] = useState("");

  const step = arch.executionTrace[currentStep];

  function handleStep(index: number) {
    setCurrentStep(index);
    setActiveNodeId(arch.executionTrace[index]?.activeNodeId || "");
  }

  function handleNodeClick(nodeId: string) {
    setClickedNodeId(nodeId);
    setActiveNodeId(nodeId);
  }

  const currentIndex = architectures.findIndex((a) => a.id === arch.id);
  const prev = architectures[currentIndex - 1];
  const next = architectures[currentIndex + 1];

  const partColor = PART_COLORS[arch.part];
  const codeNodeId = clickedNodeId || step?.activeNodeId || "";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-indigo-600 hover:underline">Home</Link>
          <span className="text-slate-400">/</span>
          <Link href="/architectures" className="text-indigo-600 hover:underline">Architectures</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">{arch.name}</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: partColor }}
            >
              Part {arch.part}: {PART_LABELS[arch.part]}
            </div>
            <span className="text-slate-400 text-sm font-mono">
              #{arch.number.toString().padStart(2, "0")}
            </span>
            {!arch.llmDriven && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                ⚡ No LLM
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{arch.name}</h1>
          <p className="text-slate-600 mt-1">{arch.tagline}</p>
        </div>

        {/* Key differentiator callout */}
        <div className="mb-6 rounded-xl border-l-4 bg-indigo-50 border-indigo-400 px-5 py-4">
          <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Key Differentiator</div>
          <p className="text-slate-800 text-sm">{arch.keyDifferentiator}</p>
        </div>

        {/* Conceptual Insight */}
        {arch.conceptualInsight && (
          <div className="mb-6 rounded-xl border-l-4 bg-violet-50 border-violet-400 px-5 py-4">
            <div className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">Conceptual Insight</div>
            <p className="text-slate-800 text-sm">{arch.conceptualInsight}</p>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Control Flow", value: arch.controlFlow },
            { label: "Loop Type", value: arch.loopType },
            { label: "Memory", value: arch.memoryType },
            { label: "LLM Calls", value: arch.llmCallsPerTask },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">{m.value}</div>
            </div>
          ))}
        </div>

        {/* A1-A5 Architecture Profile */}
        {arch.a1a5Profile && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              A1-A5 Architecture Profile
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              {A1A5_ROWS.map(({ key, label, icon, color, bg, border }) => {
                const value = arch.a1a5Profile[key];
                const isNone = value.startsWith("None");
                return (
                  <div key={key} className={`grid grid-cols-[140px_1fr] border-b last:border-b-0 ${border} border-l-4 ${bg}`}>
                    <div className={`px-3 py-3 flex items-center gap-1.5 text-xs font-bold ${color}`}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                    <div className={`px-3 py-3 text-sm border-l border-slate-100 ${isNone ? "text-slate-400 italic" : "text-slate-700"}`}>
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main layout: diagram + code panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-[480px]">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Architecture Flow <span className="font-normal text-slate-400 ml-1">(click a node to see its code)</span>
            </div>
            <div className="h-[460px]">
              <FlowDiagram
                architecture={arch}
                activeNodeId={activeNodeId}
                onNodeClick={handleNodeClick}
              />
            </div>
          </div>

          <div className="h-[480px] flex flex-col gap-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Code & State
            </div>
            <div className="flex-1">
              <CodePanel
                snippets={arch.codeSnippets}
                activeNodeId={codeNodeId}
                stateSnapshot={step?.stateSnapshot}
              />
            </div>
          </div>
        </div>

        {/* Step-through */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Execution Walkthrough
          </div>
          <StepController
            steps={arch.executionTrace}
            currentStep={currentStep}
            onStep={handleStep}
          />
        </div>

        {/* Demo I/O */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Demo Input</div>
            <p className="text-sm text-slate-700 italic">"{arch.demoInput}"</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-4">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Demo Output</div>
            <p className="text-sm text-slate-700 font-mono whitespace-pre-wrap text-xs">{arch.demoOutput}</p>
          </div>
        </div>

        {/* When to Use */}
        {arch.whenToUse && arch.whenToUse.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3">When to Use This Pattern</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {arch.whenToUse.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-800 mb-2">{item.useCase}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        {(arch.strengths?.length > 0 || arch.weaknesses?.length > 0) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Strengths & Weaknesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Strengths</div>
                <ul className="space-y-2">
                  {arch.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Weaknesses</div>
                <ul className="space-y-2">
                  {arch.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Compared To */}
        {arch.comparedTo && arch.comparedTo.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Compared to Similar Architectures</h2>
            <div className="space-y-3">
              {arch.comparedTo.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-block text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                      vs {item.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center border-t border-slate-200 pt-6">
          {prev ? (
            <Link href={`/architectures/${prev.id}`} className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
              ← #{prev.number.toString().padStart(2, "0")} {prev.name}
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/architectures/${next.id}`} className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
              #{next.number.toString().padStart(2, "0")} {next.name} →
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}

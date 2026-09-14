"use client";
import { useState } from "react";

interface Props {
  snippets: Record<string, string>;
  activeNodeId: string;
  stateSnapshot?: Record<string, unknown>;
}

export default function CodePanel({ snippets, activeNodeId, stateSnapshot }: Props) {
  const [tab, setTab] = useState<"code" | "state">("code");
  const code = snippets[activeNodeId];
  const hasCode = !!code;

  return (
    <div className="rounded-xl border border-slate-200 bg-white h-full flex flex-col">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab("code")}
          className={`px-4 py-2.5 text-xs font-semibold transition-colors ${
            tab === "code"
              ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setTab("state")}
          className={`px-4 py-2.5 text-xs font-semibold transition-colors ${
            tab === "state"
              ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          State
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {tab === "code" ? (
          hasCode ? (
            <pre className="text-slate-800 whitespace-pre-wrap">{code}</pre>
          ) : (
            <p className="text-slate-400 text-center mt-8">
              Click a node in the diagram to see its code
            </p>
          )
        ) : (
          stateSnapshot ? (
            <pre className="text-slate-800 whitespace-pre-wrap">
              {JSON.stringify(stateSnapshot, null, 2)}
            </pre>
          ) : (
            <p className="text-slate-400 text-center mt-8">
              Step through the trace to see state
            </p>
          )
        )}
      </div>
    </div>
  );
}

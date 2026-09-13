import Link from "next/link";
import { architectures } from "@/lib/architectures";
import { PART_LABELS, PART_COLORS } from "@/lib/types";

const parts = [1, 2, 3, 4, 5] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-xs font-medium mb-8">
          17 patterns · 5 categories · interactive walkthroughs
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          AgentAtlas
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4">
          Every agentic architecture explained — from simple reflection loops to
          emergent cellular automata. Interactive flow diagrams, real code, step-by-step walkthroughs.
        </p>
        <p className="text-sm text-indigo-300 mb-10">
          Spoiler: not all agents are LLMs.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/architectures"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-colors"
          >
            Explore All 17 →
          </Link>
          <Link
            href="/compare"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white transition-colors"
          >
            Compare Side-by-Side
          </Link>
          <Link
            href="/beyond-llms"
            className="px-6 py-3 bg-amber-600/80 hover:bg-amber-500 rounded-xl font-semibold text-white transition-colors"
          >
            Beyond LLMs ⚡
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "17", label: "Architectures" },
            { value: "5", label: "Categories" },
            { value: "3", label: "Non-LLM Agents" },
            { value: "∞", label: "Things to learn" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Path */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Learning Path</h2>
        <div className="space-y-3">
          {parts.map((part) => {
            const partArchs = architectures.filter((a) => a.part === part);
            const color = PART_COLORS[part];
            return (
              <div key={part} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {part}
                  </div>
                  <span className="font-semibold text-white">{PART_LABELS[part]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {partArchs.map((a) => (
                    <Link key={a.id} href={`/architectures/${a.id}`}>
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer">
                        #{a.number.toString().padStart(2, "0")} {a.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Node legend */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Node Legend</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { color: "bg-indigo-100 border-indigo-400 text-indigo-900", icon: "🧠", label: "LLM Node" },
            { color: "bg-emerald-100 border-emerald-400 text-emerald-900", icon: "🔧", label: "Tool Node" },
            { color: "bg-amber-100 border-amber-400 text-amber-900", icon: "💾", label: "Memory Node" },
            { color: "bg-rose-100 border-rose-400 text-rose-900", icon: "👤", label: "Human Gate" },
            { color: "bg-slate-100 border-slate-400 text-slate-900", icon: "⚙️", label: "Rule/Algorithm" },
            { color: "bg-purple-100 border-purple-400 text-purple-900", icon: "🎛️", label: "Controller" },
          ].map((n) => (
            <div key={n.label} className={`border-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${n.color}`}>
              {n.icon} {n.label}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

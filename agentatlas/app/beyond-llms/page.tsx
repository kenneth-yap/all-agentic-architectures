"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { createWarehouseGrid, tick, tracePath, Grid } from "@/lib/cellular-automata";

const SHELF_A = [3, 0] as [number, number];

const CELL_COLORS: Record<string, string> = {
  obstacle: "bg-slate-700",
  shelf: "bg-amber-400 text-slate-900",
  packing: "bg-emerald-500 text-white",
  empty: "bg-slate-100",
  path: "bg-indigo-300",
};

function valueColor(value: number, maxVal: number): string {
  if (value === Infinity || value === 0) return "";
  const pct = 1 - value / maxVal;
  const g = Math.round(pct * 200);
  return `rgb(${200 - g}, ${g + 50}, 150)`;
}

function GridView({ grid, path }: { grid: Grid; path: [number, number][] }) {
  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
  const maxVal = Math.max(
    ...grid.flat().filter((c) => c.value !== Infinity).map((c) => c.value)
  );

  return (
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isPath = pathSet.has(`${r},${c}`) && cell.type !== "packing";
          const bg = cell.type !== "empty"
            ? CELL_COLORS[cell.type]
            : isPath
            ? CELL_COLORS.path
            : "";
          const style = cell.type === "empty" && !isPath && cell.value !== Infinity
            ? { backgroundColor: valueColor(cell.value, maxVal) }
            : {};

          return (
            <div
              key={`${r},${c}`}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold border transition-all duration-200 ${bg || "bg-slate-100"} ${cell.type === "obstacle" ? "text-white" : "text-slate-800"}`}
              style={style}
            >
              <span>{cell.label || (cell.type === "obstacle" ? "■" : "")}</span>
              {cell.type === "empty" && cell.value !== Infinity && (
                <span className="text-[9px] font-mono opacity-70">{cell.value}</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function CellularAutomataDemo() {
  const [grid, setGrid] = useState<Grid>(() => createWarehouseGrid());
  const [ticks, setTicks] = useState(0);
  const [stable, setStable] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [running, setRunning] = useState(false);

  const reset = useCallback(() => {
    setGrid(createWarehouseGrid());
    setTicks(0);
    setStable(false);
    setPath([]);
    setRunning(false);
  }, []);

  const stepOnce = useCallback(() => {
    setGrid((g) => {
      const { newGrid, changed } = tick(g);
      if (!changed) setStable(true);
      return newGrid;
    });
    setTicks((t) => t + 1);
  }, []);

  const runAll = useCallback(async () => {
    setRunning(true);
    let current = grid;
    let t = ticks;
    while (true) {
      const { newGrid, changed } = tick(current);
      current = newGrid;
      t++;
      setGrid(newGrid);
      setTicks(t);
      if (!changed) {
        setStable(true);
        break;
      }
      await new Promise((r) => setTimeout(r, 80));
    }
    setRunning(false);
  }, [grid, ticks]);

  const findPath = useCallback(() => {
    const p = tracePath(grid, SHELF_A[0], SHELF_A[1]);
    setPath(p);
  }, [grid]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-slate-900 text-lg mb-2">Live Warehouse Simulation</h3>
      <p className="text-sm text-slate-500 mb-4">
        The packing station <strong className="text-emerald-700">P</strong> starts at value 0. Each tick, every empty cell updates to{" "}
        <code className="bg-slate-100 px-1 rounded">min(neighbors) + 1</code>. The wave fills the grid — no LLM involved.
      </p>

      <div className="flex items-start gap-8 flex-wrap">
        <div>
          <GridView grid={grid} path={path} />
          <div className="mt-2 text-xs text-slate-400 text-center">
            Ticks: <strong>{ticks}</strong> {stable && "· Stable ✓"}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <button
            onClick={stepOnce}
            disabled={stable || running}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            One Tick →
          </button>
          <button
            onClick={runAll}
            disabled={stable || running}
            className="px-4 py-2 bg-indigo-100 text-indigo-800 text-sm rounded-xl hover:bg-indigo-200 disabled:opacity-40 transition-colors"
          >
            {running ? "Running..." : "Run Until Stable"}
          </button>
          <button
            onClick={findPath}
            disabled={!stable}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-500 disabled:opacity-40 transition-colors"
          >
            Trace Path from A →
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-xl hover:bg-slate-200 transition-colors"
          >
            Reset
          </button>

          <div className="mt-3 space-y-1.5 text-xs">
            <LegendItem color="bg-amber-400" label="Shelf (A-D)" />
            <LegendItem color="bg-emerald-500" label="Packing Station (P)" />
            <LegendItem color="bg-slate-700" label="Obstacle" />
            <LegendItem color="bg-indigo-300" label="Traced path" />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: "rgb(50, 200, 150)" }} />
              <span className="text-slate-500">Low cost to P</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: "rgb(200, 100, 150)" }} />
              <span className="text-slate-500">High cost to P</span>
            </div>
          </div>

          {path.length > 0 && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-mono text-emerald-800">
              Path ({path.length} steps):<br />
              {path.map(([r, c]) => `(${r},${c})`).join(" → ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded ${color}`} />
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

export default function BeyondLLMsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <Link href="/" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">← Home</Link>

        <div className="mb-10">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
            ⚡ Beyond LLMs
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Not All Agents Are LLMs</h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Two architectures in this repo use <em>zero LLM calls</em> for their core reasoning. Their intelligence comes from
            algorithmic rules, not transformer weights. This is the most important concept to internalize.
          </p>
        </div>

        {/* Conceptual contrast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">LLM-Based Agent</div>
            <p className="text-sm text-slate-700 mb-3">
              Intelligence lives in the model weights. The agent generates outputs token-by-token based on learned patterns.
            </p>
            <div className="font-mono text-xs bg-white rounded-lg p-3 text-slate-700">
              User query → LLM → Response
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Rule-Based Agent</div>
            <p className="text-sm text-slate-700 mb-3">
              Intelligence lives in the environment or algorithm. Simple local rules create complex global behavior.
            </p>
            <div className="font-mono text-xs bg-white rounded-lg p-3 text-slate-700">
              State → Rule → New State → Rule → ...
            </div>
          </div>
        </div>

        {/* CA Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">#16</span>
            <h2 className="text-xl font-bold text-slate-900">Cellular Automata — Warehouse Pathfinding</h2>
            <Link href="/architectures/cellular-automata" className="text-xs text-indigo-600 hover:underline ml-auto">
              Deep dive →
            </Link>
          </div>
          <p className="text-sm text-slate-600 mb-4 max-w-2xl">
            One rule drives everything:{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">
              new_value = min(current_value, min(neighbors) + 1)
            </code>. Applied synchronously to every cell on each tick, this single rule creates a cost-distance gradient across the entire warehouse — no LLM, no central planner.
          </p>
          <CellularAutomataDemo />
        </section>

        {/* ToT explanation */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">#09</span>
            <h2 className="text-xl font-bold text-slate-900">Tree of Thoughts — BFS State Search</h2>
            <Link href="/architectures/tree-of-thoughts" className="text-xs text-indigo-600 hover:underline ml-auto">
              Deep dive →
            </Link>
          </div>
          <p className="text-sm text-slate-600 mb-4 max-w-2xl">
            Solves the Wolf-Goat-Cabbage puzzle by exploring all valid state transitions breadth-first. The <em>environment's own rules</em> validate moves — the LLM only summarizes the final answer.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="font-semibold text-slate-700 mb-2">🌱 Initialize</div>
                <p className="text-slate-500 text-xs">Start with one path: [{"{"}wolf, goat, cabbage, farmer on LEFT{"}"}]</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="font-semibold text-blue-700 mb-2">🌿 Expand</div>
                <p className="text-slate-500 text-xs">For each path, generate all valid next states. <code className="bg-white px-1 rounded">is_valid()</code> filters out illegal moves.</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4">
                <div className="font-semibold text-rose-700 mb-2">✂️ Prune</div>
                <p className="text-slate-500 text-xs">Remove paths that revisit a state (cycle detection). Repeat until <code className="bg-white px-1 rounded">is_goal()</code> = True.</p>
              </div>
            </div>

            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 font-mono text-xs text-emerald-800">
              Solution (7 steps): Take goat → Return alone → Take wolf → Return with goat → Take cabbage → Return alone → Take goat
            </div>
          </div>
        </section>

        {/* Summary table */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">The Full Spectrum</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="px-4 py-3">Architecture</div>
              <div className="px-4 py-3">Core Intelligence</div>
              <div className="px-4 py-3">LLM Role</div>
              <div className="px-4 py-3">LLM Calls</div>
            </div>
            {[
              { name: "Cellular Automata (#16)", core: "Grid update rule: min(neighbors)+1", llm: "Only summary text", calls: "0" },
              { name: "Tree of Thoughts (#09)", core: "BFS + is_valid() state rules", llm: "Only final answer", calls: "0" },
              { name: "Simulator (#10)", core: "Geometric Brownian Motion", llm: "Proposes + refines action", calls: "3" },
              { name: "ReAct (#03)", core: "LLM decides every move", llm: "Full reasoning loop", calls: "3–10+" },
              { name: "Ensemble (#13)", core: "LLM × 3 + synthesis", llm: "4 separate LLM calls", calls: "4" },
            ].map((r) => (
              <div key={r.name} className="grid grid-cols-4 border-b border-slate-100 text-sm">
                <div className="px-4 py-3 font-medium text-slate-700">{r.name}</div>
                <div className="px-4 py-3 text-slate-600 text-xs">{r.core}</div>
                <div className="px-4 py-3 text-slate-500 text-xs">{r.llm}</div>
                <div className={`px-4 py-3 font-bold text-sm ${r.calls === "0" ? "text-amber-600" : "text-indigo-600"}`}>{r.calls}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

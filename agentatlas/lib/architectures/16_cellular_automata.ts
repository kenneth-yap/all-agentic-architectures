import { Architecture } from "../types";

export const cellularAutomata: Architecture = {
  id: "cellular-automata",
  number: 16,
  name: "Cellular Automata",
  part: 5,
  tagline: "Smart environment, simple agents — no LLM for pathfinding",
  controlFlow: "emergent",
  loopType: "bfs",
  memoryType: "grid",
  toolUse: false,
  llmDriven: false,
  llmCallsPerTask: "0 (pure rule-based)",
  keyDifferentiator: "Radically different paradigm: intelligence is in the grid update rule, not an individual agent. No LLM is used for pathfinding. Emergent global behavior from one local rule: new_value = min(current, min(neighbors) + 1).",
  color: "#8b5cf6",
  paradigm: "emergent",
  conceptualInsight: "Intelligence is in the environment, not the agent. Each cell only knows its own value and its four neighbors. Yet after N ticks, every cell in the grid holds its exact optimal distance to the goal — global optimal behavior emergent from purely local rules. This is what 'emergent intelligence' means: no agent ever computed the global solution, it arose from local interactions.",
  whenToUse: [
    { useCase: "Pathfinding in grid environments with obstacles", reason: "One rule (min(neighbors)+1) produces the globally optimal distance field in O(n) ticks — no A*, no Dijkstra, and trivially parallelizable." },
    { useCase: "Multi-agent coordination without communication", reason: "Once the wave stabilizes, any number of agents can follow the gradient simultaneously without coordination — they never interfere." },
    { useCase: "Any problem where the 'intelligence' can live in the substrate", reason: "CA inverts agent design: instead of a smart agent navigating a dumb environment, build a smart environment that any dumb agent can navigate." },
  ],
  strengths: [
    "Zero LLM calls — deterministic, fast, no hallucination risk",
    "Globally optimal paths, provably correct",
    "Trivially parallelizable — all cells update simultaneously",
    "Scales to arbitrarily large grids without re-planning",
  ],
  weaknesses: [
    "Only works for grid-world problems — not general-purpose",
    "Static obstacles only — dynamic obstacles require full re-propagation",
    "Memory: entire grid state must fit in memory",
    "Not useful when the problem can't be mapped to a distance field",
  ],
  comparedTo: [
    { name: "Tree of Thoughts", insight: "Both are LLM-free search algorithms. Tree of Thoughts uses explicit BFS over symbolic states; Cellular Automata propagates a wave through a grid — same emergent idea, different substrate." },
    { name: "ReAct", insight: "ReAct uses an LLM to reason about each step in a path; Cellular Automata computes the optimal path for the entire grid in one wave propagation — no per-step reasoning needed." },
  ],
  nodes: [
    { id: "start", type: "start",      label: "START",              x: 200, y: 20 },
    { id: "init",  type: "a2decision", label: "Initialize\nGrid",   x: 200, y: 160, description: "A2 (Decision): set up warehouse grid with obstacles, shelves, packing station at value=0" },
    { id: "wave",  type: "a2decision", label: "Propagate\nWave",    x: 200, y: 300, description: "A2 (Decision): each tick every cell updates to min(neighbors)+1; repeats until stable" },
    { id: "trace", type: "a2decision", label: "Trace\nOptimal Path",x: 200, y: 440, description: "A2 (Decision): from item shelf, greedily follow steepest descent to packing station" },
    { id: "end",   type: "end",        label: "END",                x: 200, y: 560 },
  ],
  edges: [
    { id: "e1", source: "start", target: "init" },
    { id: "e2", source: "init",  target: "wave" },
    { id: "e3", source: "wave",  target: "wave",  label: "not stable yet",         conditional: true },
    { id: "e4", source: "wave",  target: "trace", label: "stable (no changes)",    conditional: true },
    { id: "e5", source: "trace", target: "end" },
  ],
  demoInput: "Warehouse 7x7 grid: shelves A-D, packing station P, several obstacles. Find optimal path from shelf A to packing station.",
  demoOutput: "Path from shelf A (3,0): (3,0)→(3,1)→(3,2)→(4,2)→(5,2)→(5,3)→P. Optimal route avoiding all obstacles. Wave stabilized in 17 ticks.",
  executionTrace: [
    {
      activeNodeId: "init",
      label: "Step 1 — Initialize grid",
      stateSnapshot: {
        grid: "7x7 initialized",
        packing_station: [5, 3],
        shelves: { A: [3, 0], B: [0, 3], C: [6, 1], D: [1, 6] },
        obstacles: [[2, 2], [2, 3], [3, 4], [4, 4]],
      },
      explanation: "Grid created. Packing station P at (5,3) gets value=0. All other cells get value=∞. Obstacles are impassable.",
    },
    {
      activeNodeId: "wave",
      label: "Step 2 — Wave propagation (tick 1)",
      stateSnapshot: { tick: 1, changed_cells: 4, grid_values: "P=0, neighbors of P get value=1" },
      explanation: "Each cell checks its neighbors. Cells adjacent to P (value=0) update to min(∞, 0+1)=1. Wave starts spreading outward from packing station.",
    },
    {
      activeNodeId: "wave",
      label: "Step 3 — Wave propagation (ticks 2–17)",
      stateSnapshot: { tick: 17, changed_cells: 0, grid_values: "Gradient fills entire reachable grid" },
      explanation: "The wave propagates BFS-style outward. Obstacles block the wave; cells must route around them. After 17 ticks, no cell changes — the grid is stable. Every cell now holds its optimal distance to P.",
    },
    {
      activeNodeId: "trace",
      label: "Step 4 — Trace path from shelf A",
      stateSnapshot: { start: [3, 0], path: [], current: [3, 0] },
      explanation: "Starting at shelf A (3,0), greedy descent: always move to the neighbor with the lowest grid value. The path naturally navigates around obstacles by following the gradient.",
    },
  ],
  codeSnippets: {
    wave: `class CellAgent:
    type: str  # EMPTY | OBSTACLE | SHELF | PACKING_STATION
    pathfinding_value: float = float('inf')

    def update_value(self, neighbors: List["CellAgent"]) -> bool:
        if self.type == "OBSTACLE": return False
        reachable = [n for n in neighbors if n.type != "OBSTACLE"]
        if not reachable: return False
        new_value = min(n.pathfinding_value for n in reachable) + 1
        if new_value < self.pathfinding_value:
            self.pathfinding_value = new_value
            return True  # changed
        return False

def tick(grid: WarehouseGrid) -> bool:
    """One synchronous update of all cells. Returns True if any changed."""
    changed = False
    for row in range(grid.height):
        for col in range(grid.width):
            neighbors = grid.get_neighbors(row, col)
            if grid.cells[row][col].update_value(neighbors):
                changed = True
    return changed`,
    trace: `def propagate_path_wave(grid, target_pos):
    # Set target to 0, run ticks until stable
    grid.cells[target_pos[0]][target_pos[1]].pathfinding_value = 0
    while tick(grid):  # repeat until no changes
        pass

def trace_and_move_item(grid, start_pos):
    path = [start_pos]
    current = start_pos
    while not grid.cells[current[0]][current[1]].type == "PACKING_STATION":
        neighbors = grid.get_neighbors(current[0], current[1])
        # Greedy descent: move to lowest-value neighbor
        next_cell = min(neighbors, key=lambda n: n.pathfinding_value)
        current = next_cell.position
        path.append(current)
    return path`,
  },
};

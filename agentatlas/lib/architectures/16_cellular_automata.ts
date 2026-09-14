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
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "init", type: "rule", label: "Initialize\nGrid", x: 250, y: 110, description: "Set up 7x7 warehouse grid with obstacles, shelves (A-D), packing station (P)" },
    { id: "wave", type: "rule", label: "Propagate\nWave", x: 250, y: 230, description: "Each tick: every cell updates to min(neighbors)+1. Repeat until stable." },
    { id: "trace", type: "rule", label: "Trace\nOptimal Path", x: 250, y: 350, description: "From item's shelf, greedily follow steepest descent to packing station" },
    { id: "end", type: "end", label: "END", x: 250, y: 450 },
  ],
  edges: [
    { id: "e1", source: "start", target: "init" },
    { id: "e2", source: "init", target: "wave" },
    { id: "e3", source: "wave", target: "wave", label: "not stable yet", conditional: true },
    { id: "e4", source: "wave", target: "trace", label: "stable (no changes)", conditional: true },
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

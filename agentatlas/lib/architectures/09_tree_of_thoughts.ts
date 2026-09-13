import { Architecture } from "../types";

export const treeOfThoughts: Architecture = {
  id: "tree-of-thoughts",
  number: 9,
  name: "Tree of Thoughts",
  part: 3,
  tagline: "BFS over verified state — no LLM needed for reasoning",
  controlFlow: "conditional",
  loopType: "bfs",
  memoryType: "none",
  toolUse: false,
  llmDriven: false,
  llmCallsPerTask: "0 (rule-based BFS)",
  keyDifferentiator: "NOT LLM-guided reasoning — it's a programmatic BFS/DFS over verified states. The environment's rules (not the LLM) validate moves. Guarantees correctness for deterministic problems.",
  color: "#f59e0b",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "init", type: "rule", label: "Initialize\nPaths", x: 250, y: 110, description: "Create initial puzzle state, set active_paths to [[initial_state]]" },
    { id: "expand", type: "rule", label: "Expand\nPaths", x: 250, y: 220, description: "For each active path, generate all valid next states (BFS breadth-first)" },
    { id: "prune", type: "rule", label: "Prune\nPaths", x: 250, y: 330, description: "Remove paths containing cycles (state already visited in path)" },
    { id: "check", type: "rule", label: "Check\nSolution?", x: 250, y: 440, description: "Any path reached goal state?" },
    { id: "end", type: "end", label: "END", x: 250, y: 550 },
  ],
  edges: [
    { id: "e1", source: "start", target: "init" },
    { id: "e2", source: "init", target: "expand" },
    { id: "e3", source: "expand", target: "prune" },
    { id: "e4", source: "prune", target: "check" },
    { id: "e5", source: "check", target: "end", label: "solution found", conditional: true },
    { id: "e6", source: "check", target: "expand", label: "no solution yet", conditional: true },
  ],
  demoInput: "Wolf-Goat-Cabbage: Get all three across a river. Boat holds one. Wolf eats goat if alone. Goat eats cabbage if alone.",
  demoOutput: "Solved in 7 steps: Take goat → Return alone → Take wolf → Return with goat → Take cabbage → Return alone → Take goat. All constraints satisfied.",
  executionTrace: [
    {
      activeNodeId: "init",
      label: "Step 1 — Initialize",
      stateSnapshot: { active_paths: [[{ left: ["wolf", "goat", "cabbage", "farmer"], right: [], boat: "left" }]], solution: null },
      explanation: "Initial state: all on left bank. active_paths contains one path with one state.",
    },
    {
      activeNodeId: "expand",
      label: "Step 2 — Expand: generate valid moves",
      stateSnapshot: { active_paths: [[{ left: ["wolf", "goat", "cabbage", "farmer"], right: [], boat: "left" }]] },
      explanation: "get_possible_moves() returns 4 possible moves. is_valid() filters out moves leaving wolf+goat or goat+cabbage alone. Only 1 valid move: take the goat.",
    },
    {
      activeNodeId: "prune",
      label: "Step 3 — Prune cycles",
      stateSnapshot: { active_paths: [[{ left: ["wolf", "cabbage", "farmer"], right: ["goat"], boat: "right" }]] },
      explanation: "Check if any path visits the same state twice. No cycles yet — all paths survive. Tree has 1 active path.",
    },
    {
      activeNodeId: "check",
      label: "Step 4 — Check: not at goal",
      stateSnapshot: { active_paths: [[{ left: ["wolf", "cabbage", "farmer"], right: ["goat"], boat: "right" }]], solution: null },
      explanation: "is_goal() requires all on right bank. Not there yet. Loop back to expand.",
    },
    {
      activeNodeId: "expand",
      label: "Steps 5–7 — Continue BFS expansion",
      stateSnapshot: { active_paths: "multiple paths, branching at each step" },
      explanation: "BFS continues expanding valid states, pruning cycles. The algorithm systematically explores all valid sequences until the goal is found — no LLM involved.",
    },
    {
      activeNodeId: "check",
      label: "Step 8 — Solution found!",
      stateSnapshot: { solution: ["Take goat", "Return alone", "Take wolf", "Return with goat", "Take cabbage", "Return alone", "Take goat"] },
      explanation: "A path reaches is_goal() = True. Solution extracted from the successful path. 7 steps, all constraints satisfied.",
    },
  ],
  codeSnippets: {
    expand: `class PuzzleState(BaseModel):
    left_bank: List[str]
    right_bank: List[str]
    farmer_position: str  # "left" | "right"

    def is_valid(self) -> bool:
        # Wolf and goat alone without farmer?
        side = self.left_bank if self.farmer_position == "right" else self.right_bank
        if "wolf" in side and "goat" in side: return False
        if "goat" in side and "cabbage" in side: return False
        return True

    def get_possible_moves(self) -> List["PuzzleState"]:
        # Generate all valid next states (farmer crosses with 0 or 1 items)
        ...

def expand_paths(state: ToTState) -> ToTState:
    new_paths = []
    for path in state["active_paths"]:
        current = path[-1]
        for next_state in current.get_possible_moves():
            new_paths.append(path + [next_state])
    return {"active_paths": new_paths}`,
    prune: `def prune_paths(state: ToTState) -> ToTState:
    # Remove any path that visits the same state twice (cycle detection)
    valid_paths = []
    for path in state["active_paths"]:
        seen = set()
        has_cycle = False
        for s in path:
            key = (tuple(sorted(s.left_bank)), s.farmer_position)
            if key in seen:
                has_cycle = True
                break
            seen.add(key)
        if not has_cycle:
            valid_paths.append(path)
    return {"active_paths": valid_paths}`,
  },
};

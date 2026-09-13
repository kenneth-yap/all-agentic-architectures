import { Architecture } from "../types";

export const pev: Architecture = {
  id: "pev",
  number: 6,
  name: "Planner-Executor-Verifier",
  part: 2,
  tagline: "Plan → Execute → Verify, with automatic error recovery",
  controlFlow: "conditional",
  loopType: "iterative",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "N×3",
  keyDifferentiator: "Only architecture with a dedicated error-detection gate. The Verifier catches tool failures and triggers a smarter re-plan instead of passing errors downstream.",
  color: "#10b981",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "planner", type: "llm", label: "Planner", x: 250, y: 110, description: "Creates the step list; re-plans with failure context if triggered" },
    { id: "executor", type: "tool", label: "Executor", x: 250, y: 220, description: "Runs one step; may return error strings from flaky tools" },
    { id: "verifier", type: "llm", label: "Verifier", x: 250, y: 330, description: "Judges: did this step actually succeed? Returns is_successful + reasoning" },
    { id: "synthesizer", type: "llm", label: "Synthesizer", x: 250, y: 460, description: "Combines all verified results into final answer" },
    { id: "end", type: "end", label: "END", x: 250, y: 550 },
  ],
  edges: [
    { id: "e1", source: "start", target: "planner" },
    { id: "e2", source: "planner", target: "executor" },
    { id: "e3", source: "executor", target: "verifier" },
    { id: "e4", source: "verifier", target: "planner", label: "failed (retry)", conditional: true },
    { id: "e5", source: "verifier", target: "executor", label: "success, more steps", conditional: true },
    { id: "e6", source: "verifier", target: "synthesizer", label: "success, done", conditional: true },
    { id: "e7", source: "synthesizer", target: "end" },
  ],
  demoInput: "Find the number of employees at Microsoft",
  demoOutput: "Microsoft employs approximately 228,000 people worldwide as of 2024, making it one of the largest technology employers globally.",
  executionTrace: [
    {
      activeNodeId: "planner",
      label: "Step 1 — Plan",
      stateSnapshot: { user_request: "Find Microsoft employee count", plan: [], retries: 0 },
      explanation: "Planner creates step: ['search Microsoft employee count 2024']",
    },
    {
      activeNodeId: "executor",
      label: "Step 2 — Execute (tool fails!)",
      stateSnapshot: { plan: ["search Microsoft employee count 2024"], retries: 0 },
      explanation: "The flaky_web_search tool intentionally fails for 'employee count' queries. Returns: 'Error: Query timeout. No results found.'",
    },
    {
      activeNodeId: "verifier",
      label: "Step 3 — Verify: FAILED",
      stateSnapshot: { last_tool_result: "Error: Query timeout. No results found.", retries: 0 },
      explanation: "Verifier sees the error string and returns is_successful=False. Triggers re-plan path. (A basic planner-executor would pass this error to the synthesizer — score: 1/10)",
    },
    {
      activeNodeId: "planner",
      label: "Step 4 — Re-plan with context",
      stateSnapshot: { plan: [], retries: 1, failed_step: "search Microsoft employee count", failure_reason: "Query timeout" },
      explanation: "Planner receives the failure context and creates a new strategy: ['search Microsoft workforce size 2024', 'search MSFT annual report headcount']",
    },
    {
      activeNodeId: "executor",
      label: "Step 5 — Execute retry",
      stateSnapshot: { plan: ["search Microsoft workforce size 2024"], retries: 1 },
      explanation: "New search query 'workforce size' bypasses the flaky filter. Returns: 'Microsoft employs ~228,000 people.'",
    },
    {
      activeNodeId: "verifier",
      label: "Step 6 — Verify: SUCCESS",
      stateSnapshot: { last_tool_result: "Microsoft employs ~228,000 people worldwide", retries: 1 },
      explanation: "Verifier returns is_successful=True. Plan is now empty → route to synthesizer.",
    },
    {
      activeNodeId: "synthesizer",
      label: "Step 7 — Synthesize",
      stateSnapshot: { intermediate_steps: ["Microsoft employs ~228,000 people"], plan: [] },
      explanation: "Synthesizer composes the final answer. Score: 10/10 vs. 1/10 for the basic planner without verification.",
    },
  ],
  codeSnippets: {
    verifier: `class VerificationResult(BaseModel):
    is_successful: bool
    reasoning: str

def verifier_node(state: PEVState):
    prompt = f"""Did this tool execution succeed?
Result: {state['last_tool_result']}
Was this helpful or an error?"""
    result = llm.with_structured_output(VerificationResult).invoke(prompt)
    return {"last_verification": result}

def pev_router(state: PEVState):
    v = state["last_verification"]
    if not v.is_successful:
        if state["retries"] < 3:
            return "replan"  # trigger re-plan with failure context
    if state["plan"]:
        return "execute"
    return "synthesize"`,
    planner: `def planner_node(state: PEVState):
    # Inject failure context when re-planning
    failed_info = ""
    if state.get("last_verification") and not state["last_verification"].is_successful:
        failed_info = f"Previous attempt failed: {state['last_tool_result']}"

    prompt = f"""Create a search plan for: {state['user_request']}
{failed_info}
Avoid the approach that just failed."""
    plan = llm.with_structured_output(Plan).invoke(prompt)
    return {"plan": plan.steps, "retries": state.get("retries", 0) + 1}`,
  },
};

import { Architecture } from "../types";

export const planning: Architecture = {
  id: "planning",
  number: 4,
  name: "Planning",
  part: 1,
  tagline: "Plan the entire strategy, then execute step by step",
  controlFlow: "conditional",
  loopType: "iterative",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "N+2",
  keyDifferentiator: "Unlike ReAct (reactive), the planner determines all steps upfront before any action. More transparent but brittle if the environment changes mid-execution.",
  color: "#6366f1",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "planner", type: "llm", label: "Planner\nNode", x: 250, y: 110, description: "Creates a complete list of search steps before executing any" },
    { id: "executor", type: "tool", label: "Executor\nNode", x: 250, y: 240, description: "Pops one step off the plan, runs it, stores result" },
    { id: "synthesizer", type: "llm", label: "Synthesizer\nNode", x: 250, y: 370, description: "Combines all tool results into a final answer" },
    { id: "end", type: "end", label: "END", x: 250, y: 460 },
  ],
  edges: [
    { id: "e1", source: "start", target: "planner" },
    { id: "e2", source: "planner", target: "executor" },
    { id: "e3", source: "executor", target: "executor", label: "plan not empty", conditional: true },
    { id: "e4", source: "executor", target: "synthesizer", label: "plan empty", conditional: true },
    { id: "e5", source: "synthesizer", target: "end" },
  ],
  demoInput: "Find the populations of Paris, Berlin, and Rome. Sum them, then compare the total to the US population.",
  demoOutput: "Paris (2.1M) + Berlin (3.7M) + Rome (2.8M) = 8.6M. The US population is ~335M — about 39x larger than the combined population of these three European capitals.",
  executionTrace: [
    {
      activeNodeId: "planner",
      label: "Step 1 — Create full plan",
      stateSnapshot: { user_request: "Find populations of Paris, Berlin, Rome...", plan: [], intermediate_steps: [] },
      explanation: "Planner creates the complete task list upfront: ['search population of Paris', 'search population of Berlin', 'search population of Rome', 'search US population', 'calculate sum and compare']",
    },
    {
      activeNodeId: "executor",
      label: "Step 2 — Execute: Paris",
      stateSnapshot: { plan: ["search Berlin", "search Rome", "search US", "calculate"], intermediate_steps: [] },
      explanation: "Executor pops 'search population of Paris', runs TavilySearch, stores result. Plan now has 4 steps remaining.",
    },
    {
      activeNodeId: "executor",
      label: "Step 3 — Execute: Berlin",
      stateSnapshot: { plan: ["search Rome", "search US", "calculate"], intermediate_steps: [{ step: "Paris", result: "2.1M" }] },
      explanation: "Executor pops 'search population of Berlin', gets result 3.7M. Plan now has 3 steps remaining.",
    },
    {
      activeNodeId: "executor",
      label: "Step 4 — Execute: Rome + US",
      stateSnapshot: { plan: ["calculate"], intermediate_steps: [{ step: "Paris", result: "2.1M" }, { step: "Berlin", result: "3.7M" }] },
      explanation: "Two more executor loops for Rome (2.8M) and US (335M). Plan now has only the 'calculate' step remaining.",
    },
    {
      activeNodeId: "synthesizer",
      label: "Step 5 — Plan empty, synthesize",
      stateSnapshot: { plan: [], intermediate_steps: [{ Paris: "2.1M" }, { Berlin: "3.7M" }, { Rome: "2.8M" }, { US: "335M" }] },
      explanation: "All steps done. Synthesizer receives all four results and computes the final comparison answer.",
    },
  ],
  codeSnippets: {
    planner: `class Plan(BaseModel):
    steps: List[str]  # ["search population of Paris", ...]

def planner_node(state: PlanningState):
    prompt = f"Create a step-by-step plan for: {state['user_request']}"
    plan = llm.with_structured_output(Plan).invoke(prompt)
    return {"plan": plan.steps}`,
    executor: `def executor_node(state: PlanningState):
    step = state["plan"][0]  # pop first step
    # Parse tool call from step string via regex
    result = web_search(step)
    remaining_plan = state["plan"][1:]
    return {
        "plan": remaining_plan,
        "intermediate_steps": state["intermediate_steps"] + [ToolMessage(result)]
    }

def planning_router(state: PlanningState):
    return "synthesize" if not state["plan"] else "execute"`,
    synthesizer: `def synthesizer_node(state: PlanningState):
    steps_text = "\n".join(str(s) for s in state["intermediate_steps"])
    prompt = f"""Synthesize these research results:
{steps_text}
Original request: {state['user_request']}"""
    answer = llm.invoke(prompt)
    return {"final_answer": answer.content}`,
  },
};

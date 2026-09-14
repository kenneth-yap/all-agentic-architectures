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
  paradigm: "deliberative",
  conceptualInsight: "Separates 'what to do' from 'how to do it'. The planner decomposes; the executor specializes. This is the LLM equivalent of a project manager + team: the plan survives first contact because both nodes share the same plan store.",
  whenToUse: [
    { useCase: "Research with sequential dependencies", reason: "Decomposing into ordered steps reduces each step's complexity and makes progress visible." },
    { useCase: "Financial or multi-source reports", reason: "Multi-stage gather → synthesize workflows map cleanly to plan steps." },
    { useCase: "Code generation for multi-file projects", reason: "Plan defines file structure before executor generates each file — no ad-hoc decisions." },
  ],
  strengths: [
    "Full task decomposition before any execution",
    "Executor operates on smaller, well-defined steps",
    "Plan is inspectable and can be edited before running",
    "Handles sequential dependencies explicitly",
  ],
  weaknesses: [
    "Plan may not survive reality — brittle to mid-execution surprises",
    "Two LLM calls before any real work starts",
    "Over-plans simple tasks that ReAct handles in one hop",
    "No error recovery — failed steps aren't replanned",
  ],
  comparedTo: [
    { name: "ReAct", insight: "Planning creates the full step list upfront; ReAct decides the next step reactively after each observation." },
    { name: "PEV", insight: "Planning has no verification loop — a failed step is passed to the synthesizer. PEV adds a dedicated verifier that catches failures and triggers a smarter re-plan." },
  ],
  nodes: [
    { id: "start",       type: "start",     label: "START",       x: 200, y: 20 },
    { id: "planner",     type: "a2decision", label: "Planner",     x: 200, y: 160, description: "A2 (Decision): creates the complete step list before any execution starts" },
    { id: "executor",    type: "a5output",   label: "Executor",    x: 440, y: 160, description: "A5 (Output): pops one step off the plan, runs the tool, stores result; loops until plan is empty" },
    { id: "synthesizer", type: "a2decision", label: "Synthesizer", x: 200, y: 300, description: "A2 (Decision): combines all tool results into a final coherent answer" },
    { id: "end",         type: "end",        label: "END",         x: 200, y: 420 },
  ],
  edges: [
    { id: "e1", source: "start",       target: "planner" },
    { id: "e2", source: "planner",     target: "executor" },
    { id: "e3", source: "executor",    target: "executor",    label: "plan not empty", conditional: true },
    { id: "e4", source: "executor",    target: "synthesizer", label: "plan empty",     conditional: true },
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

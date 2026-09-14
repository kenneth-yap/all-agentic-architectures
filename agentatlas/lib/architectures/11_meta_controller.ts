import { Architecture } from "../types";

export const metaController: Architecture = {
  id: "meta-controller",
  number: 11,
  name: "Meta-Controller",
  part: 2,
  tagline: "One-shot intelligent dispatcher routes to the best specialist",
  controlFlow: "conditional",
  loopType: "none",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "2",
  keyDifferentiator: "Unlike Blackboard (iterative, multi-agent), Meta-Controller is a one-shot router: fires once, the chosen specialist completes the task. Purpose: dispatch, not collaboration.",
  color: "#10b981",
  paradigm: "deliberative",
  conceptualInsight: "Intelligent routing: the meta-LLM reads the task and selects the right specialist. The key insight is that different models have different cost/quality trade-offs — a simple question doesn't need a premium model. This is model routing at inference time.",
  whenToUse: [
    { useCase: "Multi-domain applications with distinct expert agents", reason: "Route legal queries to a legal specialist, code to a code specialist — reducing errors from over-generalization." },
    { useCase: "Cost optimization across model tiers", reason: "Route simple tasks to cheaper models, complex tasks to powerful ones — same architecture, different backends." },
    { useCase: "Systems with a heterogeneous pool of fine-tuned models", reason: "Each specialist was fine-tuned for a specific domain; meta-controller decides who's best fit." },
  ],
  strengths: [
    "Specialist models outperform generalists in their domain",
    "Cost optimization via intelligent routing",
    "Clear separation: meta-LLM doesn't need domain expertise",
    "Easily extensible — add specialists without changing meta-LLM logic",
  ],
  weaknesses: [
    "Meta-LLM routing quality is the single bottleneck",
    "Agent pool must be predefined — can't create specialists on demand",
    "Extra meta-LLM call overhead on every request",
    "Misrouting sends task to wrong specialist with no recovery",
  ],
  comparedTo: [
    { name: "Multi-Agent", insight: "Meta-Controller picks one specialist per task; Multi-Agent sends the task to all specialists in a sequential pipeline." },
    { name: "Blackboard", insight: "Meta-Controller dispatches once and is done; Blackboard's controller loops after each agent, re-reading shared state to decide who goes next." },
  ],
  nodes: [
    { id: "start",      type: "start",         label: "START",              x: 250, y: 20 },
    { id: "controller", type: "a4coordination", label: "Meta\nController",   x: 250, y: 150, description: "A4 (Coordination): reads the query and picks the best specialist based on task analysis" },
    { id: "generalist", type: "a2decision",     label: "Generalist\nAgent",  x: 80,  y: 300, description: "A2 (Decision): for casual conversation and general knowledge questions" },
    { id: "researcher", type: "a2decision",     label: "Researcher\nAgent",  x: 250, y: 300, description: "A2 (Decision): for current events requiring web search (Tavily)" },
    { id: "coder",      type: "a2decision",     label: "Coder\nAgent",       x: 420, y: 300, description: "A2 (Decision): for Python code generation and technical problems" },
    { id: "end",        type: "end",            label: "END",                x: 250, y: 430 },
  ],
  edges: [
    { id: "e1", source: "start",      target: "controller" },
    { id: "e2", source: "controller", target: "generalist", label: "generalist", conditional: true },
    { id: "e3", source: "controller", target: "researcher", label: "researcher", conditional: true },
    { id: "e4", source: "controller", target: "coder",      label: "coder",      conditional: true },
    { id: "e5", source: "generalist", target: "end" },
    { id: "e6", source: "researcher", target: "end" },
    { id: "e7", source: "coder",      target: "end" },
  ],
  demoInput: "Write a Python function to find all prime numbers up to n using the Sieve of Eratosthenes",
  demoOutput: "def sieve_of_eratosthenes(n):\n    is_prime = [True] * (n + 1)\n    is_prime[0] = is_prime[1] = False\n    for i in range(2, int(n**0.5) + 1):\n        if is_prime[i]:\n            for j in range(i*i, n+1, i):\n                is_prime[j] = False\n    return [i for i, v in enumerate(is_prime) if v]",
  executionTrace: [
    {
      activeNodeId: "controller",
      label: "Step 1 — Meta-Controller dispatches",
      stateSnapshot: { user_request: "Write a Python function to find primes using Sieve", next_agent_to_call: null },
      explanation: "Controller sees a coding task. Its prompt lists all three specialists with descriptions. Decision: 'coder' — the request is clearly a programming task.",
    },
    {
      activeNodeId: "coder",
      label: "Step 2 — Coder Agent handles the task",
      stateSnapshot: { next_agent_to_call: "coder", generation: null },
      explanation: "Coder Agent persona: 'You are an expert Python developer.' Writes the Sieve of Eratosthenes implementation. No loop back to controller — task is done.",
    },
  ],
  codeSnippets: {
    controller: `class ControllerDecision(BaseModel):
    next_agent: str  # "generalist" | "researcher" | "coder"
    reasoning: str

def meta_controller_node(state: MetaAgentState):
    prompt = """Route this query to the best agent:
- generalist: casual conversation, general knowledge
- researcher: current events, real-time information (has web search)
- coder: Python code, algorithms, technical problems

Query: """ + state["user_request"]
    decision = llm.with_structured_output(ControllerDecision).invoke(prompt)
    return {"next_agent_to_call": decision.next_agent}`,
    coder: `# Each specialist is a simple chain — no loop back to controller
def coder_node(state: MetaAgentState):
    prompt = f"""You are an expert Python developer.
Task: {state['user_request']}
Write clean, well-commented Python code."""
    result = llm.invoke(prompt)
    return {"generation": result.content}

# Graph: controller → (route) → specialist → END
graph.add_conditional_edges("meta_controller",
    lambda s: s["next_agent_to_call"])`,
  },
};

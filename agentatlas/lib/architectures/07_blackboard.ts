import { Architecture } from "../types";

export const blackboard: Architecture = {
  id: "blackboard",
  number: 7,
  name: "Blackboard System",
  part: 2,
  tagline: "Dynamic controller reads shared state to decide who acts next",
  controlFlow: "conditional",
  loopType: "iterative",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "N+controllers",
  keyDifferentiator: "Execution order is determined at runtime by an LLM controller reading shared state. Unlike Multi-Agent (fixed pipeline), Blackboard enables emergent, conditional workflows.",
  color: "#10b981",
  paradigm: "mas",
  conceptualInsight: "Intelligence in the routing, not the agents. Each agent is a specialist; the controller is the meta-intelligence that decides who acts based on what the blackboard currently contains. The shared blackboard is both the communication medium and the audit log.",
  a1a5Profile: {
    a1input: "Input event — analysis request with conditional routing rules",
    a2decision: "Each analyst LLM (News, Technical, Financial) reads and writes specialist reports to the shared blackboard",
    a3memory: "Blackboard — shared append-read state visible to all agents; serves as full audit log",
    a4coordination: "LLM controller reads blackboard contents and decides which agent to activate next at runtime",
    a5output: "Consolidated blackboard report — all analyst contributions appended across the session",
  },
  whenToUse: [
    { useCase: "Workflows with conditional branching on intermediate results", reason: "Controller reads shared state and routes accordingly — positive news → technical path, negative → risk path." },
    { useCase: "Auditable multi-agent decision pipelines", reason: "The full blackboard history shows exactly what each agent contributed and in what order." },
    { useCase: "Tasks where agent order shouldn't be hardcoded", reason: "Controller decides who acts next at runtime — no need to anticipate all possible execution paths upfront." },
  ],
  strengths: [
    "Dynamic routing based on intermediate results",
    "Agents are decoupled — they only read/write the blackboard",
    "Conditional logic replaces complex hardcoded pipelines",
    "Full audit trail in the blackboard",
  ],
  weaknesses: [
    "Controller is a bottleneck — LLM overhead between every agent step",
    "Harder to predict total LLM call count",
    "Blackboard can grow large in long tasks",
    "Controller can make poor routing decisions",
  ],
  comparedTo: [
    { name: "Multi-Agent", insight: "Multi-Agent has a fixed pipeline; Blackboard's controller makes runtime routing decisions based on what's already in the shared state — enabling adaptive workflows." },
    { name: "Meta-Controller", insight: "Meta-Controller dispatches once and is done; Blackboard's controller loops after each agent, re-reading the blackboard to decide who goes next." },
  ],
  nodes: [
    { id: "start",      type: "start",      label: "START",             x: 250, y: 20 },
    { id: "controller", type: "controller", label: "Controller",        x: 250, y: 150, description: "Controller LLM: reads the blackboard and decides which agent to activate next" },
    { id: "news",       type: "llm",        label: "News\nAnalyst",     x: 80,  y: 300, description: "LLM: appends news report to blackboard" },
    { id: "technical",  type: "llm",        label: "Technical\nAnalyst",x: 250, y: 300, description: "LLM: appends technical report to blackboard" },
    { id: "financial",  type: "llm",        label: "Financial\nAnalyst",x: 420, y: 300, description: "LLM: appends financial report to blackboard" },
    { id: "end",        type: "end",        label: "FINISH",            x: 250, y: 430 },
  ],
  edges: [
    { id: "e1", source: "start",      target: "controller" },
    { id: "e2", source: "controller", target: "news",      label: "route: news",      conditional: true },
    { id: "e3", source: "controller", target: "technical", label: "route: technical", conditional: true },
    { id: "e4", source: "controller", target: "financial", label: "route: financial", conditional: true },
    { id: "e5", source: "controller", target: "end",       label: "route: FINISH",    conditional: true },
    { id: "e6", source: "news",       target: "controller" },
    { id: "e7", source: "technical",  target: "controller" },
    { id: "e8", source: "financial",  target: "controller" },
  ],
  demoInput: "Analyze NVIDIA. If news sentiment is POSITIVE, proceed with technical analysis. If NEGATIVE, proceed with financial risk analysis instead.",
  demoOutput: "News sentiment: POSITIVE (AI dominance narrative). Technical Analysis: CUDA moat strong, H100 demand at capacity. Controller correctly skipped financial risk analysis based on conditional logic.",
  executionTrace: [
    {
      activeNodeId: "controller",
      label: "Step 1 — Controller reads empty blackboard",
      stateSnapshot: { blackboard: [], available_agents: ["news_analyst", "technical_analyst", "financial_analyst"], next_agent: null },
      explanation: "Controller sees an empty blackboard and the task. Decides: 'Start with news_analyst to establish sentiment before routing.'",
    },
    {
      activeNodeId: "news",
      label: "Step 2 — News Analyst runs",
      stateSnapshot: { blackboard: [], next_agent: "news_analyst" },
      explanation: "News Analyst searches NVIDIA news and appends '[NEWS] Positive sentiment: AI chip demand at record highs. H100 waitlists months long.' to the blackboard.",
    },
    {
      activeNodeId: "controller",
      label: "Step 3 — Controller reads news, makes conditional decision",
      stateSnapshot: { blackboard: ["[NEWS] Positive sentiment: AI chip demand at record highs."], next_agent: null },
      explanation: "Controller reads the news report: sentiment is POSITIVE. Per the task's conditional logic: route to technical_analyst, NOT financial_analyst. A fixed pipeline (05) would run both regardless.",
    },
    {
      activeNodeId: "technical",
      label: "Step 4 — Technical Analyst runs",
      stateSnapshot: { blackboard: ["[NEWS] Positive sentiment...", ""], next_agent: "technical_analyst" },
      explanation: "Technical Analyst appends '[TECHNICAL] CUDA moat: strong. H100/H200 supply constrained, demand uncapped. Buy signal.' to the blackboard.",
    },
    {
      activeNodeId: "controller",
      label: "Step 5 — Controller decides: FINISH",
      stateSnapshot: { blackboard: ["[NEWS] Positive...", "[TECHNICAL] CUDA moat strong..."], next_agent: null },
      explanation: "Controller reads both reports and determines the task is complete. Routes to FINISH. Financial analyst was never called — intentionally.",
    },
  ],
  codeSnippets: {
    controller: `class ControllerDecision(BaseModel):
    next_agent: str  # "news_analyst" | "technical_analyst" | "financial_analyst" | "FINISH"
    reasoning: str

def controller_node(state: BlackboardState):
    blackboard_text = "\n".join(state["blackboard"])
    prompt = f"""You are the orchestrator.
Task: {state['user_request']}
Current blackboard:\n{blackboard_text}
Available agents: {state['available_agents']}
Who should act next? Reply FINISH when done."""
    decision = llm.with_structured_output(ControllerDecision).invoke(prompt)
    return {"next_agent": decision.next_agent}

def route_to_agent(state: BlackboardState):
    return state["next_agent"]  # dynamic routing!`,
    news: `def create_blackboard_agent(name: str, persona: str):
    def agent_node(state: BlackboardState):
        result = (ChatPromptTemplate.from_messages([
            ("system", persona),
            ("human", "{request}")
        ]) | llm.bind_tools(tools)).invoke({"request": state["user_request"]})
        # Writes to shared blackboard
        return {"blackboard": state["blackboard"] + [f"[{name}] {result.content}"]}
    return agent_node`,
  },
};

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
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "controller", type: "controller", label: "Controller", x: 250, y: 110, description: "Reads the blackboard and decides which agent to activate next" },
    { id: "news", type: "llm", label: "News\nAnalyst", x: 80, y: 250, description: "Appends news report to blackboard" },
    { id: "technical", type: "llm", label: "Technical\nAnalyst", x: 250, y: 250, description: "Appends technical report to blackboard" },
    { id: "financial", type: "llm", label: "Financial\nAnalyst", x: 420, y: 250, description: "Appends financial report to blackboard" },
    { id: "end", type: "end", label: "FINISH", x: 250, y: 370 },
  ],
  edges: [
    { id: "e1", source: "start", target: "controller" },
    { id: "e2", source: "controller", target: "news", label: "route: news", conditional: true },
    { id: "e3", source: "controller", target: "technical", label: "route: technical", conditional: true },
    { id: "e4", source: "controller", target: "financial", label: "route: financial", conditional: true },
    { id: "e5", source: "controller", target: "end", label: "route: FINISH", conditional: true },
    { id: "e6", source: "news", target: "controller" },
    { id: "e7", source: "technical", target: "controller" },
    { id: "e8", source: "financial", target: "controller" },
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

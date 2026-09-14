import { Architecture } from "../types";

export const multiAgent: Architecture = {
  id: "multi-agent",
  number: 5,
  name: "Multi-Agent Systems",
  part: 2,
  tagline: "Specialized agents collaborate in a fixed pipeline",
  controlFlow: "linear",
  loopType: "none",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "4 (one per agent)",
  keyDifferentiator: "Division of labor via prompt-level specialization. Each agent has a domain-specific persona. No controller — the pipeline is hardcoded and sequential.",
  color: "#10b981",
  paradigm: "mas",
  conceptualInsight: "Parallel expertise encoded in prompts. Unlike calling one LLM four times, each agent has its own system prompt, context window, and persona. The writer synthesizes divergent specialist views that a single LLM would tend to average away.",
  whenToUse: [
    { useCase: "Tasks requiring distinct expert perspectives", reason: "Different personas surface different aspects of the same problem — news, technical, and financial lenses capture orthogonal signals." },
    { useCase: "Long-form documents with sectional ownership", reason: "Each agent owns a section; the writer aggregates without re-reading all prior sections." },
    { useCase: "Pipeline where each stage adds structured data", reason: "Each report becomes input for the next agent, reducing context dilution." },
  ],
  strengths: [
    "Each agent has a tailored context and persona",
    "Clear separation of concerns across domains",
    "Writer synthesizes conflict (not just averages)",
    "Easy to add new specialist agents to the pipeline",
  ],
  weaknesses: [
    "Fixed pipeline — agents can't respond to each other's outputs dynamically",
    "Cost scales linearly with the number of agents",
    "Orchestration logic is hardcoded, not adaptive",
    "Writer quality is the single bottleneck for output quality",
  ],
  comparedTo: [
    { name: "Blackboard", insight: "Multi-Agent has a fixed pipeline; Blackboard's controller makes runtime routing decisions based on shared state — enabling conditional workflows." },
    { name: "Ensemble", insight: "Multi-Agent runs agents sequentially (each sees prior output); Ensemble runs all agents in parallel (no cross-contamination) then synthesizes." },
  ],
  nodes: [
    { id: "start",     type: "start",     label: "START",              x: 200, y: 20 },
    { id: "news",      type: "a2decision", label: "News\nAnalyst",      x: 200, y: 155, description: "A2 (Decision): searches for and summarizes recent news coverage" },
    { id: "technical", type: "a2decision", label: "Technical\nAnalyst", x: 200, y: 275, description: "A2 (Decision): analyzes technical fundamentals, products, and competitive position" },
    { id: "financial", type: "a2decision", label: "Financial\nAnalyst", x: 200, y: 395, description: "A2 (Decision): evaluates earnings, valuation, and financial health" },
    { id: "writer",    type: "a2decision", label: "Report\nWriter",     x: 200, y: 515, description: "A2 (Decision): synthesizes all three specialist reports into a final structured document" },
    { id: "end",       type: "end",        label: "END",                x: 200, y: 625 },
  ],
  edges: [
    { id: "e1", source: "start",     target: "news" },
    { id: "e2", source: "news",      target: "technical" },
    { id: "e3", source: "technical", target: "financial" },
    { id: "e4", source: "financial", target: "writer" },
    { id: "e5", source: "writer",    target: "end" },
  ],
  demoInput: "Produce a comprehensive market analysis report on NVIDIA",
  demoOutput: "EXECUTIVE SUMMARY: NVIDIA (NVDA) — Strong Buy. News: Dominant AI chip narrative continues. Technical: H100/H200 GPU demand insatiable, CUDA moat intact. Financial: Revenue up 122% YoY, P/E elevated but justified by growth. Recommendation: Accumulate on dips.",
  executionTrace: [
    {
      activeNodeId: "news",
      label: "Step 1 — News Analyst",
      stateSnapshot: { user_request: "NVIDIA analysis", news_report: null, technical_report: null, financial_report: null },
      explanation: "News Analyst persona: 'You are a professional financial news analyst.' Searches for NVIDIA news and writes a structured news summary.",
    },
    {
      activeNodeId: "technical",
      label: "Step 2 — Technical Analyst",
      stateSnapshot: { news_report: "NVIDIA AI chips dominate headlines...", technical_report: null },
      explanation: "Technical Analyst receives the news report and independently researches NVIDIA's GPU architecture, competitive moat, and product roadmap.",
    },
    {
      activeNodeId: "financial",
      label: "Step 3 — Financial Analyst",
      stateSnapshot: { news_report: "...", technical_report: "H100/H200 demand strong...", financial_report: null },
      explanation: "Financial Analyst sees both prior reports and researches earnings, revenue growth, P/E ratio, and balance sheet metrics.",
    },
    {
      activeNodeId: "writer",
      label: "Step 4 — Report Writer synthesizes",
      stateSnapshot: { news_report: "...", technical_report: "...", financial_report: "Revenue +122% YoY..." },
      explanation: "Report Writer receives all three specialist reports and synthesizes them into a single structured investment analysis document.",
    },
  ],
  codeSnippets: {
    news: `def create_specialist_node(persona: str, output_key: str):
    """Factory that creates a specialist agent node."""
    def specialist_node(state: MultiAgentState):
        chain = (
            ChatPromptTemplate.from_messages([
                ("system", persona),
                ("human", "{user_request}")
            ])
            | llm.bind_tools(tools)
        )
        result = chain.invoke({"user_request": state["user_request"]})
        return {output_key: result.content}
    return specialist_node

news_analyst_node = create_specialist_node(
    persona="You are a professional financial news analyst...",
    output_key="news_report"
)`,
    writer: `def report_writer_node(state: MultiAgentState):
    prompt = f"""You are an expert financial editor.
Synthesize these three specialist reports:

NEWS ANALYSIS: {state['news_report']}
TECHNICAL ANALYSIS: {state['technical_report']}
FINANCIAL ANALYSIS: {state['financial_report']}"""
    result = llm.invoke(prompt)
    return {"final_report": result.content}`,
  },
};

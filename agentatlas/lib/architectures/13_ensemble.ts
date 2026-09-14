import { Architecture } from "../types";

export const ensemble: Architecture = {
  id: "ensemble",
  number: 13,
  name: "Ensemble",
  part: 2,
  tagline: "Parallel independent analysts → CIO synthesizes conflicting views",
  controlFlow: "parallel",
  loopType: "none",
  memoryType: "none",
  toolUse: true,
  llmDriven: true,
  llmCallsPerTask: "4 (3 analysts + 1 CIO)",
  keyDifferentiator: "Intentional cognitive diversity — agents are designed to disagree. Fan-out parallelism means all three analysts run simultaneously, not sequentially.",
  color: "#10b981",
  paradigm: "mas",
  conceptualInsight: "Diversity of perspective is a feature, not noise. A single LLM with the same prompt anchors on one framing. Three agents with distinct personas (bullish, value, quant) systematically explore different hypothesis spaces, then the CIO resolves the disagreement. The final answer contains both the conclusion AND the minority view.",
  whenToUse: [
    { useCase: "High-stakes decisions requiring multiple analytical lenses", reason: "A single LLM anchors on one frame; parallel agents explore divergent hypotheses simultaneously, reducing systematic bias." },
    { useCase: "Tasks where the reasoning process matters as much as the answer", reason: "The CIO synthesizes conflicting evidence — the full disagreement is surfaced, not silently resolved inside one model." },
    { useCase: "Latency-sensitive multi-perspective analysis", reason: "All three analysts run in parallel — wall time = one analyst, not three. Use when you need breadth without the latency of sequential pipelines." },
  ],
  strengths: [
    "Cognitive diversity: each agent explores different parts of the hypothesis space",
    "Parallel execution — wall time equals one agent, not three",
    "Minority views are explicitly preserved in the CIO synthesis",
    "Each analyst is independently auditable and replaceable",
  ],
  weaknesses: [
    "3x the LLM cost vs a single-agent answer",
    "CIO synthesis quality bottlenecks the whole pipeline",
    "Persona consistency: agents may drift from their assigned frame under long contexts",
    "Not useful for tasks with objectively correct answers — diversity adds noise",
  ],
  comparedTo: [
    { name: "Multi-Agent", insight: "Multi-Agent runs agents sequentially, each building on the prior; Ensemble fans out in parallel with intentionally independent, non-communicating agents." },
    { name: "Meta-Controller", insight: "Meta-Controller picks one best-fit specialist; Ensemble runs all specialists and merges their conflicting outputs." },
  ],
  a1a5Profile: {
    a1input: "Investment query — any question about a stock, sector, or portfolio decision",
    a2decision: "Three parallel specialist LLMs (Bullish, Value, Quant) each analyze independently; CIO synthesizes all outputs",
    a3memory: "None — each analyst is stateless; no shared memory between parallel runs",
    a4coordination: "Fan-out dispatcher sends task to all analysts simultaneously; CIO aggregates and synthesizes all outputs",
    a5output: "Synthesized investment recommendation with majority view, minority views, risks, and opportunities",
  },
  nodes: [
    { id: "start",    type: "start",      label: "START",           x: 250, y: 20 },
    { id: "dispatch", type: "controller", label: "Fan-Out\nDispatch",x: 250, y: 150, description: "Controller: LangGraph dispatches all three analysts simultaneously in parallel" },
    { id: "bullish",  type: "llm",        label: "Bullish\nAnalyst", x: 80,  y: 300, description: "LLM: optimistic lens — growth catalysts, upside potential" },
    { id: "value",    type: "llm",        label: "Value\nAnalyst",   x: 250, y: 300, description: "LLM: conservative lens — DCF, margin of safety, valuation" },
    { id: "quant",    type: "llm",        label: "Quant\nAnalyst",   x: 420, y: 300, description: "LLM: data lens — technical indicators, momentum, statistical signals" },
    { id: "cio",      type: "llm",        label: "CIO\nSynthesizer", x: 250, y: 450, description: "LLM: receives all three reports and synthesizes a final recommendation" },
    { id: "end",      type: "end",        label: "END",              x: 250, y: 570 },
  ],
  edges: [
    { id: "e1", source: "start",    target: "dispatch" },
    { id: "e2", source: "dispatch", target: "bullish" },
    { id: "e3", source: "dispatch", target: "value" },
    { id: "e4", source: "dispatch", target: "quant" },
    { id: "e5", source: "bullish",  target: "cio" },
    { id: "e6", source: "value",    target: "cio" },
    { id: "e7", source: "quant",    target: "cio" },
    { id: "e8", source: "cio",      target: "end" },
  ],
  demoInput: "Should we invest in NVIDIA at current prices?",
  demoOutput: "CIO Recommendation: BUY with conviction (7.5/10 confidence). Bullish: AI tailwind is structural (9/10). Value: P/E elevated but justified (5/10). Quant: momentum strong, RSI not overbought (7/10). Risks: China export restrictions, AMD competition. Opportunities: sovereign AI buildout, edge AI expansion.",
  executionTrace: [
    {
      activeNodeId: "dispatch",
      label: "Step 1 — Fan-out: all three launch simultaneously",
      stateSnapshot: { query: "Should we invest in NVIDIA?", analyses: {} },
      explanation: "LangGraph dispatches bullish_analyst, value_analyst, and quant_analyst in parallel. All three run at the same time — no waiting.",
    },
    {
      activeNodeId: "bullish",
      label: "Step 2a — Bullish Analyst (parallel)",
      stateSnapshot: { analyses: { bullish: null, value: null, quant: null } },
      explanation: "Bullish persona: 'You are an optimistic growth investor.' Writes: 'STRONG BUY. AI demand is structural, not cyclical. H100 backlog extends 18 months. Target: $1,500.' Confidence: 9/10.",
    },
    {
      activeNodeId: "value",
      label: "Step 2b — Value Analyst (parallel)",
      stateSnapshot: { analyses: { bullish: "STRONG BUY...", value: null, quant: null } },
      explanation: "Value persona: 'You are a conservative value investor.' Writes: 'HOLD. P/E of 65x is stretched. DCF fair value ~$650. Margin of safety insufficient at current levels.' Confidence: 5/10.",
    },
    {
      activeNodeId: "quant",
      label: "Step 2c — Quant Analyst (parallel)",
      stateSnapshot: { analyses: { bullish: "STRONG BUY...", value: "HOLD...", quant: null } },
      explanation: "Quant persona: 'You are a quantitative analyst.' Writes: 'HOLD/BUY. RSI 58 (not overbought). 200-day MA uptrend. Momentum score: 7.2/10. Options flow bullish.' Confidence: 7/10.",
    },
    {
      activeNodeId: "cio",
      label: "Step 3 — CIO receives all three, synthesizes",
      stateSnapshot: { analyses: { bullish: "9/10 BUY", value: "5/10 HOLD", quant: "7/10 BUY" } },
      explanation: "CIO sees disagreement (9/10 vs 5/10) and synthesizes: weighted average 7.5/10, resolves to BUY. Explicitly lists the risks (Value analyst's concerns) and opportunities (Bullish analyst's thesis).",
    },
  ],
  codeSnippets: {
    dispatch: `class EnsembleState(TypedDict):
    query: str
    analyses: Dict[str, str]  # written by each analyst
    final_recommendation: str

def create_analyst_node(persona: str, agent_name: str):
    def analyst_node(state: EnsembleState):
        chain = ChatPromptTemplate.from_messages([
            ("system", persona),
            ("human", "{query}")
        ]) | llm.bind_tools(tools)
        result = chain.invoke({"query": state["query"]})
        # Each analyst writes to its own key
        return {"analyses": {**state["analyses"], agent_name: result.content}}
    return analyst_node

# Fan-out in LangGraph: list of node names = parallel execution
graph.add_edge("start_analysis", ["bullish_analyst", "value_analyst", "quant_analyst"])`,
    cio: `class FinalRecommendation(BaseModel):
    final_recommendation: str  # "BUY" | "HOLD" | "SELL"
    confidence_score: float    # 0-10
    synthesis_summary: str
    identified_opportunities: List[str]
    identified_risks: List[str]

def cio_synthesizer_node(state: EnsembleState):
    analyses_text = "\n".join([f"{k}: {v}" for k, v in state["analyses"].items()])
    prompt = f"""As CIO, synthesize these conflicting analyses:
{analyses_text}
Provide a final investment recommendation."""
    result = llm.with_structured_output(FinalRecommendation).invoke(prompt)
    return {"final_recommendation": result.model_dump()}`,
  },
};

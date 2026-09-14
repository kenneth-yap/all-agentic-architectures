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
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "dispatch", type: "rule", label: "Fan-Out", x: 250, y: 110, description: "LangGraph dispatches all three analysts simultaneously" },
    { id: "bullish", type: "llm", label: "Bullish\nAnalyst", x: 80, y: 240, description: "Optimistic lens: finds growth catalysts and upside potential" },
    { id: "value", type: "llm", label: "Value\nAnalyst", x: 250, y: 240, description: "Conservative lens: focuses on valuation, DCF, margin of safety" },
    { id: "quant", type: "llm", label: "Quant\nAnalyst", x: 420, y: 240, description: "Data lens: technical indicators, momentum, statistical signals" },
    { id: "cio", type: "llm", label: "CIO\nSynthesizer", x: 250, y: 380, description: "Receives all three reports and synthesizes a final recommendation" },
    { id: "end", type: "end", label: "END", x: 250, y: 480 },
  ],
  edges: [
    { id: "e1", source: "start", target: "dispatch" },
    { id: "e2", source: "dispatch", target: "bullish" },
    { id: "e3", source: "dispatch", target: "value" },
    { id: "e4", source: "dispatch", target: "quant" },
    { id: "e5", source: "bullish", target: "cio" },
    { id: "e6", source: "value", target: "cio" },
    { id: "e7", source: "quant", target: "cio" },
    { id: "e8", source: "cio", target: "end" },
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

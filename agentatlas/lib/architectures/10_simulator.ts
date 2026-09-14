import { Architecture } from "../types";

export const simulator: Architecture = {
  id: "simulator",
  number: 10,
  name: "Simulator / Mental Loop",
  part: 4,
  tagline: "Fork the environment, test actions in a sandbox before committing",
  controlFlow: "linear",
  loopType: "fixed",
  memoryType: "none",
  toolUse: false,
  llmDriven: true,
  llmCallsPerTask: "3",
  keyDifferentiator: "The only architecture that forks the environment state into multiple sandbox copies. An automated risk manager evaluates simulated outcomes before any real-world action is committed.",
  color: "#ef4444",
  paradigm: "deliberative",
  conceptualInsight: "Test before you commit. Unlike Tree of Thoughts (BFS over rules), the simulation uses a stochastic model (GBM) that captures real-world uncertainty. The risk manager reads variance, not just expected value — the difference between 'average +15%' and 'worst case -30%'.",
  whenToUse: [
    { useCase: "High-stakes irreversible actions (trading, infrastructure changes)", reason: "Cost of simulation is trivial compared to cost of a wrong live action." },
    { useCase: "Risk management before LLM-proposed strategies", reason: "LLM proposes optimistically; simulator quantifies the downside distribution." },
    { useCase: "Screening options programmatically before A/B testing in production", reason: "Run 5 simulations instead of 5 live experiments." },
  ],
  strengths: [
    "Automated risk quantification before any real action",
    "Multiple simulation runs expose variance (not just expected value)",
    "Separates 'what to try' from 'whether to commit'",
    "Stochastic model captures real-world uncertainty",
  ],
  weaknesses: [
    "GBM is a simplified model — doesn't capture all market dynamics",
    "5 simulation runs may not be statistically sufficient for tail risk",
    "Risk manager interpretation still depends on LLM quality",
    "Simulation overhead adds latency on every request",
  ],
  comparedTo: [
    { name: "Dry-Run Harness", insight: "Simulator uses automated risk analysis (GBM + LLM risk manager) to make the go/no-go decision; Dry-Run inserts a human approval gate — the human's judgment, not an algorithm, makes the final call." },
    { name: "Tree of Thoughts", insight: "Tree of Thoughts uses BFS with rule validation for deterministic correctness; Simulator uses stochastic GBM for probabilistic risk assessment of open-ended decisions." },
  ],
  nodes: [
    { id: "start",   type: "start",     label: "START",            x: 200, y: 20 },
    { id: "propose", type: "a2decision", label: "Propose\nAction",  x: 200, y: 160, description: "A2 (Decision): analyst proposes a high-level trading strategy" },
    { id: "simulate",type: "a2decision", label: "Run\nSimulations", x: 440, y: 160, description: "A2 (Decision): forks real market state into 5 copies, runs 10-day GBM on each" },
    { id: "refine",  type: "a2decision", label: "Refine &\nDecide", x: 200, y: 300, description: "A2 (Decision): risk manager reads all 5 simulation outcomes, makes refined decision" },
    { id: "execute", type: "a5output",   label: "Execute\nReal World",x: 200, y: 440, description: "A5 (Output): applies the refined, risk-adjusted decision to the actual market state" },
    { id: "end",     type: "end",        label: "END",              x: 200, y: 560 },
  ],
  edges: [
    { id: "e1", source: "start",    target: "propose" },
    { id: "e2", source: "propose",  target: "simulate" },
    { id: "e3", source: "simulate", target: "refine" },
    { id: "e4", source: "refine",   target: "execute" },
    { id: "e5", source: "execute",  target: "end" },
  ],
  demoInput: "Current portfolio: 10 shares AAPL @ $180. Market trending bullish. What should we do?",
  demoOutput: "Original proposal: 'Buy aggressively — 50 more shares.' After simulation (high variance across 5 runs), risk manager refined to: 'Buy 20 shares at market open.' Capital preserved, upside captured with reduced tail risk.",
  executionTrace: [
    {
      activeNodeId: "propose",
      label: "Step 1 — Analyst proposes strategy",
      stateSnapshot: { real_market: { AAPL: { price: 180, shares: 10 } }, proposed_action: null },
      explanation: "Analyst LLM sees the bullish trend and proposes: 'BUY 50 shares of AAPL aggressively.' No risk assessment yet.",
    },
    {
      activeNodeId: "simulate",
      label: "Step 2 — Fork into 5 sandboxes",
      stateSnapshot: { proposed_action: "BUY 50 shares AAPL", simulation_results: null },
      explanation: "5 deep copies of real_market created. Each runs 10 days of Geometric Brownian Motion with random drift. Returns: [{initial: $1800, final: $2340, return: +30%}, {final: $1260, return: -30%}, ...] — high variance!",
    },
    {
      activeNodeId: "refine",
      label: "Step 3 — Risk manager reads all outcomes",
      stateSnapshot: {
        simulation_results: [
          { run: 1, return_pct: 30.2 },
          { run: 2, return_pct: -28.4 },
          { run: 3, return_pct: 12.1 },
          { run: 4, return_pct: -15.3 },
          { run: 5, return_pct: 22.7 },
        ],
      },
      explanation: "Risk manager sees high variance (worst case: -28%). Refines the aggressive proposal to: 'Buy only 20 shares — limit downside exposure while capturing most of the upside.'",
    },
    {
      activeNodeId: "execute",
      label: "Step 4 — Execute refined action in real world",
      stateSnapshot: { final_decision: "BUY 20 shares AAPL" },
      explanation: "Real market state updated: portfolio now holds 30 shares AAPL. The simulation-informed, risk-adjusted decision is committed.",
    },
  ],
  codeSnippets: {
    simulate: `class MarketSimulator(BaseModel):
    stocks: Dict[str, StockState]

    def step(self, action: str, amount: int) -> "MarketSimulator":
        """Geometric Brownian Motion: price = price * exp((μ - σ²/2)dt + σ√dt·Z)"""
        new_state = self.model_copy(deep=True)
        for symbol, stock in new_state.stocks.items():
            dt = 1/252  # one trading day
            Z = random.gauss(0, 1)
            stock.price *= math.exp((MU - SIGMA**2/2)*dt + SIGMA*math.sqrt(dt)*Z)
        return new_state

def run_simulation_node(state: AgentState):
    results = []
    for i in range(5):
        sim = state["real_market"].model_copy(deep=True)
        initial = sim.calculate_portfolio_value()
        for day in range(10):
            sim = sim.step(state["proposed_action"], 50)
        final = sim.calculate_portfolio_value()
        results.append({"run": i+1, "return_pct": (final-initial)/initial*100})
    return {"simulation_results": results}`,
    refine: `def refine_and_decide_node(state: AgentState):
    sim_text = "\n".join([f"Run {r['run']}: {r['return_pct']:.1f}%"
                           for r in state["simulation_results"]])
    prompt = f"""You are a risk manager.
Original proposal: {state['proposed_action']}
Simulation results (5 runs, 10 days each):
{sim_text}
What is your refined, risk-adjusted decision?"""
    decision = llm.invoke(prompt)
    return {"final_decision": decision.content}`,
  },
};

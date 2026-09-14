import { Architecture } from "../types";

export const episodicSemantic: Architecture = {
  id: "episodic-semantic",
  number: 8,
  name: "Episodic + Semantic Memory",
  part: 3,
  tagline: "FAISS remembers what happened; Neo4j knows facts about you",
  controlFlow: "linear",
  loopType: "none",
  memoryType: "faiss+neo4j",
  toolUse: false,
  llmDriven: true,
  llmCallsPerTask: "3 + memory ops",
  keyDifferentiator: "Dual persistent memory: episodic (conversation summaries in FAISS vector store) + semantic (structured facts in Neo4j graph). Both survive across sessions.",
  color: "#f59e0b",
  paradigm: "bdi",
  conceptualInsight: "Dual memory mimics human cognition: episodic (what happened) and semantic (what's true). FAISS finds 'similar situations'; Neo4j finds 'structural relationships'. Neither alone suffices — similarity search can't do multi-hop graph traversal, and graph queries can't surface fuzzy contextual matches.",
  whenToUse: [
    { useCase: "Long-running personal assistants", reason: "Episodic memory preserves conversation history across sessions; semantic memory preserves user facts (goals, preferences, relationships)." },
    { useCase: "Tasks requiring both contextual recall and structured facts", reason: "FAISS handles 'what was discussed'; Neo4j handles 'who is related to whom'." },
    { useCase: "User modeling and personalization systems", reason: "Build a persistent graph of user preferences, goals, and relationships that grows with each interaction." },
  ],
  strengths: [
    "Cross-session memory persistence (not just in-context)",
    "Dual retrieval: similarity (FAISS) + structure (Neo4j)",
    "Semantic memory enables multi-hop relationship queries",
    "Each turn enriches both memory stores automatically",
  ],
  weaknesses: [
    "Two external systems to maintain (FAISS + Neo4j)",
    "Significantly more complex setup than in-context memory",
    "Memory extraction quality depends on LLM accuracy",
    "Cold start: empty stores produce no context on first use",
  ],
  comparedTo: [
    { name: "Graph Memory", insight: "Episodic+Semantic uses FAISS for episodic recall + Neo4j for structured facts; Graph Memory uses Neo4j alone as the primary reasoning substrate for multi-hop traversal over pre-ingested documents." },
  ],
  nodes: [
    { id: "start",    type: "start",     label: "START",           x: 200, y: 20 },
    { id: "retrieve", type: "a3memory",   label: "Retrieve\nMemory",x: 200, y: 160, description: "A3 (Memory): queries FAISS (similarity) and Neo4j (Cypher) with the current input" },
    { id: "generate", type: "a2decision", label: "Generate\nResponse",x: 200, y: 300, description: "A2 (Decision): answers using current input + retrieved memory context" },
    { id: "update",   type: "a3memory",   label: "Update\nMemory",  x: 200, y: 440, description: "A3 (Memory): summarizes turn into FAISS; extracts entities/relations into Neo4j" },
    { id: "end",      type: "end",        label: "END",             x: 200, y: 560 },
  ],
  edges: [
    { id: "e1", source: "start",    target: "retrieve" },
    { id: "e2", source: "retrieve", target: "generate" },
    { id: "e3", source: "generate", target: "update" },
    { id: "e4", source: "update",   target: "end" },
  ],
  demoInput: "Turn 3: 'Based on my investment goals, what's a good alternative to Tesla?'",
  demoOutput: "Based on your profile — conservative risk tolerance and interest in tech — I'd suggest Microsoft (MSFT). It has a more stable revenue base than Tesla, strong cloud growth via Azure, and consistent dividends that fit your conservative approach.",
  executionTrace: [
    {
      activeNodeId: "retrieve",
      label: "Step 1 — Retrieve from both stores",
      stateSnapshot: { user_input: "Based on my goals, what's a good alternative to Tesla?", retrieved_memories: null },
      explanation: "FAISS similarity search finds past turns about Alex's investment goals. Neo4j Cypher query finds: (Alex)-[HAS_GOAL]->(Conservative Investing), (Alex)-[INTERESTED_IN]->(Tech).",
    },
    {
      activeNodeId: "generate",
      label: "Step 2 — Generate with memory context",
      stateSnapshot: {
        user_input: "Based on my goals, what's a good alternative?",
        retrieved_memories: {
          episodic: ["Turn 1: Alex mentioned conservative risk tolerance", "Turn 2: Alex interested in tech sector"],
          semantic: ["(Alex)-[HAS_GOAL]->(Conservative Investing)", "(Alex)-[INTERESTED_IN]->(Tech)"],
        },
      },
      explanation: "LLM sees the user's question PLUS the retrieved memory. It knows Alex is conservative and tech-focused, so recommends MSFT over speculative tech picks.",
    },
    {
      activeNodeId: "update",
      label: "Step 3 — Update both memory stores",
      stateSnapshot: { generation: "Based on your conservative profile, MSFT is a good fit..." },
      explanation: "Episodic: summarizes this turn into a sentence, embeds it into FAISS. Semantic: extracts (Alex)-[CONSIDERING]->(MSFT) relationship and writes it to Neo4j.",
    },
  ],
  codeSnippets: {
    retrieve: `def retrieve_memory(state: AgentState):
    # Episodic: vector similarity search
    episodic_docs = faiss_store.similarity_search(state["user_input"], k=3)

    # Semantic: structured Cypher query
    cypher = f"""MATCH (u:User {{name: 'Alex'}})-[r]->(e)
RETURN u.name, type(r), e.name"""
    semantic_facts = graph.query(cypher)

    return {"retrieved_memories": {
        "episodic": [d.page_content for d in episodic_docs],
        "semantic": semantic_facts
    }}`,
    update: `class KnowledgeGraph(BaseModel):
    relationships: List[Relationship]  # (subject, predicate, object) triples

def create_memories(state: AgentState):
    # Episodic: summarize turn into one sentence → embed → store
    summary = llm.invoke(f"Summarize in one sentence: {state['user_input']}")
    faiss_store.add_texts([summary.content])

    # Semantic: extract structured facts → write to Neo4j
    kg = llm.with_structured_output(KnowledgeGraph).invoke(
        f"Extract facts about the user from: {state['user_input']}"
    )
    graph.add_graph_documents([...kg.relationships])`,
  },
};

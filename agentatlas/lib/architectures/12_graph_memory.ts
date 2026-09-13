import { Architecture } from "../types";

export const graphMemory: Architecture = {
  id: "graph-memory",
  number: 12,
  name: "Graph / World-Model Memory",
  part: 3,
  tagline: "Text-to-Cypher: multi-hop reasoning over a knowledge graph",
  controlFlow: "linear",
  loopType: "none",
  memoryType: "neo4j",
  toolUse: false,
  llmDriven: true,
  llmCallsPerTask: "2 (Text→Cypher + Cypher→Answer)",
  keyDifferentiator: "Uses Neo4j as the primary reasoning substrate — not supplementary memory. Text-to-Cypher enables 4-hop graph traversal that standard RAG vector search cannot support.",
  color: "#f59e0b",
  nodes: [
    { id: "start", type: "start", label: "START", x: 250, y: 20 },
    { id: "ingest", type: "llm", label: "Graph\nMaker Agent", x: 250, y: 110, description: "Parses documents and writes entity-relation triples to Neo4j" },
    { id: "cypher_gen", type: "llm", label: "Cypher\nGenerator", x: 250, y: 230, description: "Translates natural language query into a Cypher graph query" },
    { id: "execute", type: "rule", label: "Execute\nCypher", x: 250, y: 340, description: "Runs the Cypher query against Neo4j, returns raw graph results" },
    { id: "synthesize", type: "llm", label: "Answer\nSynthesizer", x: 250, y: 450, description: "Converts raw Cypher results into a natural language answer" },
    { id: "end", type: "end", label: "END", x: 250, y: 540 },
  ],
  edges: [
    { id: "e1", source: "start", target: "ingest" },
    { id: "e2", source: "ingest", target: "cypher_gen" },
    { id: "e3", source: "cypher_gen", target: "execute" },
    { id: "e4", source: "execute", target: "synthesize" },
    { id: "e5", source: "synthesize", target: "end" },
  ],
  demoInput: "What companies compete with products made by the company that acquired BetaSolutions?",
  demoOutput: "Innovate Inc. competes with AlphaCorp's products. This was discovered via a 4-hop graph traversal: BetaSolutions ← ACQUIRED_BY — AlphaCorp — MAKES → AlphaCorp_Product ← COMPETES_WITH — Innovate Inc.",
  executionTrace: [
    {
      activeNodeId: "ingest",
      label: "Step 1 — Ingest documents into Neo4j",
      stateSnapshot: {
        documents: [
          "AlphaCorp acquired BetaSolutions for $50M",
          "Dr. Reed is CSO at AlphaCorp",
          "Innovate Inc. competes with AlphaCorp's product line",
        ],
      },
      explanation: "Graph Maker extracts triples: (AlphaCorp)-[ACQUIRED]->(BetaSolutions), (Dr.Reed)-[IS_CSO_AT]->(AlphaCorp), (InnovateInc)-[COMPETES_WITH]->(AlphaCorp_Product). Written to Neo4j.",
    },
    {
      activeNodeId: "cypher_gen",
      label: "Step 2 — Translate question to Cypher",
      stateSnapshot: { query: "What companies compete with products made by the company that acquired BetaSolutions?", schema: "(AlphaCorp)-[ACQUIRED]->(BetaSolutions), (AlphaCorp)-[MAKES]->(Product), (Company)-[COMPETES_WITH]->(Product)" },
      explanation: "LLM generates Cypher:\nMATCH (c)-[:ACQUIRED]->(b {name:'BetaSolutions'})\nMATCH (c)-[:MAKES]->(p)\nMATCH (comp)-[:COMPETES_WITH]->(p)\nRETURN comp.name",
    },
    {
      activeNodeId: "execute",
      label: "Step 3 — Execute Cypher on Neo4j",
      stateSnapshot: { cypher: "MATCH (c)-[:ACQUIRED]->(b {name:'BetaSolutions'})..." },
      explanation: "Neo4j traverses 4 hops: BetaSolutions → AlphaCorp → Products → Competitors. Returns: [{comp.name: 'Innovate Inc.'}]. Standard vector search would miss this multi-hop connection.",
    },
    {
      activeNodeId: "synthesize",
      label: "Step 4 — Synthesize natural language answer",
      stateSnapshot: { cypher_results: [{ "comp.name": "Innovate Inc." }] },
      explanation: "Synthesizer receives the raw Cypher result and converts it to a human-readable explanation of the 4-hop reasoning chain.",
    },
  ],
  codeSnippets: {
    ingest: `class KnowledgeGraph(BaseModel):
    relationships: List[Relationship]

graph_maker_agent = (
    ChatPromptTemplate.from_messages([
        ("system", "Extract all entities and relationships from the text."),
        ("human", "{text}")
    ])
    | llm.with_structured_output(KnowledgeGraph)
)

for doc in documents:
    kg = graph_maker_agent.invoke({"text": doc})
    graph.add_graph_documents([...kg.relationships])`,
    cypher_gen: `def query_graph(question: str) -> str:
    schema = graph.get_schema  # Neo4j schema introspection

    # Step 1: NL → Cypher
    cypher = (cypher_generation_prompt | llm).invoke({
        "schema": schema,
        "question": question
    }).content

    # Step 2: Execute
    results = graph.query(cypher)

    # Step 3: Cypher results → NL
    answer = (cypher_response_prompt | llm).invoke({
        "question": question,
        "results": results
    }).content
    return answer`,
  },
};

import { Architecture } from "../types";
import { reflection } from "./01_reflection";
import { toolUse } from "./02_tool_use";
import { react } from "./03_react";
import { planning } from "./04_planning";
import { multiAgent } from "./05_multi_agent";
import { pev } from "./06_pev";
import { blackboard } from "./07_blackboard";
import { episodicSemantic } from "./08_episodic_semantic";
import { treeOfThoughts } from "./09_tree_of_thoughts";
import { simulator } from "./10_simulator";
import { metaController } from "./11_meta_controller";
import { graphMemory } from "./12_graph_memory";
import { ensemble } from "./13_ensemble";
import { dryRun } from "./14_dry_run";
import { rlhf } from "./15_rlhf";
import { cellularAutomata } from "./16_cellular_automata";
import { metacognitive } from "./17_metacognitive";

export const architectures: Architecture[] = [
  reflection,
  toolUse,
  react,
  planning,
  multiAgent,
  pev,
  blackboard,
  episodicSemantic,
  treeOfThoughts,
  simulator,
  metaController,
  graphMemory,
  ensemble,
  dryRun,
  rlhf,
  cellularAutomata,
  metacognitive,
];

export function getArchitecture(id: string): Architecture | undefined {
  return architectures.find((a) => a.id === id);
}

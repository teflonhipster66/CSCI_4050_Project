export type DFSColor = "white" | "gray" | "black";
export type DFSGraph = Readonly<Record<string, readonly string[]>>;
export type DFSVertex = {
  color: DFSColor;
  discovery: number | null;
  finish: number | null;
  parent: string | null;
};
export type DFSState = {
  vertices: Record<string, DFSVertex>;
  /** Recursive call frames, from bottom to top. */
  stack: { id: string; neighborIndex: number }[];
  roots: string[];
  time: number;
  order: string[];
  finishOrder: string[];
  complete: boolean;
  message: string;
};

/** DFS(G), lines 1–4: initialize every vertex and the global clock. */
export function initializeDFS(graph: DFSGraph, source = Object.keys(graph)[0]): DFSState {
  const ids = Object.keys(graph);
  if (source !== undefined && !Object.hasOwn(graph, source)) throw new Error(`Unknown source: ${source}`);
  const vertices: Record<string, DFSVertex> = {};
  for (const [id, neighbors] of Object.entries(graph)) {
    for (const neighbor of neighbors) {
      if (!Object.hasOwn(graph, neighbor)) throw new Error(`Unknown neighbor: ${neighbor}`);
    }
    vertices[id] = { color: "white", discovery: null, finish: null, parent: null };
  }
  return {
    vertices, stack: [], roots: source === undefined ? [] : [source, ...ids.filter(id => id !== source)],
    time: 0, order: [], finishOrder: [], complete: ids.length === 0,
    message: "All vertices start white with d = ∞ and π = NIL. Time = 0. The stack is empty; start DFS and push source " + source + ".",
  };
}

/** One visible event: discover/push, inspect an edge, or finish/pop.
 * Frames preserve each suspended DFS-VISIT's position in its adjacency list.
 */
export function stepDFS(graph: DFSGraph, state: DFSState): DFSState {
  if (state.complete) return state;
  const stack = state.stack.map(frame => ({ ...frame }));
  const current = stack[stack.length - 1];
  let discovered: string | undefined;
  let parent: string | null = null;
  if (!current) {
    // DFS(G), lines 5–7: start a new DFS-Visit procedure for each remaining white vertex.
    discovered = state.roots.find(id => state.vertices[id].color === "white");
    if (discovered === undefined) return { ...state, complete: true, message: "DFS complete. Every vertex is finished." };
  } else {
    const neighbor = graph[current.id][current.neighborIndex];
    if (neighbor !== undefined) {
      current.neighborIndex++;
      if (state.vertices[neighbor].color !== "white") {
        return { ...state, stack, message: `Inspect ${neighbor}: ${neighbor} is already discovered; skip it.` };
      }
      discovered = neighbor;
      parent = current.id;
    } else {
      // DFS-VISIT, lines 8–10: increment time, record finish, then blacken.
      stack.pop();
      const time = state.time + 1;
      const vertices = { ...state.vertices, [current.id]: { ...state.vertices[current.id], color: "black" as const, finish: time } };
      const complete = stack.length === 0 && state.roots.every(id => vertices[id].color !== "white");
      return {
        ...state, vertices, stack, time, complete, finishOrder: [...state.finishOrder, current.id],
        message: `All neighbors of ${current.id} are checked. v.f = ${time}; color ${current.id} black and pop it.${complete ? " DFS complete." : stack.length ? ` Resume ${stack[stack.length - 1].id}.` : " Continue with the next white vertex."}`,
      };
    }
  }
  // DFS-VISIT, lines 1–3, entered after assigning the predecessor.
  const time = state.time + 1;
  return {
    ...state, time, stack: [...stack, { id: discovered, neighborIndex: 0 }],
    vertices: { ...state.vertices, [discovered]: { color: "gray", discovery: time, finish: null, parent } },
    order: [...state.order, discovered],
    message: `Discover ${discovered}: v.d = ${time}, π = ${parent ?? "NIL"}. Color it gray and push it onto the top of the stack.${parent === null ? " Start a new DFS spanning tree." : ""}`,
  };
}

export type BFSColor = "white" | "gray" | "black";
export type BFSGraph = Readonly<Record<string, readonly string[]>>;
export type BFSVertex = { color: BFSColor; distance: number; parent: string | null };
export type BFSState = {
  source: string;
  initialized: boolean;
  vertices: Record<string, BFSVertex>;
  queue: string[];
  current: string | null;
  neighborIndex: number;
  order: string[];
  complete: boolean;
  message: string;
  lines: string;
};

/** Prepare the initial view before discovering and enqueueing the source. */
export function initializeBFS(graph: BFSGraph, source: string): BFSState {
  if (!Object.hasOwn(graph, source)) throw new Error(`Unknown source: ${source}`);
  const vertices: Record<string, BFSVertex> = {};
  for (const [id, neighbors] of Object.entries(graph)) {
    for (const neighbor of neighbors) {
      if (!Object.hasOwn(graph, neighbor)) throw new Error(`Unknown neighbor: ${neighbor}`);
    }
    vertices[id] = { color: "white", distance: Infinity, parent: null };
  }
  return {
    source, initialized: false,
    vertices, queue: [], current: null, neighborIndex: 0,
    order: [], complete: false, lines: "1–4",
    message: `All vertices start white with d = ∞ and π = NIL. The queue is empty. Next, discover and enqueue source ${source}.`,
  };
}

/** One visible step: dequeue, inspect one neighbor, or finish the current vertex. */
export function stepBFS(graph: BFSGraph, state: BFSState): BFSState {
  if (state.complete) return state;
  if (!state.initialized) {
    return {
      ...state, initialized: true,
      vertices: { ...state.vertices, [state.source]: { color: "gray", distance: 0, parent: null } },
      queue: [state.source], lines: "5–9",
      message: `Source (${state.source}) is colored gray, d = 0, π = NIL. Enqueue ${state.source}: it is now at the front of the queue.`,
    };
  }
  if (state.current === null) {
    const [current, ...queue] = state.queue;
    if (current === undefined) return { ...state, complete: true, lines: "10", message: "The queue is empty. BFS is complete." };
    return {
      ...state, queue, current, neighborIndex: 0, order: [...state.order, current], lines: "10–11",
      message: `Dequeue ${current}. Inspect its neighbors in adjacency-list order.`,
    };
  }
  const current = state.current;
  const neighbor = graph[current][state.neighborIndex];
  if (neighbor !== undefined) {
    if (state.vertices[neighbor].color !== "white") {
      return { ...state, neighborIndex: state.neighborIndex + 1, lines: "12–13", message: `${neighbor} is already ${state.vertices[neighbor].color}; skip it.` };
    }
    const distance = state.vertices[current].distance + 1;
    return {
      ...state, neighborIndex: state.neighborIndex + 1,
      vertices: { ...state.vertices, [neighbor]: { color: "gray", distance, parent: current } },
      queue: [...state.queue, neighbor], lines: "12–17",
      message: `Discover ${neighbor}: color gray, d = ${distance}, π = ${current}. Enqueue ${neighbor}.`,
    };
  }
  const complete = state.queue.length === 0;
  return {
    ...state, vertices: { ...state.vertices, [current]: { ...state.vertices[current], color: "black" } },
    current: null, neighborIndex: 0, complete, lines: "18",
    message: `All neighbors of ${current} have been checked. Color ${current} black.${complete ? " The queue is empty; BFS is complete. Unreachable vertices remain white." : ""}`,
  };
}

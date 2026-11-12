"use client";

import { useMemo } from "react";
import { BaseEdge, Handle, MarkerType, Position, ReactFlow, type Edge, type EdgeProps, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type GraphNodeState = "unseen" | "visited" | "candidate" | "queued" | "active" | "sorted" | "empty" | "white" | "gray" | "black";

export type GraphVisualizerNode = {
  /** Keep IDs stable between algorithm steps, even when a heap value changes. */
  id: string;
  label: string | number;
  position: { x: number; y: number };
  state?: GraphNodeState;
  caption?: string;
};

export type GraphVisualizerEdge = {
  id: string;
  source: string;
  target: string;
  highlighted?: boolean;
  animated?: boolean;
  directed?: boolean;
  label?: string;
};

export type GraphVisualizerProps = {
  nodes: readonly GraphVisualizerNode[];
  edges: readonly GraphVisualizerEdge[];
  variant?: "graph" | "heap";
  ariaLabel?: string;
  height?: number;
  onNodeClick?: (nodeId: string) => void;
  directEdges?: boolean;
};

type DirectEdge = Edge<{ path: string }, "direct">;

function DirectGraphEdge({ id, data, style, markerEnd }: EdgeProps<DirectEdge>) {
  return <BaseEdge id={id} path={data?.path ?? ""} style={style} markerEnd={markerEnd} />;
}

const edgeTypes = { direct: DirectGraphEdge };

const stateColors: Record<GraphNodeState, { background: string; border: string }> = {
  white: { background: "#ffffff", border: "#000000" },
  gray: { background: "#808080", border: "#000000" },
  black: { background: "#000000", border: "#000000" },
  unseen: { background: "#fbfaf5", border: "#8b8e83" },
  visited: { background: "#e1e9d8", border: "#7a9168" },
  candidate: { background: "#fce4bb", border: "#df9a45" },
  queued: { background: "#e0e9f1", border: "#839db1" },
  active: { background: "#f9d5c6", border: "#df7958" },
  sorted: { background: "#d8ead7", border: "#62855f" },
  empty: { background: "#f4f0e7", border: "#aaa69c" },
};

/** Controlled renderer: pass a new snapshot to display the next algorithm step.
 * Positions are canvas coordinates in pixels. This component does not run algorithms.
 */
export default function GraphVisualizer({
  nodes,
  edges,
  variant = "graph",
  ariaLabel = "Algorithm graph visualization",
  height = 340,
  onNodeClick,
  directEdges = false,
}: GraphVisualizerProps) {
  const flowNodes = useMemo<Node[]>(() => nodes.map(node => {
    const state = node.state ?? "unseen";
    const colors = stateColors[state];
    return {
      id: node.id,
      position: node.position,
      sourcePosition: variant === "heap" ? Position.Bottom : Position.Right,
      targetPosition: variant === "heap" ? Position.Top : Position.Left,
      ariaLabel: `${node.label}, ${node.caption ?? state}`,
      data: {
        label: (
          <>
            {variant === "heap" && (
              <>
                <Handle type="source" position={Position.Bottom} id="source-left" style={{ left: "25%" }} />
                <Handle type="source" position={Position.Bottom} id="source-right" style={{ left: "75%" }} />
                <Handle type="target" position={Position.Top} id="target-left" style={{ left: "25%" }} />
                <Handle type="target" position={Position.Top} id="target-right" style={{ left: "75%" }} />
              </>
            )}
            {onNodeClick ? (
              <button type="button" className="graph-node-action nodrag nopan" aria-label={`${node.label}, ${node.caption ?? state}`}>
                <strong>{node.label}</strong><small>{node.caption ?? state}</small>
              </button>
            ) : <><strong>{node.label}</strong><small>{node.caption ?? state}</small></>}
          </>
        ),
      },
      style: {
        width: 62, height: 62, borderRadius: "50%", padding: 5,
        display: "flex", flexDirection: "column", justifyContent: "center",
        background: colors.background, color: state === "black" ? "#ffffff" : "#292b27",
        border: `2px ${state === "empty" ? "dashed" : "solid"} ${colors.border}`,
        fontFamily: "inherit",
      },
    };
  }), [nodes, variant, onNodeClick]);

  const flowEdges = useMemo<Edge[]>(() => edges.map(edge => {
    let path: string | undefined;
    if (directEdges) {
      const source = nodes.find(node => node.id === edge.source);
      const target = nodes.find(node => node.id === edge.target);
      if (source && target) {
        // Clip the center-to-center line to each circular node's border.
        const dx = target.position.x - source.position.x;
        const dy = target.position.y - source.position.y;
        const length = Math.hypot(dx, dy) || 1;
        const offsetX = dx / length * 31;
        const offsetY = dy / length * 31;
        path = `M ${source.position.x + 31 + offsetX} ${source.position.y + 31 + offsetY} L ${target.position.x + 31 - offsetX} ${target.position.y + 31 - offsetY}`;
      }
    }
    return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: variant === "heap" ? `source-${Number(edge.target) % 2 === 1 ? "left" : "right"}` : undefined,
    targetHandle: variant === "heap" ? `target-${Number(edge.target) % 2 === 1 ? "right" : "left"}` : undefined,
    label: edge.label,
    type: directEdges ? "direct" : variant === "heap" ? "straight" : "default",
    data: path ? { path } : undefined,
    animated: edge.animated ?? edge.highlighted ?? false,
    markerEnd: edge.directed ? { type: MarkerType.ArrowClosed, color: edge.highlighted ? "#df7958" : "#8b8e83" } : undefined,
    style: { stroke: edge.highlighted ? "#df7958" : "#8b8e83", strokeWidth: edge.highlighted ? 3 : 2 },
    };
  }), [edges, variant, directEdges, nodes]);

  return (
    <div className="algorithm-graph" style={{ width: "100%", height }} role="group" aria-label={ariaLabel}>
      {nodes.length === 0 ? <p className="graph-empty">Add nodes to display a graph.</p> : (
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
          minZoom={0.2}
          maxZoom={2}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          autoPanOnNodeFocus={false}
          preventScrolling={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          onNodeClick={onNodeClick ? (_, node) => onNodeClick(node.id) : undefined}
        />
      )}
    </div>
  );
}

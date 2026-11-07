"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { buildMaxHeap } from "@/algorithms/heapsort";
import GraphVisualizer, { type GraphVisualizerNode } from "@/components/graph-visualizer";
import { BoardHeader, Facts } from "@/components/study-ui";

const maxValues = 15;
const initialMaxRange = 100;
const initialValues = [92, 71, 84, 46, 63, 58, 77, 18, 32, 41];

function getLargestChildIndex(heap: readonly number[], index: number, size: number): number | null {
  const left = index * 2 + 1;
  const right = left + 1;
  if (left >= size) return null;
  return right < size && heap[right] > heap[left] ? right : left;
}

function needsSiftDown(heap: readonly number[], index: number, size: number): boolean {
  const largestChild = getLargestChildIndex(heap, index, size);
  return largestChild !== null && heap[largestChild] > heap[index];
}

function getNodePosition(index: number) {
  const level = Math.floor(Math.log2(index + 1));
  const firstIndexOnLevel = 2 ** level - 1;
  const slot = index - firstIndexOnLevel;
  const slotsOnLevel = 2 ** level;
  return {
    x: ((slot + 0.5) / slotsOnLevel) * 620 + 20,
    y: level * 82 + 38,
  };
}

export default function HeapSortPage() {
  const [heap, setHeap] = useState(() => buildMaxHeap(initialValues));
  const [heapVersion, setHeapVersion] = useState(0);
  const [n, setN] = useState(initialValues.length);
  const [range, setRange] = useState(initialMaxRange);
  const [heapSize, setHeapSize] = useState(initialValues.length);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("Build a heap or extract its maximum to begin.");
  const [autoSorting, setAutoSorting] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  const nodes = useMemo<GraphVisualizerNode[]>(() => heap.slice(0, heapSize).map((value, index) => {
    const isChildOfFocus = focusIndex !== null && (index === focusIndex * 2 + 1 || index === focusIndex * 2 + 2);
    return {
      id: String(index),
      label: value,
      position: getNodePosition(index),
      state: index === focusIndex ? "active" : isChildOfFocus ? "candidate" : "unseen",
      caption: index === focusIndex ? `compare · i=${index}` : `i=${index}`,
    };
  }), [focusIndex, heap, heapSize]);

  const edges = useMemo(() => nodes.slice(1).map(node => {
    const index = Number(node.id);
    const parentIndex = Math.floor((index - 1) / 2);
    return {
      id: `${parentIndex}-${index}`,
      source: String(parentIndex),
      target: node.id,
      highlighted: parentIndex === focusIndex,
    };
  }), [focusIndex, nodes]);

  function applyValues(values: number[]) {
    const nextHeap = buildMaxHeap(values);
    setAutoSorting(false);
    setHeap(nextHeap);
    setHeapVersion(version => version + 1);
    setN(values.length);
    setHeapSize(nextHeap.length);
    setFocusIndex(null);
    setSelectedIndex(null);
    setMessage(`Built a max heap with ${nextHeap.length} ${nextHeap.length === 1 ? "value" : "values"}.`);
  }

  function handleBuild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAutoSorting(false);
    playSelectionSound(null);
    const values = Array.from({ length: n }, () => Math.floor(Math.random() * range));
    applyValues(values);
  }

  const handleExtractMax = useCallback((fromAutoSort = false) => {
    if (autoSorting && !fromAutoSort) return;
    if (focusIndex !== null || heapSize === 0) return;

    const nextHeap = [...heap];
    const maximum = nextHeap[0];
    nextHeap[0] = nextHeap[heapSize - 1];
    nextHeap[heapSize - 1] = maximum;
    const nextSize = heapSize - 1;

    setHeap(nextHeap);
    setHeapSize(nextSize);
    setSelectedIndex(null);

    if (nextSize === 0) {
      setAutoSorting(false);
      setFocusIndex(null);
      setMessage(`All ${nextHeap.length} values are sorted.`);
    } else if (needsSiftDown(nextHeap, 0, nextSize)) {
      setFocusIndex(0);
      setMessage(`${maximum} moved to the sorted section. Click the larger child of the root.`);
    } else {
      setFocusIndex(null);
      setMessage(`${maximum} moved to the sorted section. The remaining heap is already in order.`);
    }
  }, [autoSorting, focusIndex, heap, heapSize]);

  const playSelectionSound = useCallback((correct: boolean | null) => {
    const currentContext = audioContext.current;
    const context = currentContext && currentContext.state !== "closed"
      ? currentContext
      : new AudioContext();
    audioContext.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = correct === null ? 440 : correct ? 740 : 190;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.19);
  }, []);

  const playCompletionSound = useCallback(() => {
    const currentContext = audioContext.current;
    const context = currentContext && currentContext.state !== "closed"
      ? currentContext
      : new AudioContext();
    audioContext.current = context;
    void context.resume();

    [588, 740, 880, 1175].forEach((frequency, index) => {
      const start = context.currentTime + index * 0.18;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.25);
    });
  }, []);

  const handleNodeClick = useCallback((nodeId: string, fromAutoSort = false) => {
    if (autoSorting && !fromAutoSort) return;
    const index = Number(nodeId);

    if (index === 0 && focusIndex === null) {
      if (!fromAutoSort && heapSize > 1) playSelectionSound(null);
      handleExtractMax(fromAutoSort);
      return;
    }

    setSelectedIndex(index);

    if (focusIndex === null) {
      if (!fromAutoSort) playSelectionSound(null);
      const parent = index === 0 ? null : Math.floor((index - 1) / 2);
      setMessage(parent === null
        ? `Root value: ${heap[index]}. Extract the maximum to continue sorting.`
        : `Index ${index} has value ${heap[index]}; its parent at index ${parent} is ${heap[parent]}.`);
      return;
    }

    const largestChild = getLargestChildIndex(heap, focusIndex, heapSize);
    const correctChoice = largestChild !== null && index === largestChild;
    if (!fromAutoSort) playSelectionSound(correctChoice);

    if (largestChild === null) {
      setFocusIndex(null);
      setMessage("This node has no children. The max-heap property is restored.");
      return;
    }

    const left = focusIndex * 2 + 1;
    const right = left + 1;
    if (index !== left && index !== right) {
      setMessage(`That node is not a child of index ${focusIndex}. Choose its larger child.`);
      return;
    }

    if (index !== largestChild) {
      setMessage(`Index ${largestChild} has the larger child value (${heap[largestChild]}). Choose that node.`);
      return;
    }

    if (heap[largestChild] <= heap[focusIndex]) {
      setFocusIndex(null);
      setMessage("The parent is already larger than its children. The max-heap property is restored.");
      return;
    }

    const nextHeap = [...heap];
    const movedUp = heap[largestChild];
    const movedDown = heap[focusIndex];
    [nextHeap[focusIndex], nextHeap[largestChild]] = [nextHeap[largestChild], nextHeap[focusIndex]];
    setHeap(nextHeap);

    const swapMessage = `${movedUp} moved up to index ${focusIndex}, and ${movedDown} moved down to index ${largestChild}.`;
    if (needsSiftDown(nextHeap, largestChild, heapSize)) {
      setFocusIndex(largestChild);
      setMessage(`${swapMessage} Now compare its children.`);
    } else {
      setFocusIndex(null);
      setMessage(`${swapMessage} The max-heap property is restored.`);
    }
  }, [autoSorting, focusIndex, handleExtractMax, heap, heapSize, playSelectionSound]);

  const complete = heapSize === 0;
  const completedExtractions = complete ? heap.length : heap.length - heapSize;
  const instruction = focusIndex !== null
    ? `Choose the larger child of index ${focusIndex}.`
    : complete
      ? "The heap is sorted. Build or randomize another heap to try again."
      : "Extract the maximum, then sift the replacement down by choosing the larger child.";

  useEffect(() => {
    if (!autoSorting || complete) return;

    const timer = window.setTimeout(() => {
      if (focusIndex === null) {
        handleExtractMax(true);
        return;
      }

      const childIndex = getLargestChildIndex(heap, focusIndex, heapSize);
      if (childIndex !== null) {
        handleNodeClick(String(childIndex), true);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [autoSorting, complete, focusIndex, handleExtractMax, handleNodeClick, heap, heapSize]);

  useEffect(() => {
    if (complete) playCompletionSound();
  }, [complete, playCompletionSound]);

  useEffect(() => () => {
    const context = audioContext.current;
    audioContext.current = null;
    if (context && context.state !== "closed") void context.close();
  }, []);

  return (
    <div className="page-grid">
      <section className="heap-board board-heap">
        <div className="tape tape-left" />
        <BoardHeader
          step="HEAP SORT"
          title={complete ? "Heap sorted!" : focusIndex === null ? "Extract the maximum" : "Which child moves up?"}
          progress={`${completedExtractions}/${heap.length}`}
        />
        <div className="instruction-note">
          <span className="note-arrow">↳</span>
          <p>{instruction}</p>
        </div>

        <form className="heap-input" onSubmit={handleBuild}>
          <strong>Random heap settings</strong>
          <div className="heap-input-row" style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: "1rem" }}>
            <div>
              <label htmlFor="heap-size-slider" style={{ display: "block", justifySelf: "center" }}>n: {n}</label>
              <input
                id="heap-size-slider"
                className="heap-range-slider"
                type="range"
                min={1}
                max={maxValues}
                step={1}
                value={n}
                disabled={autoSorting}
                onChange={(event) => setN(Number(event.target.value))}
              />
            </div>
            <div>
              <label htmlFor="max-range-slider" className="form-label" style={{ display: "block", justifySelf: "center" }}>
                Max value: {`(${range})`}
              </label>
              <input
                id="max-range-slider"
                className="heap-range-slider"
                type="range"
                min={1}
                max={999}
                step={1}
                value={range}
                disabled={autoSorting}
                onChange={(event) => setRange(Number(event.target.value))}
              />
            </div>
            <div className="heap-controls-actions" style={{ display: "flex", justifyContent: "space-around", gap: "1rem" }}>
              <button type="submit" className="heap-control-button primary-control" disabled={autoSorting}>Build heap</button>
            </div>
          </div>
          <small id="heap-input-help" className="heap-input-help">
            Choose the number of values and maximum value, then build a random max heap.
          </small>
        </form>

        {complete ? (
          <p className="heap-complete-message" role="status">Every value is in sorted order below.</p>
        ) : (
          <GraphVisualizer
            key={heapVersion}
            variant="heap"
            ariaLabel="Interactive binary max heap diagram"
            height={Math.max(300, (Math.floor(Math.log2(Math.max(heapSize, 1))) + 1) * 82 + 50)}
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
          />
        )}
        <p className="heap-feedback" aria-live="polite">{message}</p>

        <div className="heap-step-controls">
          <span>{complete ? "Sort complete" : focusIndex === null ? "Heap ready" : `Sifting down from index ${focusIndex}`}</span>
          <div className="heap-step-actions">
            <button
              type="button"
              className="heap-control-button"
              aria-pressed={autoSorting}
              onClick={() => {
                playSelectionSound(null);
                setAutoSorting(running => !running);
              }}
              disabled={complete}
            >
              {autoSorting ? "Stop auto sort" : "Auto sort"}
            </button>
            <button
              type="button"
              className="heap-control-button primary-control"
              onClick={() => {
                if (heapSize > 1) playSelectionSound(null);
                handleExtractMax();
              }}
              disabled={autoSorting || focusIndex !== null || heapSize === 0}
            >
              {complete ? "Sorted" : "Extract max"}
            </button>
          </div>
        </div>

        <div className={`array-strip${complete ? " heap-complete" : ""}`}>
          <div className="array-label"><span>{complete ? "sorted!" : "same heap,"}</span><strong>{complete ? "ascending order" : "as an array"}</strong></div>
          <div className="array-values" style={{ gridTemplateColumns: `repeat(${heap.length}, minmax(0, 1fr))` }}>
            {heap.map((value, index) => (
              <div
                key={index}
                style={{ animationDelay: complete ? `${index * 55}ms` : undefined }}
                className={[
                  index >= heapSize ? "array-sorted" : "",
                  index === focusIndex ? "array-active" : "",
                  index === selectedIndex ? "array-selected" : "",
                ].filter(Boolean).join(" ")}
              >
                <strong>{value}</strong><small>{index}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Facts topic="heap" />
    </div>
  );
}

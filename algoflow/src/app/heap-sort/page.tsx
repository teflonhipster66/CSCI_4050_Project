import GraphVisualizer from "@/components/graph-visualizer";
import { BoardHeader, Facts } from "@/components/study-ui";

const heap = [92, 71, 84, 46, 63, 58, 77, 18, 32, 41];
const heapPositions = [[50, 8], [27, 31], [73, 31], [14, 56], [39, 56], [61, 56], [86, 56], [7, 82], [21, 82], [33, 82]];
export default function HeapSortPage() {
  return (
    <div className="page-grid">
      <section className="heap-board board-heap"><div className="tape tape-left" />
      <BoardHeader step="STEP 2 OF 7" title="Which node moves up?" progress="2/7" />
      <div className="instruction-note"><span className="note-arrow">↳</span><p>The root has been removed. Compare the two children and choose the larger one.</p></div>
      <GraphVisualizer
        variant="heap"
        ariaLabel="Binary max heap diagram"
        nodes={heap.map((value, index) => ({
          id: String(index),
          label: index === 0 ? "?" : value,
          position: { x: heapPositions[index][0] * 7, y: heapPositions[index][1] * 4 },
          state: index === 0 ? "empty" : index === 2 ? "candidate" : "unseen",
          caption: index === 0 ? "root" : `i=${index}`,
        }))}
        edges={heap.slice(1).map((_, index) => ({
          id: `${Math.floor(index / 2)}-${index + 1}`,
          source: String(Math.floor(index / 2)),
          target: String(index + 1),
        }))}
      />
      <div className="array-strip">
        <div className="array-label"><span>same heap,</span><strong>as an array</strong></div>
        <div className="array-values">{heap.map((value, index) => <div key={index} className={index === 0 ? "array-empty" : index === 2 ? "array-candidate" : ""}><strong>{index === 0 ? "—" : value}</strong><small>{index}</small></div>)}</div>
      </div>
      </section>
      <Facts topic="heap" />
    </div>
  );
}


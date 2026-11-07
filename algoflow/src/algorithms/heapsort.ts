export function buildMaxHeap(values: readonly number[]): number[] {
  const heap = [...values];

  function siftDown(index: number, size: number) {
    let parent = index;

    while (parent * 2 + 1 < size) {
      const left = parent * 2 + 1;
      const right = left + 1;
      const largerChild = right < size && heap[right] > heap[left] ? right : left;

      if (heap[parent] >= heap[largerChild]) return;

      [heap[parent], heap[largerChild]] = [heap[largerChild], heap[parent]];
      parent = largerChild;
    }
  }

  for (let index = Math.floor(heap.length / 2) - 1; index >= 0; index -= 1) {
    siftDown(index, heap.length);
  }

  return heap;
}
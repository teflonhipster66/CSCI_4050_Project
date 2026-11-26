export type KnapsackItem = {
  weight: number;
  value: number;
};

export function randomizeKnapsackItems(itemCount: number, maxValue: number): KnapsackItem[] {
  return Array.from({ length: itemCount }, () => ({
    weight: Math.floor(Math.random() * (maxValue + 1)),
    value: Math.floor(Math.random() * (maxValue + 1)),
  }));
}

export function solveNextKnapsackCell(
  items: readonly KnapsackItem[],
  capacity: number,
  solvedValues: number[],
): number[] {
  const rowWidth = capacity + 1;
  const cell = solvedValues.length;
  const row = Math.floor(cell / rowWidth);
  const item = items[row];
  if (!item) return solvedValues;

  const maxWeight = cell % rowWidth;
  // The implicit row for zero items contains only zeros.
  const skip = row === 0 ? 0 : solvedValues[cell - rowWidth];
  if (item.weight > maxWeight) return [...solvedValues, skip];

  const leftover = row === 0 ? 0 : solvedValues[cell - rowWidth - item.weight];
  return [...solvedValues, Math.max(skip, item.value + leftover)];
}

export function getKnapsackSelectionValues(solvedValues: readonly number[], capacity: number): (0 | 1)[] {
  const rowWidth = capacity + 1;

  return solvedValues.map((best, cell) => {
    const skip = cell < rowWidth ? 0 : solvedValues[cell - rowWidth];
    // The current item is selected only if taking it beats skipping it.
    return best > skip ? 1 : 0;
  });
}

type KnapsackSelectionStep = {
  itemIndex: number;
  capacity: number;
  selected: 0 | 1;
  remainingCapacity: number;
};

export function traceKnapsackSelection(
  items: readonly KnapsackItem[],
  capacity: number,
  selectionValues: readonly (0 | 1)[],
): KnapsackSelectionStep[] {
  const rowWidth = capacity + 1;
  if (selectionValues.length !== items.length * rowWidth) return [];

  const steps: KnapsackSelectionStep[] = [];
  let remainingCapacity = capacity;
  for (let itemIndex = items.length - 1; itemIndex >= 0; itemIndex--) {
    const currentCapacity = remainingCapacity;
    const selected = selectionValues[itemIndex * rowWidth + currentCapacity];
    if (selected === 1) remainingCapacity -= items[itemIndex].weight;
    steps.push({ itemIndex, capacity: currentCapacity, selected, remainingCapacity });
  }
  return steps;
}

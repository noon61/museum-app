const WIDTH = 760;
const HEIGHT = 390;
const PAD = { top: 32, right: 34, bottom: 58, left: 82 };

export function getPointPosition(graph, pointId) {
  const index = graph.values.findIndex((point) => point.id === pointId);
  const max = Math.max(...graph.values.map((point) => point.value)) * 1.12;
  const x = PAD.left + (index / Math.max(graph.values.length - 1, 1)) * (WIDTH - PAD.left - PAD.right);
  const point = graph.values[index];
  const y = PAD.top + (1 - point.value / max) * (HEIGHT - PAD.top - PAD.bottom);
  return { x, y };
}

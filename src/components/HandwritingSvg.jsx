export default function HandwritingSvg({ strokes = [], color = "#ef6f73", className = "" }) {
  return (
    <svg className={className} viewBox="0 0 400 180" role="img" aria-label="手書きされた気づき">
      {strokes.map((stroke, strokeIndex) => (
        <polyline
          key={`${strokeIndex}-${stroke.points?.length || 0}`}
          points={(stroke.points || []).map((point) => `${point.x * 400},${point.y * 180}`).join(" ")}
          fill="none"
          stroke={stroke.color || color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

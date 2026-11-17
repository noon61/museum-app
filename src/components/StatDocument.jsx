import HandwritingSvg from "./HandwritingSvg";

export default function StatDocument({ page, marks = [], selectedPoint, onSelect, className = "" }) {
  const choosePosition = (event) => {
    if (!onSelect) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const isRotated = Boolean(event.currentTarget.closest(".book-spread.rotated-90"));
    const screenX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const screenY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    onSelect({
      // 見開き全体を時計回りに90度回している場合は、画面座標を
      // 元画像の座標へ戻してから保存する。
      x: isRotated ? screenY : screenX,
      y: isRotated ? 1 - screenX : screenY,
    });
  };

  return (
    <div className={`stat-document ${onSelect ? "selectable" : ""} ${className}`} onClick={choosePosition}>
      <img src={page.image} alt={`${page.label} ${page.page}ページ`} draggable="false" />
      <div className="document-mark-layer">
        {marks.map((mark) => (
          <div
            key={mark.id}
            className={`document-mark${mark.x > 0.7 ? " edge-right" : ""}${mark.y < 0.12 ? " edge-top" : ""}${mark.y > 0.82 ? " edge-bottom" : ""}`}
            style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%`, "--mark-color": mark.personaColor || "#ef6f73" }}
          >
            <i />
            {mark.inputType === "keyboard" ? <p>{mark.text}</p> : <HandwritingSvg strokes={mark.strokes} color={mark.personaColor} />}
          </div>
        ))}
        {selectedPoint && (
          <div className="document-mark selected" style={{ left: `${selectedPoint.x * 100}%`, top: `${selectedPoint.y * 100}%`, "--mark-color": "var(--persona-color, #ef6f73)" }}>
            <i />
          </div>
        )}
      </div>
    </div>
  );
}

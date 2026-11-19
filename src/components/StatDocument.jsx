import HandwritingSvg from "./HandwritingSvg";

function combineReactionMarks(marks) {
  const regularMarks = marks.filter((mark) => mark.inputType !== "reaction");
  const groups = [];

  marks.filter((mark) => mark.inputType === "reaction").forEach((mark) => {
    const group = groups.find((item) => item.reaction === mark.reaction && Math.abs(item.x - mark.x) <= 0.045 && Math.abs(item.y - mark.y) <= 0.045);
    if (!group) {
      groups.push({ ...mark, count: 1 });
      return;
    }
    group.x = (group.x * group.count + mark.x) / (group.count + 1);
    group.y = (group.y * group.count + mark.y) / (group.count + 1);
    group.count += 1;
  });

  return [...regularMarks, ...groups];
}

function combineNearbyMarks(marks) {
  const groups = [];
  marks.forEach((mark) => {
    const group = groups.find((item) => Math.abs(item.x - mark.x) <= 0.045 && Math.abs(item.y - mark.y) <= 0.045);
    if (!group) {
      groups.push({ id: `group-${mark.id}`, x: mark.x, y: mark.y, items: [mark] });
      return;
    }
    group.x = (group.x * group.items.length + mark.x) / (group.items.length + 1);
    group.y = (group.y * group.items.length + mark.y) / (group.items.length + 1);
    group.items.push(mark);
  });
  return groups;
}

export default function StatDocument({ page, marks = [], selectedPoint, onSelect, onMarkSelect, compactMarks = false, className = "" }) {
  const displayMarks = combineReactionMarks(marks);
  const nearbyMarkGroups = combineNearbyMarks(marks);
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
        {compactMarks ? nearbyMarkGroups.map((group) => {
          const reactions = group.items.filter((item) => item.inputType === "reaction");
          const sameReaction = reactions.length === group.items.length && reactions.every((item) => item.reaction === reactions[0]?.reaction);
          return <button
            type="button"
            key={group.id}
            className="document-mark compact-document-mark"
            aria-label={`${group.items.length}件の付箋を見る`}
            style={{ left: `${group.x * 100}%`, top: `${group.y * 100}%`, "--mark-color": group.items[0]?.personaColor || "#ef6f73" }}
            onClick={(event) => { event.stopPropagation(); onMarkSelect?.(group.items); }}
          >
            <i />
            {sameReaction && <span className="compact-reaction-symbol">{reactions[0].reaction}</span>}
            {group.items.length > 1 && <b className="compact-mark-count">{group.items.length}</b>}
          </button>;
        }) : displayMarks.map((mark) => (
          <div
            key={mark.id}
            className={`document-mark${mark.x > 0.7 ? " edge-right" : ""}${mark.y < 0.12 ? " edge-top" : ""}${mark.y > 0.82 ? " edge-bottom" : ""}`}
            style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%`, "--mark-color": mark.personaColor || "#ef6f73" }}
          >
            <i />
            {mark.inputType === "reaction" ? <span className="reaction-mark-badge"><b>{mark.reaction}</b>{mark.count > 1 && <em>{mark.count}</em>}</span> : mark.inputType === "keyboard" ? <p>{mark.text}</p> : <HandwritingSvg strokes={mark.strokes} color={mark.personaColor} />}
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

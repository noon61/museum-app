import raw1136 from "../data/csv/education-1136.csv?raw";
import raw1137 from "../data/csv/education-1137.csv?raw";
import HandwritingSvg from "./HandwritingSvg";

const METRICS = [
  "年度",
  "学齢児童・計", "学齢児童・男", "学齢児童・女",
  "就学児童・計", "就学児童・男", "就学児童・女",
  "不就学児童・計", "不就学児童・男", "不就学児童・女",
  "就学率・全体", "就学率・男", "就学率・女",
  "全道就学率・男", "全道就学率・女",
];

const parseCsv = (source) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += character;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
};

const toHalfWidth = (value) => value.replace(/[０-９]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0xfee0));
const cleanValue = (value) => {
  const normalized = toHalfWidth(String(value || "").trim()).replace(/，/g, ",").replace(/､/g, ".");
  if (!normalized || /[●■φ襴僵慟啣吩畸聆奉申]/.test(normalized)) return "…";
  if (/^[nｎ][0-9]+$/i.test(normalized)) return "…";
  if (/^\d{1,3}(,\d{3})*(\.\d+)?$/.test(normalized) || /^\d+(\.\d+)?$/.test(normalized)) return normalized;
  return "…";
};

const cleanYear = (value) => toHalfWidth(String(value || "").trim()).replace(/\s/g, "");

const buildRows = (pageIndex) => {
  const sourceRows = parseCsv(pageIndex === 0 ? raw1136 : raw1137);
  const offset = pageIndex === 0 ? 2 : 1;
  return sourceRows
    .filter((row) => /^(明治|大正|昭和|[0-9０-９])/.test(String(row[offset] || "").trim()))
    .map((row) => {
      const values = row.slice(offset, offset + 15);
      return [cleanYear(values[0]), ...values.slice(1).map(cleanValue)];
    });
};

export default function EducationCsvTable({ pageIndex = 0, marks = [], selectedPoint, onSelect, className = "" }) {
  const rows = buildRows(pageIndex);
  const pageId = pageIndex === 0 ? "p1136" : "p1137";
  const marksByCell = Object.fromEntries(marks.filter((mark) => mark.cellId).map((mark) => [mark.cellId, mark]));

  return <div className={`education-csv ${className}`}>
    <header><p>III / 社会・教育</p><h2>学齢児童数・就学児童数・就学率</h2><span>p.{pageIndex === 0 ? 1136 : 1137}</span></header>
    <div className="education-csv-scroll">
      <table>
        <thead>
          <tr><th rowSpan="2">年度</th><th colSpan="3">学齢児童</th><th colSpan="3">就学児童</th><th colSpan="3">不就学児童</th><th colSpan="3">就学率</th><th colSpan="2">全道の就学率</th></tr>
          <tr><th>計</th><th>男</th><th>女</th><th>計</th><th>男</th><th>女</th><th>計</th><th>男</th><th>女</th><th>全体</th><th>男</th><th>女</th><th>男</th><th>女</th></tr>
        </thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={`${pageId}-${rowIndex}`}>
          {row.map((value, columnIndex) => {
            const cellId = `${pageId}-${rowIndex}-${columnIndex}`;
            const mark = marksByCell[cellId];
            const selectable = columnIndex > 0 && value !== "…";
            return <td key={cellId} className={`${selectedPoint?.cellId === cellId ? "selected" : ""} ${mark ? "marked" : ""}`}>
              <button disabled={!selectable || !onSelect} onClick={() => onSelect?.({ cellId, pageId, pageNumber: pageIndex === 0 ? 1136 : 1137, rowIndex, columnIndex, year: row[0], metric: METRICS[columnIndex], value })}>{value}</button>
              {mark && <div className="csv-cell-mark" style={{ "--mark-color": mark.personaColor }}><i />{mark.inputType === "keyboard" ? <p>{mark.text}</p> : <HandwritingSvg strokes={mark.strokes} color={mark.personaColor} />}</div>}
            </td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

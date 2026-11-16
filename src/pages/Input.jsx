import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import PressureCanvas from "../components/PressureCanvas";

const COLORS = ["#ffffff", "#67e8f9", "#f9a8d4", "#fde047", "#a7f3d0"];

export default function Input() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [pressure, setPressure] = useState(0);
  const [sending, setSending] = useState(false);
  const question = location.state?.question || "「データ」と聞いて最初に思い浮かぶ言葉は？";

  const sendData = async () => {
    if (canvasRef.current.isEmpty()) {
      alert("キャンバスに何か描いてください");
      return;
    }

    setSending(true);
    try {
      const strokes = canvasRef.current.exportStrokes();
      const points = strokes.flatMap((stroke) => stroke.points);
      const averagePressure = points.reduce((sum, point) => sum + point.pressure, 0) / points.length;

      await addDoc(collection(db, "answers"), {
        image: canvasRef.current.exportImage(),
        strokes,
        dominantColor: color,
        averagePressure,
        question,
        createdAt: serverTimestamp(),
      });

      canvasRef.current.clearCanvas();
      alert("ありがとうございました！\nあなたの線から光が生まれました。");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("送信に失敗しました。通信状態を確認してください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="input-page">
      <section className="input-panel">
        <p className="eyebrow">問い</p>
        <h1>{question}</h1>

        <div className="drawing-wrap">
          <PressureCanvas ref={canvasRef} color={color} onPressureChange={setPressure} />
          <div className="pressure-meter" aria-label={`筆圧 ${Math.round(pressure * 100)}%`}>
            <span style={{ width: `${pressure * 100}%`, background: color }} />
          </div>
        </div>

        <div className="palette" aria-label="線の色を選択">
          {COLORS.map((item) => (
            <button
              key={item}
              type="button"
              className={item === color ? "color-button selected" : "color-button"}
              style={{ background: item }}
              aria-label={`線の色 ${item}`}
              onClick={() => setColor(item)}
            />
          ))}
        </div>

        <div className="input-actions">
          <button type="button" onClick={() => navigate("/")}>← 戻る</button>
          <button type="button" onClick={() => canvasRef.current.clearCanvas()}>消す</button>
          <button type="button" className="send-button" onClick={sendData} disabled={sending}>
            {sending ? "送信中…" : "光にする →"}
          </button>
        </div>
      </section>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import PressureCanvas from "../components/PressureCanvas";
import { getPersona } from "../data/exhibition";
import { getStatDocument } from "../data/statistics";

export default function MarkPad() {
  const canvasRef = useRef(null);
  const lastTargetIdRef = useRef(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [inputType, setInputType] = useState("handwriting");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => onSnapshot(doc(db, "exhibition", "state"), (snapshot) => {
    const target = snapshot.data()?.selectedTarget || null;
    setSelectedTarget(target);
    if (target?.id && target.id !== lastTargetIdRef.current) {
      lastTargetIdRef.current = target.id;
      setText("");
      setSent(false);
      canvasRef.current?.clearCanvas();
    }
  }, (error) => console.error("選択位置の受信エラー", error)), []);

  const sendMark = async () => {
    const hasContent = inputType === "keyboard" ? text.trim() : !canvasRef.current?.isEmpty();
    if (!selectedTarget) {
      alert("タッチパネルで、付箋を置く場所を選んでください。");
      return;
    }
    if (!hasContent) {
      alert(inputType === "keyboard" ? "文字を入力してください。" : "何か書いてください。");
      return;
    }

    const documentData = getStatDocument(selectedTarget.documentId);
    const persona = getPersona(documentData.personaId);
    setSending(true);
    try {
      await addDoc(collection(db, "annotations"), {
        kind: "document-mark",
        inputType,
        documentId: documentData.id,
        documentTitle: documentData.title,
        pageId: selectedTarget.pageId,
        pageNumber: selectedTarget.pageNumber,
        viewMode: "original",
        x: selectedTarget.x,
        y: selectedTarget.y,
        text: inputType === "keyboard" ? text.trim() : "",
        strokes: inputType === "handwriting" ? canvasRef.current.exportStrokes() : [],
        personaId: persona.id,
        personaRole: persona.role,
        personaColor: persona.color,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "exhibition", "state"), {
        selectedTarget: null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      canvasRef.current?.clearCanvas();
      setText("");
      setSent(true);
    } catch (error) {
      console.error(error);
      alert("付箋を送れませんでした。通信状態を確認してください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="ipad-input-only">
      <section className="ipad-input-card">
        {sent ? <div className="ipad-input-message"><strong>付箋を送りました</strong><p>タッチパネルで次の場所を選んでください。</p></div> : !selectedTarget ? <div className="ipad-input-message waiting"><strong>タッチパネルで<br />場所を選んでください</strong></div> : <div className="ipad-input-form">
          <p className="ipad-input-prompt">気づきを記入してください</p>
          <div className="input-type-tabs"><button className={inputType === "handwriting" ? "active" : ""} onClick={() => setInputType("handwriting")}>手書き</button><button className={inputType === "keyboard" ? "active" : ""} onClick={() => setInputType("keyboard")}>キーボード</button></div>
          {inputType === "handwriting" ? <div className="ipad-writing-canvas"><PressureCanvas ref={canvasRef} color="#28446E" onPressureChange={() => {}} /></div> : <textarea className="ipad-keyboard-input" value={text} maxLength={60} autoFocus aria-label="付箋の入力欄" placeholder="文字を入力してください" onChange={(event) => setText(event.target.value)} />}
          <div className="ipad-input-actions"><button type="button" onClick={() => { canvasRef.current?.clearCanvas(); setText(""); }}>書き直す</button><button type="button" className="send" disabled={sending} onClick={sendMark}>{sending ? "送信中…" : "付箋を送る"}</button></div>
        </div>}
      </section>
    </main>
  );
}

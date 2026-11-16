import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import PressureCanvas from "../components/PressureCanvas";
import StatDocument from "../components/StatDocument";
import { getPersona, PERSONAS } from "../data/exhibition";
import { getStatDocument, STAT_DOCUMENTS } from "../data/statistics";

export default function MarkPad() {
  const canvasRef = useRef(null);
  const [documentId, setDocumentId] = useState(STAT_DOCUMENTS[0].id);
  const [personaId, setPersonaId] = useState("p001");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [inputType, setInputType] = useState("handwriting");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [rotation, setRotation] = useState(0);
  const documentData = getStatDocument(documentId);
  const pageNumbers = documentData.pages.map((item) => item.page).join("–");
  const persona = getPersona(personaId);
  const personaList = useMemo(() => Object.values(PERSONAS), []);

  useEffect(() => onSnapshot(doc(db, "exhibition", "state"), (snapshot) => {
    const data = snapshot.data();
    if (data?.currentDocumentId) {
      setDocumentId(data.currentDocumentId);
      setPersonaId(getStatDocument(data.currentDocumentId).personaId);
      setSelectedPoint(null);
      setSent(false);
    }
  }, (error) => console.error("表示状態エラー", error)), []);

  const selectPoint = (point) => {
    setSelectedPoint(point);
    setSent(false);
    setText("");
    window.setTimeout(() => document.querySelector(".mark-writing")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  const choosePersona = async (nextPersonaId) => {
    const nextDocument = STAT_DOCUMENTS.find((item) => item.personaId === nextPersonaId);
    setPersonaId(nextPersonaId);
    if (!nextDocument || nextDocument.id === documentId) return;
    setDocumentId(nextDocument.id);
    setSelectedPoint(null);
    setSent(false);
    try {
      await setDoc(doc(db, "exhibition", "state"), {
        currentDocumentId: nextDocument.id,
        currentPageIndex: 0,
        currentViewMode: "original",
        currentRotation: 0,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("統計表の切り替えエラー", error);
      alert("統計表を切り替えられませんでした。通信状態を確認してください。");
    }
  };

  const sendMark = async () => {
    const hasContent = inputType === "keyboard" ? text.trim() : !canvasRef.current?.isEmpty();
    if (!selectedPoint || !hasContent) {
      alert(inputType === "keyboard" ? "付箋に文字を入力してください。" : "付箋に何か書いてください。");
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "annotations"), {
        kind: "document-mark",
        inputType,
        documentId: documentData.id,
        documentTitle: documentData.title,
        pageId: selectedPoint.pageId,
        pageNumber: selectedPoint.pageNumber,
        viewMode: "original",
        x: selectedPoint.x,
        y: selectedPoint.y,
        text: inputType === "keyboard" ? text.trim() : "",
        strokes: inputType === "handwriting" ? canvasRef.current.exportStrokes() : [],
        personaId: persona.id,
        personaRole: persona.role,
        personaColor: persona.color,
        createdAt: serverTimestamp(),
      });
      canvasRef.current?.clearCanvas();
      setText("");
      setSent(true);
    } catch (error) {
      console.error(error);
      alert("しるしを送れませんでした。通信状態を確認してください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="mark-pad" style={{ "--persona-color": persona.color }}>
      <header><div><p>みんなの付箋</p><h1>統計表に、付箋を置く</h1></div><span>{documentData.category}・p.{pageNumbers}</span></header>
      <section className="persona-picker">
        <p>あなたの視点カード</p>
        <div>{personaList.map((item) => <button key={item.id} className={personaId === item.id ? "active" : ""} style={{ "--card-color": item.color }} onClick={() => choosePersona(item.id)}><strong>{item.role}</strong></button>)}</div>
      </section>
      <div className="document-zoom-bar"><p>付箋を置きたい場所を押してください。</p><button type="button" className={`local-rotation-button ${rotation === 90 ? "active" : ""}`} onClick={() => setRotation((value) => value === 90 ? 0 : 90)}>↻ 90度回転</button><button onClick={() => setZoom((value) => Math.max(.55, value - .15))}>−</button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => Math.min(1.5, value + .15))}>＋</button></div>
      <div key={documentId} className="ipad-document-scroll spread-scroll"><div className={`book-spread ${rotation === 90 ? "rotated-90" : ""}`} style={{ width: `${zoom * 2486}px` }}>{documentData.pages.map((item) => <StatDocument key={item.id} page={item} selectedPoint={selectedPoint?.pageId === item.id ? selectedPoint : null} onSelect={(point) => selectPoint({ ...point, pageId: item.id, pageNumber: item.page })} />)}</div></div>

      {selectedPoint && <section className="mark-writing document-writing">
        {sent ? <div className="mark-sent"><strong>付箋を置きました。</strong><button type="button" onClick={() => { setSelectedPoint(null); setSent(false); }}>別の場所を見る</button></div> : <div className="mark-input-area">
          <div className="input-type-tabs"><button className={inputType === "handwriting" ? "active" : ""} onClick={() => setInputType("handwriting")}>手書き</button><button className={inputType === "keyboard" ? "active" : ""} onClick={() => setInputType("keyboard")}>キーボード</button></div>
          {inputType === "handwriting" ? <div className="mark-canvas-wrap"><div className="mark-canvas"><PressureCanvas ref={canvasRef} color={persona.color} onPressureChange={() => {}} /></div></div> : <textarea className="mark-keyboard-input" value={text} maxLength={60} aria-label="付箋の入力欄" onChange={(event) => setText(event.target.value)} />}
          <div className="mark-actions"><button type="button" onClick={() => { canvasRef.current?.clearCanvas(); setText(""); }}>書き直す</button><button type="button" className="send" disabled={sending} onClick={sendMark}>{sending ? "送信中…" : "付箋を置く ↑"}</button></div>
        </div>}
      </section>}
    </main>
  );
}

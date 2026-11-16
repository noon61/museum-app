import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import StatDocument from "../components/StatDocument";
import { getPersona, PERSONAS } from "../data/exhibition";
import { getStatDocument, STAT_DOCUMENTS } from "../data/statistics";

export default function MobileMark() {
  const [documentId, setDocumentId] = useState(STAT_DOCUMENTS[0].id);
  const [personaId, setPersonaId] = useState("p001");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [zoom, setZoom] = useState(0.7);
  const [rotation, setRotation] = useState(0);
  const documentData = getStatDocument(documentId);
  const pageNumbers = documentData.pages.map((item) => item.page).join("–");
  const persona = getPersona(personaId);
  const personas = useMemo(() => Object.values(PERSONAS), []);

  useEffect(() => onSnapshot(doc(db, "exhibition", "state"), (snapshot) => {
    const data = snapshot.data();
    if (data?.currentDocumentId) {
      setDocumentId(data.currentDocumentId);
      setRotation(data.currentRotation || 0);
      setSelectedPoint(null);
      setSent(false);
    }
  }), []);

  const submit = async () => {
    if (!selectedPoint || !text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "annotations"), {
        kind: "document-mark",
        inputType: "keyboard",
        documentId: documentData.id,
        documentTitle: documentData.title,
        pageId: selectedPoint.pageId,
        pageNumber: selectedPoint.pageNumber,
        viewMode: "original",
        x: selectedPoint.x,
        y: selectedPoint.y,
        text: text.trim(),
        personaId: persona.id,
        personaName: persona.name,
        personaRole: persona.role,
        personaColor: persona.color,
        createdAt: serverTimestamp(),
      });
      setText("");
      setSent(true);
    } catch (error) {
      console.error(error);
      alert("気づきを送れませんでした。通信状態を確認してください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="mobile-mark" style={{ "--persona-color": persona.color }}>
      <header><p>混雑時はこちら</p><h1>スマホから付箋を置く</h1><span>{documentData.title}・p.{pageNumbers}</span></header>
      <section className="mobile-personas">
        <p>視点カードを選ぶ</p>
        <div>{personas.map((item) => <button key={item.id} className={personaId === item.id ? "active" : ""} style={{ "--card-color": item.color }} onClick={() => setPersonaId(item.id)}>{item.initials}</button>)}</div>
      </section>
      <div className="document-zoom-bar mobile"><p>付箋を置きたい場所をタップ</p><button onClick={() => setZoom((value) => Math.max(.45, value - .15))}>−</button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => Math.min(1.4, value + .15))}>＋</button></div>
      <div key={documentId} className="mobile-document-scroll spread-scroll"><div className={`book-spread ${rotation === 90 ? "rotated-90" : ""}`} style={{ width: `${zoom * 2486}px` }}>{documentData.pages.map((item) => <StatDocument key={item.id} page={item} selectedPoint={selectedPoint?.pageId === item.id ? selectedPoint : null} onSelect={(point) => { setSelectedPoint({ ...point, pageId: item.id, pageNumber: item.page }); setSent(false); }} />)}</div></div>
      {selectedPoint && <section className="mobile-input">
        {sent ? <><strong>付箋を置きました。</strong><button onClick={() => { setSelectedPoint(null); setSent(false); }}>別の場所を見る</button></> : <>
          <textarea value={text} maxLength={60} aria-label="付箋の入力欄" onChange={(event) => setText(event.target.value)} />
          <div><span>{text.length}/60</span><button disabled={!text.trim() || sending} onClick={submit}>{sending ? "送信中…" : "付箋を置く"}</button></div>
        </>}
      </section>}
    </main>
  );
}

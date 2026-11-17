import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import StatDocument from "../components/StatDocument";
import { getStatDocument, STAT_DOCUMENTS } from "../data/statistics";

export default function WallControl() {
  const selectionCounterRef = useRef(0);
  const [documentId, setDocumentId] = useState(STAT_DOCUMENTS[0].id);
  const [pageIndex, setPageIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const documentData = getStatDocument(documentId);
  const pageNumbers = documentData.pages.map((item) => item.page).join("–");

  useEffect(() => onSnapshot(doc(db, "exhibition", "state"), (snapshot) => {
    const data = snapshot.data();
    if (data?.currentDocumentId) {
      setDocumentId(data.currentDocumentId);
      setPageIndex(data.currentPageIndex || 0);
      setRotation(data.currentRotation || 0);
      setSelectedTarget(data.selectedTarget || null);
    }
  }), []);

  const changeProjection = async (nextDocumentId, nextPageIndex = 0, nextRotation = rotation) => {
    const safeRotation = nextDocumentId === "education" ? nextRotation : 0;
    setChanging(true);
    try {
      await setDoc(doc(db, "exhibition", "state"), {
        currentDocumentId: nextDocumentId,
        currentPageIndex: nextPageIndex,
        currentViewMode: "original",
        currentRotation: safeRotation,
        selectedTarget: null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setDocumentId(nextDocumentId);
      setPageIndex(nextPageIndex);
      setRotation(safeRotation);
      setSelectedTarget(null);
    } catch (error) {
      console.error(error);
      alert("プロジェクターの表示を変更できませんでした。");
    } finally {
      setChanging(false);
    }
  };

  const selectTarget = async (page, point) => {
    selectionCounterRef.current += 1;
    const target = {
      id: `${page.id}-${selectionCounterRef.current}-${point.x}-${point.y}`,
      documentId: documentData.id,
      pageId: page.id,
      pageNumber: page.page,
      x: point.x,
      y: point.y,
    };
    setSelectedTarget(target);
    try {
      await setDoc(doc(db, "exhibition", "state"), {
        selectedTarget: target,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error(error);
      alert("選択した場所をiPadへ送れませんでした。");
    }
  };

  return <main className="wall-control document-control">
    <header><div><h1>投影する統計表を選ぶ</h1></div><span><i /> プロジェクターと接続中</span></header>
    <section className="control-grid">
      {STAT_DOCUMENTS.map((item, index) => <button key={item.id} className={item.id === documentId ? "active" : ""} disabled={changing} onClick={() => changeProjection(item.id, 0)}>
        <span>0{index + 1} / {item.category}</span><strong>{item.title}</strong>{item.id === documentId && <b>投影中</b>}
      </button>)}
    </section>
    {documentData.id === "education" && <section className="view-mode-switch"><button className={rotation === 90 ? "active" : ""} onClick={() => changeProjection(documentData.id, pageIndex, rotation === 90 ? 0 : 90)}>↻ 90度回転</button></section>}
    <section className="control-browser">
      <div className="control-tools"><div><span>{selectedTarget ? "場所を選択しました" : "付箋を置く場所をタップ"}</span><strong>{documentData.title}・p.{pageNumbers}</strong></div></div>
      <div key={documentId} className="control-document-viewport"><div className={`book-spread control-fit-spread ${rotation === 90 ? "rotated-90" : ""}`}>{documentData.pages.map((item) => <StatDocument key={item.id} page={item} selectedPoint={selectedTarget?.pageId === item.id ? selectedTarget : null} onSelect={(point) => selectTarget(item, point)} />)}</div></div>
    </section>
  </main>;
}

import { useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import HandwritingSvg from "../components/HandwritingSvg";
import StatDocument from "../components/StatDocument";
import { getStatDocument, STAT_DOCUMENTS } from "../data/statistics";

export default function WallControl() {
  const selectionCounterRef = useRef(0);
  const [documentId, setDocumentId] = useState(STAT_DOCUMENTS[0].id);
  const [pageIndex, setPageIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [browseMarks, setBrowseMarks] = useState(false);
  const [activeMarks, setActiveMarks] = useState([]);
  const [activeMarkIndex, setActiveMarkIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
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
  useEffect(() => onSnapshot(collection(db, "annotations"), (snapshot) => {
    setAnnotations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, (error) => console.error("付箋の取得エラー", error)), []);

  const documentMarks = annotations.filter((item) => item.kind === "document-mark" && item.documentId === documentData.id && !item.cellId);
  const activeMark = activeMarks[activeMarkIndex] || null;

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
      setActiveMarks([]);
      setActiveMarkIndex(0);
      setZoom(1);
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

  const showMarkGroup = (marks) => {
    setActiveMarks(marks);
    setActiveMarkIndex(0);
  };

  const closeMark = () => {
    setActiveMarks([]);
    setActiveMarkIndex(0);
  };

  return <main className="wall-control document-control">
    <div className="control-fixed-header">
      <header><div><h1>投影する統計表を選ぶ</h1></div><span><i /> プロジェクターと接続中</span></header>
      <section className="control-grid">
      {STAT_DOCUMENTS.map((item, index) => <button key={item.id} className={item.id === documentId ? "active" : ""} disabled={changing} onClick={() => changeProjection(item.id, 0)}>
        <span>0{index + 1} / {item.category}</span><strong>{item.title}</strong>{item.id === documentId && <b>投影中</b>}
      </button>)}
      </section>
      {documentData.id === "education" && <section className="view-mode-switch"><button className={rotation === 90 ? "active" : ""} onClick={() => changeProjection(documentData.id, pageIndex, rotation === 90 ? 0 : 90)}>↻ 90度回転</button></section>}
    </div>
    <section className="control-browser">
      <div className="control-tools"><div><span>{browseMarks ? `${documentMarks.length}件の付箋` : selectedTarget ? "場所を選択しました" : "付箋を置く場所をタップ"}</span><strong>{documentData.title}・p.{pageNumbers}</strong></div><button className={browseMarks ? "active" : ""} onClick={() => { setBrowseMarks((value) => !value); closeMark(); }}>{browseMarks ? "付箋を置く" : "みんなの付箋を見る"}</button><div className="control-zoom-buttons"><button aria-label="縮小" disabled={zoom <= .7} onClick={() => setZoom((value) => Math.max(.7, value - .15))}>−</button><span>{Math.round(zoom * 100)}%</span><button aria-label="拡大" disabled={zoom >= 1.9} onClick={() => setZoom((value) => Math.min(1.9, value + .15))}>＋</button><button className="zoom-reset" onClick={() => setZoom(1)}>全体</button></div></div>
      <div key={documentId} className="control-document-viewport"><div className={`book-spread control-fit-spread ${rotation === 90 ? "rotated-90" : ""}`} style={{ zoom }}>{documentData.pages.map((item) => <StatDocument key={item.id} page={item} marks={browseMarks ? documentMarks.filter((mark) => mark.pageId === item.id) : []} compactMarks={browseMarks} onMarkSelect={showMarkGroup} selectedPoint={!browseMarks && selectedTarget?.pageId === item.id ? selectedTarget : null} onSelect={browseMarks ? undefined : (point) => selectTarget(item, point)} />)}</div>
        {activeMark && <div className="control-note-popover" role="dialog" aria-label="付箋の内容"><button className="popover-close" onClick={closeMark}>閉じる</button><div className="popover-content">{activeMark.inputType === "reaction" ? <strong className="popover-reaction">{activeMark.reaction}</strong> : activeMark.inputType === "keyboard" ? <p>{activeMark.text}</p> : <HandwritingSvg strokes={activeMark.strokes} color={activeMark.personaColor} />}</div>{activeMarks.length > 1 && <div className="popover-navigation"><button disabled={activeMarkIndex === 0} onClick={() => setActiveMarkIndex((value) => value - 1)}>←</button><span>{activeMarkIndex + 1} / {activeMarks.length}</span><button disabled={activeMarkIndex === activeMarks.length - 1} onClick={() => setActiveMarkIndex((value) => value + 1)}>→</button></div>}</div>}
      </div>
    </section>
  </main>;
}

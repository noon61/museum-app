import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRef } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
export default function Input() {
    const navigate = useNavigate();
    const location = useLocation();

const question =
  location.state?.question ||
  "「データ」と聞いて最初に思い浮かぶ言葉は？";
    const canvasRef = useRef(null);
    const sendData = async () => {
  try {
    // 手書きを画像化
    const image = await canvasRef.current.exportImage("png");

    // Firestoreへ保存
    await addDoc(collection(db,"answers"),{
    image,
    question,
    createdAt:serverTimestamp(),
});

    // キャンバスを消す
    canvasRef.current.clearCanvas();

// ありがとう画面を少し見せる
alert("ありがとうございました！\nあなたのアイデアを展示へ追加しました。");

// Welcomeへ戻る
navigate("/");
  } catch (err) {
    console.error(err);
    alert("送信に失敗しました");
  }
};
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#ece6de",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "85%",
          maxWidth: "1200px",
          height: "80%",
          background: "#ffffff",
          borderRadius: "45px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "50px 70px",
          boxSizing: "border-box",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        {/* タイトル */}
        <h1
          style={{
            fontSize: "60px",
            color: "#4A2615",
            margin: "20",
            fontWeight: "500",
          }}
        >
          問い
        </h1>

        {/* 質問 */}
        <h2
  style={{
    fontSize: "36px",
    color: "#4A2615",
    textAlign: "center",
    marginBottom: "60px",
  }}
>
  {question}
</h2>

        {/* 手書きエリア */}
        <div
  style={{
    width: "70%",
    height: "320px",
    borderRadius: "35px",
    overflow: "hidden",
    background: "#B5AA9E",
  }}
>
  <ReactSketchCanvas
    ref={canvasRef}
    strokeWidth={4}
    strokeColor="#ffffff"
    canvasColor="#B5AA9E"
    width="100%"
    height="320px"
  />
</div>

   <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    width: "60%",
    marginTop: "50px",
  }}
>
  <button
    onClick={() => navigate("/")}
    style={{
      border: "none",
      background: "transparent",
      fontSize: "42px",
      cursor: "pointer",
      fontWeight: "600",
      color: "#7A5A45",
    }}
  >
    ← 戻る
  </button>

  <button
    onClick={() => canvasRef.current.clearCanvas()}
    style={{
      border: "none",
      background: "transparent",
      fontSize: "42px",
      cursor: "pointer",
      fontWeight: "600",
    }}
  >
    消す
  </button>

  <button
    onClick={sendData}
    style={{
      border: "none",
      background: "transparent",
      fontSize: "42px",
      cursor: "pointer",
      fontWeight: "600",
      color: "#4A2615",
    }}
  >
    送る
  </button>
</div>
      
      </div>
    </div>
  );
}
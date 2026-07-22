import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Display() {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "answers"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Firestore取得:", list);

        setAnswers(list);
      },
      (error) => {
        console.error("Firestoreエラー", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 配置する位置
  const positions = [
    { x: 120, y: 80 },
    { x: 420, y: 140 },
    { x: 780, y: 90 },
    { x: 120, y: 450 },
    { x: 450, y: 520 },
    { x: 780, y: 380 },
    { x: 1050, y: 220 },
    { x: 980, y: 560 },
    { x: 250, y: 260 },
    { x: 930, y: 70 },
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#B5AA9E",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 件数確認用（あとで消してOK） */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          color: "#fff",
          fontSize: 24,
        }}
      >
        {answers.length} 件
      </div>

      {/* 中央の質問 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          padding: 35,
          borderRadius: 35,
          background: "#f0eae4",
          textAlign: "center",
          boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            color: "#4A2615",
            fontSize: 20,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          「データ」と聞いて
          <br />
          最初に思い浮かぶ
          <br />
          言葉はなんですか？
        </h2>
      </div>

      {/* 回答一覧 */}
      {answers.map((answer, index) => {
        const p = positions[index % positions.length];

        return (
          <motion.div
            key={answer.id}
            initial={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -5, 0],
            }}
            transition={{
              duration: 0.8,
              y: {
                repeat: Infinity,
                duration: 4,
              },
            }}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: 200,
              minHeight: 120,
              padding: 20,
              borderRadius: 30,
              border: "4px solid white",
              background:"#B5AA9E",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <img
              src={answer.image}
              alt="回答"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
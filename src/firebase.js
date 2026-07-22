import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7FFPwqIWmMdQyVVRLEFq5VuD96azjPhA",
  authDomain: "museum-demo-e534f.firebaseapp.com",
  projectId: "museum-demo-e534f",
  storageBucket: "museum-demo-e534f.firebasestorage.app",
  messagingSenderId: "524146230469",
  appId: "1:524146230469:web:9bd844da37a2e4f6249cac"
};

const app = initializeApp(firebaseConfig);

// Firestoreデータベース
export const db = getFirestore(app);
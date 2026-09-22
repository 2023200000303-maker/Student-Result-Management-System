import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDznb3rtsFW75Hq3Dc35K5_Hu-94zaxcjs",
  authDomain: "student-result-managemen-b8ba1.firebaseapp.com",
  projectId: "student-result-managemen-b8ba1",
  storageBucket: "student-result-managemen-b8ba1.firebasestorage.app",
  messagingSenderId: "171986585370",
  appId: "1:171986585370:web:14960e82793cddbcff0ea3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
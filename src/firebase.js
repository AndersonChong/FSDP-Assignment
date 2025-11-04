import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "dummy",
  authDomain: "localhost",
  projectId: "ai-agent-platform-grp28",
  storageBucket: "dummy.appspot.com",
  messagingSenderId: "dummy",
  appId: "dummy"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to local Firestore emulator
connectFirestoreEmulator(db, "localhost", 8080);

export { db };

// src/lib/rigbotLog.ts
import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function logRigbotMessage(message: {
  role: "user" | "assistant",
  content: string
}) {
  try {
    await addDoc(collection(db, "rigbot_logs"), {
      ...message,
      timestamp: Timestamp.now()
    });
    console.log("✅ Log guardado en Firestore");
  } catch (e) {
    console.error("❌ Error guardando log:", e);
  }
}

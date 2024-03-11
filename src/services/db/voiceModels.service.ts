import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";

const DB_NAME = "voice_models";

const createFirestoreId = (userString: string) => {
  // Convert to lowercase
  let firestoreId = userString.toLowerCase();
  // Remove spaces
  firestoreId = firestoreId.replace(/\s+/g, "");
  // Remove any non-alphanumeric characters except underscores
  firestoreId = firestoreId.replace(/\W+/g, "");
  return firestoreId;
};

const createVoiceModelDoc = async (
  id: string,
  userId: string,
  voiceModelObj: any
): Promise<void> => {
  const d = doc(db, DB_NAME, createFirestoreId(id) + "_" + userId);
  await setDoc(d, voiceModelObj);
};
export { createVoiceModelDoc };

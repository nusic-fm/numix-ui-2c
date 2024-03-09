import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";

const DB_NAME = "voice_models";

const createVoiceModelDoc = async (voiceModelObj: any): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, voiceModelObj);
  return ref.id;
};
export { createVoiceModelDoc };

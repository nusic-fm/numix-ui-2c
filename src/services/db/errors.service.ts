import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";

const DB_NAME = "errors";

const createErrorDoc = async (errorObj: any): Promise<void> => {
  const d = collection(db, DB_NAME);
  await addDoc(d, errorObj);
};
export { createErrorDoc };

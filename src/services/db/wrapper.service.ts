import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";

const DB_NAME = "wrapper";

const createWrapperDoc = async (remixObj: any): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, remixObj);
  return ref.id;
};

const getWrapperDoc = async (id: string): Promise<any> => {
  const d = doc(db, DB_NAME, id);
  const wdoc = await getDoc(d);
  return wdoc.data();
};

export { createWrapperDoc, getWrapperDoc };

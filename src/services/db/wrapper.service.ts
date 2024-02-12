import { db } from "../firebase.service";
import { doc, getDoc, setDoc } from "firebase/firestore";

const DB_NAME = "wrapper";

const createWrapperDoc = async (id: string, remixObj: any): Promise<void> => {
  const d = doc(db, DB_NAME, id);
  await setDoc(d, remixObj);
};

const getWrapperDoc = async (id: string): Promise<any> => {
  const d = doc(db, DB_NAME, id);
  const wdoc = await getDoc(d);
  return wdoc.data();
};

export { createWrapperDoc, getWrapperDoc };

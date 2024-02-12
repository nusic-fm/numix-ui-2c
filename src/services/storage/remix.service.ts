import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase.service";
import { getDownloadURL } from "firebase/storage";

const FOLDER_NAME = "wrapper";

const uploadFromAudioBlob = async (id: string, audioStrValue: Blob) => {
  const storageRef = ref(storage, `${FOLDER_NAME}/${id}`);
  const snapshot = await uploadBytes(storageRef, audioStrValue);
  return snapshot.ref.fullPath;
};

const getMusicUrl = async (fullPath: string): Promise<string> => {
  const storageRef = ref(storage, fullPath);
  return getDownloadURL(storageRef);
};

export { uploadFromAudioBlob, getMusicUrl };

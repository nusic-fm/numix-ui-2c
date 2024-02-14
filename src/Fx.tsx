import { Box } from "@mui/system";
import AudioComponent from "./components/AudioComponent";
import {
  // useCollectionDataOnce,
  useCollectionOnce,
} from "react-firebase-hooks/firestore";
import { collection, query } from "firebase/firestore";
import { db } from "./services/firebase.service";
import { Chip } from "@mui/material";
import { useState } from "react";

const numixsRef = collection(db, "wrapper");

const Fx = () => {
  const [vid, setVid] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [musicInfo, setMusicInfo] = useState<{ title: string; tag: string }>();
  const [instrumentalUrl, setInstrumentalUrl] = useState("");
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
  const [vocalsUrl, setVocalsUrl] = useState("");
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
  // const [values] = useCollectionDataOnce(query(numixsRef));
  const [snaps] = useCollectionOnce(query(numixsRef));

  const onWrapSelected = async (v: any) => {
    const _vid = v.vid;
    setVid(_vid);
    setMusicInfo({ title: v.title, tag: v.tag });
    setSelectedGenre(v.genre);

    setInstrumentalUrl(
      `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/wrapper%2F${_vid}%2Finstr.wav?alt=media`
    );
    setVocalsUrl(
      `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/wrapper%2F${_vid}%2Fvocals.wav?alt=media`
    );
  };

  return (
    <Box>
      <Box display={"flex"} gap={2} flexWrap="wrap">
        {snaps?.docs?.map((d) => {
          const v = d.data();
          return (
            <Chip
              color="secondary"
              key={d.id}
              label={v.title}
              clickable
              onClick={() => {
                if (vid) {
                  setInstrumentalUrl("");
                  setVocalsUrl("");
                  setTimeout(() => {
                    onWrapSelected(v);
                  }, 100);
                  return;
                }
                onWrapSelected(v);
              }}
            />
          );
        })}
      </Box>
      {!!instrumentalUrl && !!vocalsUrl && (
        <AudioComponent
          onFinish={() => {}}
          vid={vid}
          selectedGenre={selectedGenre}
          instrumentalUrl={instrumentalUrl}
          vocalsUrl={vocalsUrl}
          musicInfo={musicInfo}
          onBack={() => {
            setInstrumentalUrl("");
            setVocalsUrl("");
          }}
        />
      )}
    </Box>
  );
};

export default Fx;

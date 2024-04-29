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
  const [instrumentalUrl, setInstrumentalUrl] = useState(
    `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2FZa2lpP2IwsE9Hw46IyIe%2Finstrumental.mp3?alt=media`
  );
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
  const [vocalsUrl, setVocalsUrl] = useState(
    `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2FZa2lpP2IwsE9Hw46IyIe%2Fkanye.mp3?alt=media`
  );
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
  // const [values] = useCollectionDataOnce(query(numixsRef));
  // const [snaps] = useCollectionOnce(query(numixsRef));

  const onWrapSelected = async (v: any) => {
    const _vid = v.vid;
    setVid(_vid);
    setMusicInfo({ title: v.title, tag: v.tag });
    setSelectedGenre(v.genre);
    // lorde;
    const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2FZa2lpP2IwsE9Hw46IyIe%2Finstrumental.mp3?alt=media`;
    //   const firstVoice = (artistsObj as any)[songId].voices[0].id;
    const _vocalsUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2FZa2lpP2IwsE9Hw46IyIe%2Fkanye.mp3?alt=media`;
    setInstrumentalUrl(_instrUrl);
    setVocalsUrl(_vocalsUrl);
  };

  return (
    <Box>
      {/* <Box display={"flex"} gap={2} flexWrap="wrap">
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
      </Box> */}
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

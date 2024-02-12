import { Box } from "@mui/system";
import AudioComponent from "./components/AudioComponent";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { collection, query } from "firebase/firestore";
import { db } from "./services/firebase.service";
import { Chip } from "@mui/material";
import { useState } from "react";

const numixsRef = collection(db, "wrapper");

const Fx = () => {
  const [vid, setVid] = useState(
    "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
  );
  const [instrumentalUrl, setInstrumentalUrl] = useState("");
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
  const [vocalsUrl, setVocalsUrl] = useState("");
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
  const [values] = useCollectionDataOnce(query(numixsRef));
  const onWrapSelected = async (_vid: string) => {
    setVid(_vid);
    setInstrumentalUrl(
      `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/wrapper/${_vid}/instr.wav?alt=media`
    );
    setVocalsUrl(
      `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/wrapper/${_vid}/instr.wav?alt=media`
    );
  };

  return (
    <Box>
      <Box display={"flex"} gap={2} flexWrap="wrap">
        {values?.map((v) => (
          <Chip
            color="secondary"
            key={v.vid}
            label={v.name}
            clickable
            onClick={() => onWrapSelected(v.vid)}
          />
        ))}
      </Box>
      {instrumentalUrl && vocalsUrl && (
        <AudioComponent
          onFinish={() => {}}
          vid={vid}
          selectedGenre="Future Bass"
          instrumentalUrl={instrumentalUrl}
          vocalsUrl={vocalsUrl}
        />
      )}
    </Box>
  );
};

export default Fx;

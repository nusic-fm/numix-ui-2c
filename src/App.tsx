import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import "./App.css";
import Uploader from "./components/Uploader";
import { useTonejs } from "./hooks/useToneService";
import { motion } from "framer-motion";
import DropsFace from "./components/DropsFace";
import WaveSelector from "./components/WaveSelector";
import useWebSocket from "react-use-websocket";
import { LoadingButton } from "@mui/lab";
import MultiWaveform from "./components/MultiWaveform";
import { fileToBase64 } from "./helpers/audio";

const genreNames = [
  "Progressive House",
  "Future House",
  "House, Indian instruments",
  "House, Arabic instruments",
  "Electronic, Futurebass",
  "Chill Out, Downtempo",
  "Trap",
  "Breakbeat",
  "Americana",
  "Reggaeton",
];

export type Allin1Anaysis = {
  beatPositions: number[];
  beats: number[];
  bpm: number;
  downbeats: number[];
  segments: { start: number; end: number; label: string }[];
};

export type LongerSectionProps = {
  description?: string;
  start?: number;
  end: number;
  url: string;
};

function App() {
  const [melodyFile, setMelodyFile] = useState<File>();
  const [melodyUrl, setMelodyUrl] = useState<string>();
  const [vocalsUrl, setVocalsUrl] = useState<string>();
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
  const [longerRemixUrl, setLongerRemixUrl] = useState<string>();
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
  const [showWaveSelector, setShowWaveSelector] = useState(false);
  const [newAudio, setNewAudio] = useState<string>();
  const [longerAudioLoading, setLongerAudioLoading] = useState<boolean>();
  const [allin1Analysis, setAllIn1Analysis] = useState<Allin1Anaysis>();
  // JSON.parse(
  //   '{"msg":"allin1","segments":[{"start":0.0,"end":0.01,"label":"verse"},{"start":0.01,"end":15.99,"label":"verse"},{"start":15.99,"end":16.0,"label":"verse"}],"bpm":120,"beats":[0.49,1.0,1.49,2.0,2.49,2.99,3.5,4.0,4.5,5.0,5.5,6.0,6.5,7.0,7.49,8.0,8.5,9.0,9.49,10.0,10.49,11.0,11.5,12.0,12.5,13.0,13.5,14.0,14.5,15.0,15.49],"downbeats":[0.49,2.49,4.5,6.5,8.5,10.49,12.5,14.5],"beat_positions":[1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3]}'
  // )
  const [isReady, setIsReady] = useState(false);
  const {
    // sendMessage,
    sendJsonMessage,
    lastMessage,
    // lastJsonMessage,
    readyState,
    // getWebSocket,
  } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    // heartbeat: { interval: 5000 },
    onOpen: () => console.log("Connected"),
    onClose: () => console.log("Closed"),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: () => false,
  });
  const readyStateString = {
    0: "CONNECTING",
    1: "OPEN",
    2: "CLOSING",
    3: "CLOSED",
  }[readyState as 0 | 1 | 2 | 3];

  useEffect(() => {
    if (readyStateString === "OPEN" && isReady === false) {
      sendJsonMessage({ msg: "Connected to Client" });
    }
  }, [readyState]);

  const [sectionInfo, setSectionInfo] = useState<{
    description: string;
  }>();
  const [sectionStartEnd, setSectionStartEnd] = useState<{
    start: number;
    end: number;
  }>();

  const { playAudio, initializeTone, isTonePlaying, stopPlayer, playPlayer } =
    useTonejs();

  const onGenreSelection = (description: string) => {
    setSectionInfo({ description });
  };
  const onSliceSelection = (start: number, end: number) => {
    setSectionStartEnd({ start, end });
  };

  const onDropMusicUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const melody = acceptedFiles[0];
      setMelodyFile(melody);
      setMelodyUrl(URL.createObjectURL(melody));
    }
  };

  const onFetchAudio = async () => {
    if (readyStateString === "OPEN" && melodyFile) {
      // sendJsonMessage({
      //   msg: "generate_long",
      //   start: 0,
      //   end: 0,
      //   description: "Progressive House",
      // });
      // const arrayBuffer = await fileToArraybuffer(melodyFile);
      const base64_audio = await fileToBase64(melodyFile);
      const obj = {
        msg: "generate",
        melody: base64_audio,
        descriptions: genreNames.slice(0, 1),
        durations: Array(1).fill(1),
      };
      sendJsonMessage(obj);
      // Create a Blob with the binary data and additional metadata
      // const blob = new Blob([arrayBuffer, JSON.stringify(obj)], {
      //   type: "application/octet-stream",
      // });
      // wsRef.current.send(JSON.stringify(obj));
    }
  };

  const onGenerate = async () => {
    if (showWaveSelector && melodyFile) {
      // setVocalsUrl(
      //   "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
      // );
      // setLongerRemixUrl(
      //   "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
      // );
      // const base64_audio = await fileToBase64(melodyFile);
      sendJsonMessage({
        msg: "generate_long",
        start: sectionStartEnd?.start,
        end: sectionStartEnd?.end,
        description: sectionInfo?.description,
      });
      setLongerAudioLoading(true);
    } else {
      stopPlayer();
      setShowWaveSelector(true);
    }
  };

  useEffect(() => {
    if (lastMessage) {
      const data = lastMessage.data;
      if (data instanceof Blob) {
        if (longerAudioLoading) {
          const blob = new Blob([data], { type: "audio/wav" });
          setLongerRemixUrl(URL.createObjectURL(blob));
          setLongerAudioLoading(false);
        } else if (allin1Analysis && !vocalsUrl) {
          const blob = new Blob([data], { type: "audio/wav" });
          setVocalsUrl(URL.createObjectURL(blob));
        } else {
          const blob = new Blob([data], { type: "audio/wav" });
          setNewAudio(URL.createObjectURL(blob));
        }
      } else {
        console.log({ newAudio });
        const dataObj = JSON.parse(data);
        if (dataObj.msg === "allin1") {
          setAllIn1Analysis(dataObj);
        } else if (dataObj.msg === "Connected") {
          setIsReady(true);
        }
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (melodyFile) {
      // new Array(10)
      //   .fill(1)
      //   .map((a, i) =>
      //     setTimeout(
      //       () =>
      //         setNewAudio(
      //           `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/shorts%2F${i}.wav?alt=media`
      //         ),
      //       (i + 1) * 4000
      //     )
      //   );
      onFetchAudio();
    }
  }, [melodyFile]);

  return (
    <Box
      height={"90vh"}
      width={{ xs: "100vw", md: "unset" }}
      position="relative"
    >
      <Typography sx={{ position: "absolute", top: 0, right: 10 }}>
        {readyStateString} - {isReady ? "Model Ready" : "Model Not Ready"}
      </Typography>
      <motion.div
        animate={{ y: melodyFile ? "10%" : "40vh" }}
        transition={{ type: "spring", duration: 1 }}
      >
        <Box width="100%" display={"flex"} justifyContent="center">
          <Uploader
            onDrop={onDropMusicUpload}
            melodyFile={melodyFile}
            initializeTone={initializeTone}
            playAudio={playAudio}
          />
        </Box>
        {melodyFile && !showWaveSelector && (
          <Box mt={4} width="100%">
            <Box mt={4} width="100%" display={"flex"} justifyContent="center">
              <DropsFace
                genreNames={genreNames}
                isTonePlaying={isTonePlaying}
                stopPlayer={stopPlayer}
                playPlayer={playPlayer}
                newAudio={newAudio}
                playAudio={playAudio}
                onGenreSelection={onGenreSelection}
              />
            </Box>
          </Box>
        )}
        {/* showWaveSelector && */}
        {melodyUrl && showWaveSelector && !longerRemixUrl && (
          <Box mt={4} width="100%" display={"flex"} justifyContent="center">
            <WaveSelector
              url={melodyUrl}
              analysis={allin1Analysis}
              onSliceSelection={onSliceSelection}
            />
          </Box>
        )}
        {longerRemixUrl && vocalsUrl && (
          <Box mt={4} width="100%" display={"flex"} justifyContent="center">
            <MultiWaveform
              vocalsUrl={vocalsUrl}
              remixUrl={longerRemixUrl}
              bpm={allin1Analysis?.bpm}
            />
          </Box>
        )}
        {newAudio && !longerRemixUrl && (
          <Box mt={4} display={"flex"} justifyContent="center">
            <LoadingButton
              loading={longerAudioLoading}
              variant={allin1Analysis ? "contained" : "outlined"}
              color={allin1Analysis ? "primary" : "info"}
              onClick={onGenerate}
            >
              {showWaveSelector
                ? "Generate"
                : `Proceed with ${sectionInfo?.description}`}
            </LoadingButton>
          </Box>
        )}
      </motion.div>
    </Box>
  );
}

export default App;

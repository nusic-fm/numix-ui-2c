import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import Uploader from "./components/Uploader";
import { useTonejs } from "./hooks/useToneService";
import { motion } from "framer-motion";
import DropsFace from "./components/DropsFace";
import WaveSelector from "./components/WaveSelector";
import { fileToBase64 } from "./helpers/audio";

const genreNames = [
  "House",
  "Mystical",
  "The Raver",
  "Future Bass",
  "Pluggnb",
  "Dubstepper",
  "Ambient",
  "The Chase",
  "In Da Club",
  "The Rocker",
];

function App() {
  const [melodyFile, setMelodyFile] = useState<File>();
  const [melodyUrl, setMelodyUrl] = useState<string>();
  const [showWaveSelector, setShowWaveSelector] = useState(false);
  const [newAudio, setAudio] = useState<string>();
  const [wsMsg, setWsMsg] = useState<string>();
  const [isConnectionLoading, setIsConnectionLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  const { playAudio, initializeTone, isTonePlaying, stopPlayer, playPlayer } =
    useTonejs();

  const onDropMusicUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const melody = acceptedFiles[0];
      setMelodyFile(melody);
      setMelodyUrl(URL.createObjectURL(melody));
    }
  };

  const onFetchAudio = async () => {
    if (wsRef.current && melodyFile) {
      // const arrayBuffer = await fileToArraybuffer(melodyFile);
      const base64_audio = await fileToBase64(melodyFile);
      const obj = {
        msg: "generate",
        melody: base64_audio,
        descriptions: genreNames,
        durations: Array(10).fill(1),
      };
      // Create a Blob with the binary data and additional metadata
      // const blob = new Blob([arrayBuffer, JSON.stringify(obj)], {
      //   type: "application/octet-stream",
      // });
      wsRef.current.send(JSON.stringify(obj));
    }
  };

  const onGenerate = () => {
    setShowWaveSelector(true);
  };
  const setupWs = async () => {
    if (wsRef.current) return;
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
    ws.onopen = () => {
      ws.send(JSON.stringify({ msg: "Connected" }));
      setIsConnectionLoading(true);
    };
    ws.onmessage = (e) => {
      const data = e.data;
      if (data instanceof Blob) {
        const blob = new Blob([data], { type: "audio/wav" });
        setAudio(URL.createObjectURL(blob));
        // playAudio(URL.createObjectURL(blob));
      } else {
        setWsMsg(data);
        setIsConnectionLoading(false);
      }
    };
    wsRef.current = ws;
  };
  useEffect(() => {
    if (melodyFile) {
      // new Array(10)
      //   .fill(1)
      //   .map((a, i) =>
      //     setTimeout(() => setAudio(Math.random().toString()), i * 4000)
      //   );
      onFetchAudio();
    }
  }, [melodyFile]);

  useEffect(() => {
    setupWs();
  }, []);

  return (
    <Box
      height={"90vh"}
      width={{ xs: "100vw", md: "unset" }}
      position="relative"
    >
      {!!wsMsg && (
        <Typography
          sx={{ position: "absolute", top: 0, right: 10 }}
          color={"lightgreen"}
        >
          {wsMsg}
        </Typography>
      )}
      {isConnectionLoading && (
        <Typography
          sx={{ position: "absolute", top: 0, right: 10 }}
          color={"red"}
        >
          Connecting
        </Typography>
      )}
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

        {melodyFile && (
          <Box mt={4} width="100%">
            <Box mt={4} width="100%" display={"flex"} justifyContent="center">
              <DropsFace
                genreNames={genreNames}
                isTonePlaying={isTonePlaying}
                stopPlayer={stopPlayer}
                playPlayer={playPlayer}
                newAudio={newAudio}
                playAudio={playAudio}
              />
            </Box>
            <Box mt={4} display={"flex"} justifyContent="center">
              <Button variant="contained" onClick={onGenerate}>
                Generate
              </Button>
            </Box>
          </Box>
        )}
        {showWaveSelector && melodyUrl && (
          <Box mt={4} width="100%" display={"flex"} justifyContent="center">
            <WaveSelector url={melodyUrl} />
          </Box>
        )}
      </motion.div>
    </Box>
  );
}

export default App;

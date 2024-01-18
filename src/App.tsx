import { Box, Button } from "@mui/material";
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
  const [showWaveSelector, setShowWaveSelector] = useState(false);
  const [newAudio, setAudio] = useState<string>();

  const wsRef = useRef<WebSocket | null>(null);

  const { playAudio, initializeTone, isTonePlaying, stopPlayer, playPlayer } =
    useTonejs();

  const onDropMusicUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setMelodyFile(acceptedFiles[0]);
    }
  };

  const onFetchAudio = async () => {
    if (wsRef.current && melodyFile) {
      console.time("base64");
      const base64 = await fileToBase64(melodyFile);
      // const ab = await new Promise((res) => {
      //   const fr = new FileReader();
      //   fr.onload = (e) => {
      //     res(e.target?.result);
      //   };
      //   fr.readAsArrayBuffer(melodyFile);
      // });

      console.timeEnd("base64");
      const obj = {
        msg: "generate",
        descriptions: genreNames,
        melody: base64,
        durations: Array(10).fill(1),
      };
      wsRef.current.send(JSON.stringify(obj));
    }
  };

  const onGenerate = () => {
    setShowWaveSelector(true);
  };
  const setupWs = async () => {
    if (wsRef.current) return;
    const ws = new WebSocket("ws://35.239.6.232:8000/ws");
    ws.onopen = () => ws.send(JSON.stringify({ msg: "Connected" }));
    ws.onmessage = (e) => {
      const data = e.data;
      if (data instanceof Blob) {
        const blob = new Blob([data], { type: "audio/wav" });
        setAudio(URL.createObjectURL(blob));
        // playAudio(URL.createObjectURL(blob));
      }
    };
    wsRef.current = ws;
  };
  useEffect(() => {
    if (melodyFile) {
      onFetchAudio();
    }
  }, [melodyFile]);

  useEffect(() => {
    setupWs();
  }, []);

  return (
    <Box height={"90vh"} width={{ xs: "100vw", md: "unset" }}>
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
        {showWaveSelector && (
          <Box mt={4} width="100%" display={"flex"} justifyContent="center">
            <WaveSelector />
          </Box>
        )}
      </motion.div>
    </Box>
  );
}

export default App;

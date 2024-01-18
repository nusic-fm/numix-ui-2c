import { PauseRounded } from "@mui/icons-material";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import WavesurferPlayer from "@wavesurfer/react";
import { useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Regions from "wavesurfer.js/dist/plugins/regions.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import { convertSecondsToHHMMSS } from "../helpers/audio";

const url =
  "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/audio.wav?alt=media";
// const timelineOptions = useRef({
//   height: 15,
//   timeInterval: 0.2,
//   primaryLabelInterval: 1,
//   style: {
//     fontSize: "10px",
//     color: "#fff",
//   },
// });

const WaveSelector = () => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // const [isDragging, setIsDragging] = useState(false);
  const transitionClsRef = useRef<HTMLDivElement | null>(null);

  // const timelineWs = useRef(Timeline.create(timelineOptions.current));
  const regionsWs = useRef(Regions.create());

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    regionsWs.current.addRegion({
      resize: true,
      drag: true,
      start: 0,
      end: 6,
      color: "rgba(0, 0, 0, 0.5)",
      maxLength: 8,
      minLength: 1,
    });
  };

  return (
    <Stack width={"60%"} ref={transitionClsRef}>
      <WavesurferPlayer
        height={100}
        cursorColor="red"
        cursorWidth={3}
        // progressColor=""
        waveColor="#573FC8"
        url={url}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeupdate={(ws) => setCurrentTime(ws.getCurrentTime())}
        plugins={useMemo(() => [Timeline.create(), regionsWs.current], [])}
        barWidth={5}
        barGap={5}
        barRadius={5}
      />
      <Box
        display={"flex"}
        gap={4}
        mt={4}
        justifyContent="center"
        position={"relative"}
      >
        <Box
          position={"absolute"}
          left={0}
          width={"100%"}
          height="100%"
          display={"flex"}
          alignItems="center"
          gap={2}
        >
          <IconButton onClick={() => wavesurfer?.playPause()}>
            {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
          </IconButton>
          <Typography>
            {convertSecondsToHHMMSS(Math.floor(currentTime))}
          </Typography>
        </Box>
        {[
          { start: 0, end: 6 },
          { start: 6, end: 12 },
          { start: 12, end: 16 },
        ].map((seg) => (
          <Chip
            key={seg.start}
            clickable
            label={`${seg.start}-${seg.end}s`}
            color="secondary"
            onClick={() => {
              regionsWs.current
                ?.getRegions()[0]
                .setOptions({ start: seg.start, end: seg.end });
            }}
          />
        ))}
      </Box>
    </Stack>
  );
};
export default WaveSelector;

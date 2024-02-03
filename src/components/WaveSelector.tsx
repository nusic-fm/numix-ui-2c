import { PauseRounded } from "@mui/icons-material";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import {
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import WavesurferPlayer from "@wavesurfer/react";
import { useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Regions from "wavesurfer.js/dist/plugins/regions.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import { Allin1Anaysis } from "../App";
import { getClosesNoInArr } from "../helpers";
import { convertSecondsToHHMMSS } from "../helpers/audio";

// const fullUrl =
//   "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/audio.wav?alt=media";
// const timelineOptions = useRef({
//   height: 15,
//   timeInterval: 0.2,
//   primaryLabelInterval: 1,
//   style: {
//     fontSize: "10px",
//     color: "#fff",
//   },
// });
type Props = {
  url: string;
  analysis?: Allin1Anaysis;
  onSliceSelection?: (start: number, end: number) => void;
};
const WaveSelector = ({ url, analysis, onSliceSelection }: Props) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // const [isDragging, setIsDragging] = useState(false);
  const transitionClsRef = useRef<HTMLDivElement | null>(null);
  const shouldSnapRef = useRef(true);
  const activeRegionRef = useRef(false);

  // const timelineWs = useRef(Timeline.create(timelineOptions.current));
  const regionsWs = useRef(Regions.create());

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    if (onSliceSelection) {
      regionsWs.current.addRegion({
        resize: true,
        drag: true,
        start: 0,
        end: 6,
        color: "rgba(53, 36, 138, 0.37)",
        id: "main",
      });
      regionsWs.current.on("region-out", (region) => {
        if (activeRegionRef.current && region.id === "main") {
          region.play();
        }
      });
      regionsWs.current.on("region-clicked", (region, e) => {
        e.stopPropagation();
        activeRegionRef.current = true;
        region.play();
      });
      regionsWs.current.on("region-updated", (reg) => {
        const start = reg.start;
        const end = reg.end;
        if (analysis && shouldSnapRef.current) {
          const newStart =
            start < analysis.beats[0] / 2
              ? 0
              : getClosesNoInArr(analysis.beats, start);
          const newEnd = getClosesNoInArr(analysis.beats, end);
          reg.setOptions({
            start: newStart,
            end: newEnd,
          });
          onSliceSelection(newStart, newEnd);
        } else onSliceSelection(start, end);
      });
    }
    if (analysis && onSliceSelection) {
      regionsWs.current
        .getRegions()[0]
        .setOptions({ start: analysis.beats[0], end: analysis.beats[15] });

      // TODO:
      onSliceSelection(0, 6);
      // set beats
      analysis.beats.map((b) => {
        regionsWs.current.addRegion({
          start: b,
          // content: (i + 1).toString(),
          color: "rgba(255, 255, 255, 0.2)",
          resize: false,
          drag: false,
        });
      });
    }
  };

  return (
    <Stack width={"80%"} ref={transitionClsRef}>
      <Box display={"flex"} gap={4} position={"relative"} alignItems="center">
        <IconButton onClick={() => wavesurfer?.playPause()}>
          {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
        </IconButton>
        <Typography>
          {convertSecondsToHHMMSS(Math.floor(currentTime))}
        </Typography>
        <Box ml="auto">
          <FormGroup>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Snap to Beats"
              // checked={shouldSnap}
              onChange={(e, checked) => (shouldSnapRef.current = checked)}
            />
          </FormGroup>
        </Box>
      </Box>
      {!wavesurfer && (
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={100}
          animation="wave"
        ></Skeleton>
      )}
      <WavesurferPlayer
        height={100}
        cursorColor="#E26CFF"
        cursorWidth={3}
        // progressColor=""
        waveColor="#573FC8"
        url={url}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeupdate={(ws) => setCurrentTime(ws.getCurrentTime())}
        onInteraction={() => (activeRegionRef.current = false)}
        plugins={useMemo(() => [Timeline.create(), regionsWs.current], [])}
        barWidth={5}
        barGap={5}
        barRadius={5}
      />
      {wavesurfer && (
        <Box
          display={"flex"}
          gap={4}
          my={4}
          // justifyContent="center"
          position={"relative"}
          alignItems="center"
        >
          <Button
            onClick={() => regionsWs.current.getRegions()[0].play()}
            color="info"
            // variant="outlined"
          >
            Play Selected section
          </Button>
          {analysis &&
            analysis.segments.map((seg) => (
              <Chip
                key={seg.start}
                clickable
                label={`${seg.start}-${seg.end}s`}
                color="secondary"
                onClick={() => {
                  regionsWs.current
                    ?.getRegions()[0]
                    .setOptions({ start: seg.start, end: seg.end });
                  if (onSliceSelection) onSliceSelection(seg.start, seg.end);
                }}
              />
            ))}
        </Box>
      )}
    </Stack>
  );
};
export default WaveSelector;

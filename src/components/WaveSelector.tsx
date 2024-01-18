import { Box } from "@mui/system";
import WavesurferPlayer from "@wavesurfer/react";
import { useMemo, useRef, useState } from "react";
import Regions, { RegionParams } from "wavesurfer.js/dist/plugins/regions.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";

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
  const [wavesurfer, setWavesurfer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // const timelineWs = useRef(Timeline.create(timelineOptions.current));
  const regionsWs = useRef(Regions.create());

  const onReady = (ws: any) => {
    setWavesurfer(ws);
    setIsPlaying(false);
    regionsWs.current.enableDragSelection({ color: "rgba(255,255,255,0.2)" });
  };

  return (
    <Box width={"60%"}>
      <WavesurferPlayer
        height={100}
        // progressColor=""
        waveColor="#573FC8"
        url={url}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        plugins={useMemo(() => [Timeline.create(), regionsWs.current], [])}
        barWidth={5}
        barGap={5}
        barRadius={5}
      />
    </Box>
  );
};
export default WaveSelector;

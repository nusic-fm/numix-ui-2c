import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import * as Tone from "tone";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import StopRounded from "@mui/icons-material/StopRounded";
// type Props = {}

const MultiWaveform = ({ vocalsUrl, remixUrl }: any) => {
  //   const containerRef = useRef(null);
  const [, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const instrumentPlayer = useRef<Tone.Player | null>(null);
  const instrumentPitchShiftRef = useRef<Tone.PitchShift>(
    new Tone.PitchShift().toDestination()
  );

  const vocalsPlayer = useRef<Tone.Player | null>();
  const vocalsPitchShiftRef = useRef<Tone.PitchShift>(new Tone.PitchShift());
  const reverbRef = useRef<Tone.Reverb>(new Tone.Reverb().toDestination());
  const delayRef = useRef<Tone.PingPongDelay>(
    new Tone.PingPongDelay("0", 0).toDestination()
  );
  const currentStretchValueRef = useRef(1);
  const currentPitchValueRef = useRef(0);
  //   const multitrack = useMultiTrack(containerRef, vocalsUrl, remixUrl);

  //   const onPlayClick = () => {
  //     if (multitrack?.isPlaying()) {
  //       multitrack?.pause();
  //       setIsPlaying(false);
  //     } else {
  //       multitrack?.play();
  //       setIsPlaying(true);
  //     }
  //   };

  useEffect(() => {
    if (vocalsUrl && remixUrl && !instrumentPlayer.current) {
      //   Tone.Transport.dispose();
      instrumentPlayer.current = new Tone.Player(remixUrl, () => {});
      vocalsPlayer.current = new Tone.Player(vocalsUrl, () => {});

      instrumentPlayer.current.loop = true;
      vocalsPlayer.current.loop = true;

      instrumentPlayer.current.connect(instrumentPitchShiftRef.current);
      vocalsPlayer.current.connect(vocalsPitchShiftRef.current);
      vocalsPitchShiftRef.current.connect(delayRef.current);
      vocalsPitchShiftRef.current.connect(reverbRef.current);

      // Tone.Transport.bpm.value = bpm ?? 83;
      // Tone.Transport.cancel(0);
      setIsLoading(false);
    }
  }, [vocalsUrl, remixUrl]);

  const toggleTransport = () => {
    if (isPlaying) {
      instrumentPlayer.current?.stop(0);
      vocalsPlayer.current?.stop(0);
    } else {
      instrumentPlayer.current?.start(0);
      vocalsPlayer.current?.start(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const onReverbChange = async (newReverbVal: number) => {
    if (reverbRef.current) {
      reverbRef.current.decay = newReverbVal * 10;
      reverbRef.current.wet.value = newReverbVal ** 0.3;
      await reverbRef.current.ready;
    }
  };

  const onDelayChange = (newDelayVal: number) => {
    if (delayRef.current) {
      const now = Tone.now();
      delayRef.current.wet.linearRampToValueAtTime(
        newDelayVal ** 0.3 * 0.3,
        now + 0.1
      );
      delayRef.current.delayTime.linearRampToValueAtTime(
        0.9 - newDelayVal * 0.6,
        now + 0.1
      );
      delayRef.current.feedback.linearRampToValueAtTime(
        newDelayVal * 0.2,
        now + 0.1
      );
    }
  };

  const updatePitchShift = () => {
    if (instrumentPlayer.current && vocalsPlayer.current) {
      const stretchValue = currentStretchValueRef.current;

      instrumentPlayer.current.playbackRate = stretchValue;
      vocalsPlayer.current.playbackRate = stretchValue;
      // Combine pitch shift due to stretch and current pitch slider value
      const pitchAdjustment = Math.log2(stretchValue) * 12; // Convert rate change to semitones
      instrumentPitchShiftRef.current.pitch =
        currentPitchValueRef.current - pitchAdjustment;
      vocalsPitchShiftRef.current.pitch =
        currentPitchValueRef.current - pitchAdjustment;
    }
  };

  return (
    <Box width={"60%"}>
      <IconButton onClick={toggleTransport}>
        {isPlaying ? <StopRounded /> : <PlayArrowRoundedIcon />}
      </IconButton>
      <Stack>
        <Box
          display={"flex"}
          gap={2}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <Typography>Instrument</Typography>
          <Box display={"flex"} alignItems="center">
            <IconButton
              onClick={() => {
                const a = document.createElement("a");

                a.href = remixUrl;
                a.setAttribute("download", "audio.wav");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              <DownloadRounded />
            </IconButton>
            <Checkbox
              disabled
              defaultChecked
              onChange={(e, checked) => {
                if (instrumentPlayer.current) {
                  instrumentPlayer.current.mute = !checked;
                }
              }}
            />
          </Box>
        </Box>
        <Box
          display={"flex"}
          gap={2}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <Typography>Vocals</Typography>
          <Box display={"flex"} alignItems="center">
            <IconButton
              onClick={() => {
                const a = document.createElement("a");

                a.href = vocalsUrl;
                a.setAttribute("download", "audio.wav");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              <DownloadRounded />
            </IconButton>
            <Checkbox
              defaultChecked
              onChange={(e, checked) => {
                if (vocalsPlayer.current) vocalsPlayer.current.mute = !checked;
              }}
            />
          </Box>
        </Box>
        <Divider />
        <Box mt={2} display={"flex"} gap={4}>
          <Typography>Delay</Typography>
          <Slider
            min={0}
            max={1}
            step={0.01}
            defaultValue={0}
            onChange={(e, val) => onDelayChange(val as number)}
            marks
          />
        </Box>
        <Box mt={2} display={"flex"} gap={4}>
          <Typography>Reverb</Typography>
          <Slider
            min={0}
            max={1}
            step={0.01}
            defaultValue={0}
            onChange={(e, val) => onReverbChange(val as number)}
            marks
          />
        </Box>
        <Box mt={2} display={"flex"} gap={4}>
          <Typography>Pitch Shift</Typography>
          <Slider
            min={-6}
            max={6}
            defaultValue={0}
            onChange={(e, val) => {
              currentPitchValueRef.current = val as number;
              updatePitchShift();
            }}
            marks
          />
        </Box>
        <Box mt={2} display={"flex"} gap={4}>
          <Typography>Tempo</Typography>
          <Slider
            min={0.5}
            max={2}
            step={0.01}
            defaultValue={1}
            onChange={(e, val) => {
              currentStretchValueRef.current = val as number;
              updatePitchShift();
            }}
            marks
          />
        </Box>
      </Stack>
      {/* <div ref={containerRef} style={{ width: "100%" }} /> */}
    </Box>
  );
};

export default MultiWaveform;

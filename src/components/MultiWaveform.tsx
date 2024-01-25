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
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import * as Tone from "tone";
// type Props = {}

const MultiWaveform = ({ vocalsUrl, remixUrl, bpm }: any) => {
  //   const containerRef = useRef(null);
  const [, setIsLoading] = useState(true);
  const [isPlaying] = useState(false);

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

      Tone.Transport.bpm.value = bpm ?? 83;
      Tone.Transport.cancel(0);
      setIsLoading(false);
    }
  }, [vocalsUrl, remixUrl]);

  const toggleTransport = () => {
    if (Tone.Transport.state !== "started") {
      instrumentPlayer.current?.start(0);
      vocalsPlayer.current?.start(0);
    } else {
      instrumentPlayer.current?.stop(0);
      vocalsPlayer.current?.stop(0);
    }
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
        {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
      </IconButton>
      <Stack>
        <Box
          display={"flex"}
          gap={2}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <Typography>Instrument</Typography>
          <Checkbox
            defaultChecked
            onChange={(e, checked) => {
              if (checked && instrumentPlayer.current) {
                instrumentPlayer.current.mute = false;
              } else {
                if (instrumentPlayer.current)
                  instrumentPlayer.current.mute = true;
              }
            }}
          />
        </Box>
        <Box
          display={"flex"}
          gap={2}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <Typography>Vocals</Typography>
          <Checkbox
            defaultChecked
            onChange={(e, checked) => {
              if (checked && vocalsPlayer.current) {
                vocalsPlayer.current.mute = false;
              } else {
                if (vocalsPlayer.current) vocalsPlayer.current.mute = true;
              }
            }}
          />
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

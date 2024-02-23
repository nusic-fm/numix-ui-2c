/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Pause from "@mui/icons-material/Pause";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  Fab,
  IconButton,
  Skeleton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import * as wavesAudio from "waves-audio";
import * as wavesLoaders from "waves-loaders";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import { useWavesurfer } from "../hooks/useWavesurfer";
// import wavesUI from "waves-ui";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { FX_PARAMS } from "../App";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

const sliderSize = {
  height: "14px",
  ".MuiSlider-thumb": {
    width: "18px",
    height: "35px",
    borderRadius: "6px",
  },
};
const AudioComponent = ({
  vocalsUrl,
  instrumentalUrl,
  selectedGenre,
  vid,
  onFinish,
  musicInfo,
  initialProps,
  onBack,
}: {
  vocalsUrl: string;
  instrumentalUrl?: string;
  selectedGenre: string;
  vid: string;
  onFinish: (params: FX_PARAMS) => void;
  initialProps?: FX_PARAMS;
  musicInfo?: { title: string; tag: string };
  onBack: () => void;
}) => {
  const containerRef = useRef(null);
  //   const [currentTime, setCurrentTime] = useState(0);
  const wavesurfer = useWavesurfer(containerRef, instrumentalUrl ?? "");
  const [audioContext, setAudioContext] = useState<any>(
    wavesAudio.audioContext
  );
  const [loader] = useState(new wavesLoaders.AudioBufferLoader());
  const [reverbBuffer, setReverbBuffer] = useState(null);

  // State variables
  const [speedFactor, setSpeedFactor] = useState(1);
  const [pitchFactor, setPitchFactor] = useState(1);
  const [vocalGain, setVocalGain] = useState(1);
  const [instrGain, setInstrGain] = useState(1.0);
  const [warpBypassed, setWarpBypassed] = useState(false);
  const [fxBypassed, setFxBypassed] = useState(false);
  const [delayTime, setDelayTime] = useState(0.5);
  const [delayFeedback, setDelayFeedback] = useState(0.4);
  const [delayCutoff, setDelayCutoff] = useState(1000);
  const [delayGain, setDelayGain] = useState(0);
  const [reverbGain, setReverbGain] = useState(0);
  const [flangerDelayTime, setFlangerDelayTime] = useState(0.005);
  const [flangerDepth, setFlangerDepth] = useState(0.0025);
  const [flangerRate, setFlangerRate] = useState(0.6);
  const [flangerFeedback, setFlangerFeedback] = useState(0.7);
  const [flangerCutoff, setFlangerCutoff] = useState(1000);
  const [flangerGain, setFlangerGain] = useState(0.0);
  const [noWorkletVisible, setNoWorkletVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstrMuted, setIsInstrMuted] = useState(false);
  const [instrDurationInSec, setInstrDurationInSec] = useState<number>(0);

  const vocalPlayControlRef = useRef<any>(null);
  const vocalPhaseVocoderNodeRef = useRef<any>(null);
  const instrPlayControlRef = useRef<any>(null);
  const instrPhaseVocoderNodeRef = useRef<any>(null);
  const instrGainNodeRef = useRef<null | GainNode>(null);
  const delayGainNodeRef = useRef<null | GainNode>(null);
  const reverbGainNodeRef = useRef<null | GainNode>(null);
  const flangerGainNodeRef = useRef<null | GainNode>(null);
  const vocalsGainNodeRef = useRef<null | GainNode>(null);

  useEffect(() => {
    const intervalForCursor = setInterval(() => {
      if (wavesurfer && instrPlayControlRef.current && instrumentalUrl) {
        const currentPosition = instrPlayControlRef.current.currentPosition;

        wavesurfer?.setTime(currentPosition);
      }
    }, 10);
    return () => clearInterval(intervalForCursor);
  }, [wavesurfer]);

  const setupEngine = async (buffer: any, gain = 1.0) => {
    const playerEngine = new wavesAudio.PlayerEngine(buffer);
    playerEngine.buffer = buffer;
    playerEngine.cyclic = true;

    await audioContext.audioWorklet.addModule("phase-vocoder.js");
    console.log("Success");
    const phaseVocoderNode = new AudioWorkletNode(
      audioContext,
      "phase-vocoder-processor"
    );
    const gainNode = new GainNode(audioContext, { gain: gain });
    playerEngine.connect(phaseVocoderNode);
    phaseVocoderNode.connect(gainNode);

    return [playerEngine, phaseVocoderNode, gainNode];
  };
  const setupDelay = (audioContext: any) => {
    const delayNode = new DelayNode(audioContext, { delayTime: delayTime });
    const delayFeedbackNode = new GainNode(audioContext, {
      gain: delayFeedback,
    });
    const delayFilterNode = new BiquadFilterNode(audioContext, {
      type: "lowpass",
      frequency: delayCutoff,
    });
    const delayGainNode = new GainNode(audioContext, { gain: delayGain });

    delayNode.connect(delayFilterNode);
    delayFilterNode.connect(delayFeedbackNode);
    delayFeedbackNode.connect(delayNode); // Feedback loop
    delayNode.connect(delayGainNode);

    return { delayNode, delayGainNode };
  };
  const setupReverb = (audioContext: any, reverbBuffer: any) => {
    const reverbNode = new ConvolverNode(audioContext, {
      buffer: reverbBuffer,
    });
    const reverbGainNode = new GainNode(audioContext, { gain: reverbGain });

    reverbNode.connect(reverbGainNode);

    return { reverbNode, reverbGainNode };
  };
  const setupFlanger = (audioContext: any) => {
    const flangerDelayNode = new DelayNode(audioContext, {
      delayTime: flangerDelayTime,
    });
    const flangerFeedbackNode = new GainNode(audioContext, {
      gain: flangerFeedback,
    });
    const flangerFilterNode = new BiquadFilterNode(audioContext, {
      type: "lowpass",
      frequency: flangerCutoff,
    });
    const flangerDepthNode = new GainNode(audioContext, { gain: flangerDepth });
    const flangerOscillatorNode = new OscillatorNode(audioContext, {
      type: "sine",
      frequency: flangerRate,
    });
    const flangerGainNode = new GainNode(audioContext, { gain: flangerGain });

    flangerOscillatorNode.connect(flangerDepthNode);
    flangerDepthNode.connect(flangerDelayNode.delayTime);
    flangerDelayNode.connect(flangerFeedbackNode);
    flangerFeedbackNode.connect(flangerFilterNode);
    flangerFilterNode.connect(flangerDelayNode);
    flangerDelayNode.connect(flangerGainNode);
    flangerOscillatorNode.start();

    return { flangerDelayNode, flangerGainNode };
  };

  const initInstr = async () => {
    const instrBuffer = await loader.load(instrumentalUrl);

    // Instrumental Setup
    const [instrPlayerEngine, instrPhaseVocoderNode, instrGainNode] =
      await setupEngine(instrBuffer);
    const instrPlayControl = new wavesAudio.PlayControl(instrPlayerEngine);
    instrPlayControl.setLoopBoundaries(0, instrBuffer.duration);
    instrPlayControl.loop = true;
    setInstrDurationInSec(instrBuffer.duration);

    instrGainNode.connect(audioContext.destination);

    instrGainNodeRef.current = instrGainNode;
    instrPlayControlRef.current = instrPlayControl;
    instrPhaseVocoderNodeRef.current = instrPhaseVocoderNode;
    if (isPlaying) {
      instrPlayControl.seek(vocalPlayControlRef.current.currentPosition);
      instrPlayControl.start();
    }
  };

  useEffect(() => {
    if (instrumentalUrl) {
      initInstr();
    }
  }, [instrumentalUrl]);

  useEffect(() => {
    const init = async () => {
      if (audioContext.audioWorklet === undefined) {
        setNoWorkletVisible(true);
        return;
      }
      const vocalBuffer = await loader.load(vocalsUrl);
      // Vocals Setup
      const [vocalPlayerEngine, vocalPhaseVocoderNode, vocalGainNode] =
        await setupEngine(vocalBuffer);
      const vocalPlayControl = new wavesAudio.PlayControl(vocalPlayerEngine);
      vocalPlayControl.setLoopBoundaries(0, vocalBuffer.duration);
      vocalPlayControl.loop = true;

      const { delayNode, delayGainNode } = setupDelay(audioContext);
      const reverbBuffer = await loader.load("./rir.wav");
      const { reverbNode, reverbGainNode } = setupReverb(
        audioContext,
        reverbBuffer
      );
      const { flangerDelayNode, flangerGainNode } = setupFlanger(audioContext);

      vocalGainNode.connect(audioContext.destination);

      vocalGainNode.connect(delayNode);
      delayGainNode.connect(audioContext.destination);
      vocalGainNode.connect(reverbNode);
      reverbGainNode.connect(audioContext.destination);
      vocalGainNode.connect(flangerDelayNode);
      flangerGainNode.connect(audioContext.destination);

      vocalsGainNodeRef.current = vocalGainNode;
      vocalPlayControlRef.current = vocalPlayControl;
      vocalPhaseVocoderNodeRef.current = vocalPhaseVocoderNode;
      delayGainNodeRef.current = delayGainNode;
      reverbGainNodeRef.current = reverbGainNode;
      flangerGainNodeRef.current = flangerGainNode;
      // instrGainNodeRef.current.gain.value = 1.0;
      //   setupInstrBypassButton(instrGainNode);
      //   setupWarpBypassButton(
      //     vocalPlayControl,
      //     vocalPhaseVocoderNode,
      //     instrPlayControl,
      //     instrPhaseVocoderNode
      //   );
      //   setupFXBypassButton(delayGainNode, reverbGainNode, flangerGainNode);

      //   setupPlayPauseButton(vocalPlayControl, instrPlayControl);
      //   setupSpeedSlider(
      //     vocalPlayControl,
      //     vocalPhaseVocoderNode,
      //     instrPlayControl,
      //     instrPhaseVocoderNode
      //   );
      //   setupPitchSlider(vocalPhaseVocoderNode, instrPhaseVocoderNode);
      //   setupVocalSlider(vocalGainNode);
      //   setupDelaySlider(delayGainNode);
      //   setupReverbSlider(reverbGainNode);
      //   setupFlangerSlider(flangerGainNode);
      //   setupTimeline(vocalBuffer, vocalPlayControl);
      setIsLoading(false);
    };

    init();

    // Clean-up function
    return () => {
      // Perform any necessary clean-up
    };
  }, []); // Empty dependency array to run the effect only once

  useEffect(() => {
    if (initialProps) {
      setDelayTime(initialProps.delayTime);
      setFlangerGain(initialProps.flangerGain);
      setFxBypassed(initialProps.fxBypassed);
      setInstrGain(initialProps.instrGain);
      setPitchFactor(initialProps.pitchFactor);
      setReverbGain(initialProps.reverbGain);
      setSpeedFactor(initialProps.speedFactor);
      setVocalGain(initialProps.vocalGain);
      setWarpBypassed(initialProps.warpBypassed);
    }
  }, [initialProps]);

  return (
    <Box
      px={{ xs: "5%", md: "10%", lg: "15%" }}
      sx={{ background: "#000" }}
      // height="100vh"
      p={4}
    >
      {/* <Box display={"flex"} justifyContent="end" px={4} mb={2}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
      </Box> */}
      <Stack sx={{ backgroundColor: "#242424" }} p={4} borderRadius="58px">
        <Box
          display={"flex"}
          gap={2}
          justifyContent="space-between"
          borderRadius="50px"
          sx={{ background: "#141414" }}
          p={2}
          alignItems="center"
        >
          <Box display={"flex"} gap={2} alignItems="center">
            <Box
              width={70}
              height={70}
              borderRadius="50%"
              sx={{
                background: `url('https://i.ytimg.com/vi/${vid}/maxresdefault.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <Box>
              <Typography>{musicInfo?.title}</Typography>
              <Typography variant="caption">{musicInfo?.tag}</Typography>
            </Box>
          </Box>
          <Stack>
            <Typography sx={{ color: "#686363" }} variant="caption">
              Genre
            </Typography>
            <Typography>{selectedGenre}</Typography>
          </Stack>
        </Box>
        <Box
          display={"flex"}
          gap={2}
          alignItems="center"
          p={2}
          position="relative"
        >
          <Box>
            <Fab
              sx={{
                background:
                  "linear-gradient(90deg, rgba(84,50,255,1) 0%, rgba(237,50,255,1) 100%)",
              }}
              onClick={() => {
                if (audioContext.state === "suspended") {
                  audioContext.resume();
                }
                if (!isPlaying) {
                  instrPlayControlRef.current?.start();
                  vocalPlayControlRef.current.start();
                  setIsPlaying(true);
                } else {
                  instrPlayControlRef.current.pause();
                  vocalPlayControlRef.current.pause();
                  setIsPlaying(false);
                }
              }}
            >
              {isPlaying ? (
                <Pause color="secondary" fontSize="large" />
              ) : isLoading ? (
                <CircularProgress size="24px" color="secondary" />
              ) : (
                <PlayArrowRounded color="secondary" fontSize="large" />
              )}
            </Fab>
          </Box>
          {instrumentalUrl ? (
            <Box display={"flex"} width="100%" height={"100%"}>
              <Box
                sx={{ bgcolor: "rgba(0,0,0,0.7)" }}
                height="60px"
                width={"40%"}
                display="flex"
                alignItems={"center"}
                justifyContent="center"
                borderRadius={2}
              >
                <LockRoundedIcon />
              </Box>
              <div ref={containerRef} style={{ width: "20%" }}></div>
              <Box
                sx={{ bgcolor: "rgba(0,0,0,0.7)" }}
                height="60px"
                width={100}
                display="flex"
                alignItems={"center"}
                justifyContent="center"
                borderRadius={2}
              >
                <LockRoundedIcon />
              </Box>
            </Box>
          ) : (
            <Skeleton
              width={"60%"}
              height="40px"
              variant="rounded"
              animation="wave"
            />
          )}

          {/* <Box
            width={"calc(60% + 56px)"}
            position={"absolute"}
            height="100%"
            display={"flex"}
            justifyContent="end"
            alignItems={"center"}
            zIndex={99}
          >
            <Box
              sx={{ bgcolor: "rgba(0,0,0,0.7)" }}
              height="80%"
              width={100}
              display="flex"
              alignItems={"center"}
              justifyContent="center"
              borderRadius={2}
            >
              <LockRoundedIcon />
            </Box>
          </Box> */}
          <Typography variant="caption">
            00:{instrDurationInSec.toFixed(0)}
          </Typography>
          <IconButton
            sx={{ ml: "auto" }}
            onClick={() => {
              if (instrumentalUrl) {
                const a = document.createElement("a");
                a.href = instrumentalUrl;
                a.setAttribute("download", "instr.wav");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
              const b = document.createElement("a");
              b.href = vocalsUrl;
              b.setAttribute("download", "vocals.wav");
              document.body.appendChild(b);
              b.click();
              document.body.removeChild(b);
            }}
          >
            <DownloadRounded color="secondary" />
          </IconButton>
        </Box>
        <Box
          mt={2}
          px={2}
          display="flex"
          alignItems={"center"}
          justifyContent="space-between"
        >
          <Chip label="Intrument FX" />
          <Box
            display="flex"
            alignItems={"center"}
            justifyContent="space-between"
          >
            <IconButton
            // onClick={() => {
            //   setIsInstrMuted(!isInstrMuted);
            //   if (instrGainNodeRef.current)
            //     instrGainNodeRef.current.gain.value = isInstrMuted ? 1 : 0;
            // }}
            >
              <AutoAwesomeRoundedIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsInstrMuted(!isInstrMuted);
                if (instrGainNodeRef.current)
                  instrGainNodeRef.current.gain.value = isInstrMuted ? 1 : 0;
              }}
            >
              {isInstrMuted ? (
                <VolumeOffRoundedIcon fontSize="small" />
              ) : (
                <VolumeUpRoundedIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton
              color={warpBypassed ? "error" : "success"}
              onClick={() => {
                const newWarpBypassed = !warpBypassed;
                if (newWarpBypassed) {
                  vocalPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  ).value = 1.0;
                  instrPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  ).value = 1.0;
                  vocalPlayControlRef.current.speed = 1.0;
                  instrPlayControlRef.current.speed = 1.0;
                } else {
                  vocalPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  ).value = (pitchFactor * 1) / speedFactor;
                  instrPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  ).value = (pitchFactor * 1) / speedFactor;
                  vocalPlayControlRef.current.speed = speedFactor;
                  instrPlayControlRef.current.speed = speedFactor;
                }
                setWarpBypassed(newWarpBypassed);
              }}
            >
              <PowerSettingsNewOutlinedIcon />
            </IconButton>
          </Box>
        </Box>
        <Box display={"flex"} justifyContent="center" gap={2} my={2} px={2}>
          <Stack width={200} flexBasis="50%">
            <Typography gutterBottom>Speed</Typography>
            <Slider
              disabled={!instrumentalUrl}
              sx={sliderSize}
              color="info"
              valueLabelDisplay="auto"
              getAriaValueText={(v) => v.toString()}
              min={0.5}
              max={1.5}
              step={0.01}
              defaultValue={1}
              // value={speedFactor}
              // marks
              onChange={(e, newVal) => {
                const newSpeedFactor = newVal as number;
                setSpeedFactor(newSpeedFactor);
                if (warpBypassed) return;
                const vocalPitchFactorParam =
                  vocalPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  );
                const instrPitchFactorParam =
                  vocalPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  );
                vocalPlayControlRef.current.speed = warpBypassed
                  ? 1.0
                  : newSpeedFactor;
                instrPlayControlRef.current.speed = warpBypassed
                  ? 1.0
                  : newSpeedFactor;
                vocalPitchFactorParam.value = warpBypassed
                  ? 1.0
                  : (pitchFactor * 1) / speedFactor;
                instrPitchFactorParam.value = warpBypassed
                  ? 1.0
                  : (pitchFactor * 1) / speedFactor;
              }}
            />
          </Stack>
          <Box>
            <Divider orientation="vertical" variant="middle" />
          </Box>
          <Stack width={200} flexBasis="50%">
            <Typography gutterBottom>Pitch</Typography>
            <Slider
              disabled={!instrumentalUrl}
              sx={sliderSize}
              color="info"
              valueLabelDisplay="auto"
              getAriaValueText={(v) => v.toString()}
              min={0.5}
              max={1.5}
              step={0.01}
              defaultValue={1}
              // value={pitchFactor}
              // marks
              onChange={(e, newVal) => {
                const newSpeedFactor = newVal as number;
                setPitchFactor(newSpeedFactor);
                if (warpBypassed) return;
                const vocalPitchFactorParam =
                  vocalPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  );
                const instrPitchFactorParam =
                  vocalPhaseVocoderNodeRef.current.parameters.get(
                    "pitchFactor"
                  );

                vocalPitchFactorParam.value = warpBypassed
                  ? 1.0
                  : (pitchFactor * 1) / speedFactor;
                instrPitchFactorParam.value = warpBypassed
                  ? 1.0
                  : (pitchFactor * 1) / speedFactor;
              }}
            />
          </Stack>
        </Box>

        <Box
          mt={2}
          px={2}
          display="flex"
          alignItems={"center"}
          justifyContent="space-between"
        >
          <Chip label="Vocal FX" />
          <IconButton
            color={fxBypassed ? "error" : "success"}
            onClick={() => {
              const newFxBypassed = !fxBypassed;
              if (newFxBypassed) {
                // Set effect gains to 0 to bypass effects
                if (delayGainNodeRef.current)
                  delayGainNodeRef.current.gain.value = 0;
                if (reverbGainNodeRef.current)
                  reverbGainNodeRef.current.gain.value = 0;
                if (flangerGainNodeRef.current)
                  flangerGainNodeRef.current.gain.value = 0;
                if (vocalsGainNodeRef.current)
                  vocalsGainNodeRef.current.gain.value = 1;
              } else {
                if (delayGainNodeRef.current)
                  delayGainNodeRef.current.gain.value = delayGain;
                if (reverbGainNodeRef.current)
                  reverbGainNodeRef.current.gain.value = reverbGain;
                if (flangerGainNodeRef.current)
                  flangerGainNodeRef.current.gain.value = flangerGain;
                if (vocalsGainNodeRef.current)
                  vocalsGainNodeRef.current.gain.value = vocalGain;
              }
              setFxBypassed(newFxBypassed);
            }}
          >
            <PowerSettingsNewOutlinedIcon />
          </IconButton>
        </Box>
        <Box display={"flex"} gap={4} my={2} px={2}>
          <Stack width={200} flexBasis="25%">
            <Typography gutterBottom>Delay</Typography>
            <Slider
              sx={sliderSize}
              color="info"
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => v.toFixed(2)}
              min={0}
              max={0.75}
              step={0.01}
              defaultValue={0}
              // value={delayGain}
              // marks
              onChange={(e, newVal) => {
                const _delayGain = (newVal as number) ** 0.9;
                setDelayGain(_delayGain);
                if (fxBypassed) return;
                if (delayGainNodeRef.current)
                  delayGainNodeRef.current.gain.value = fxBypassed
                    ? 0
                    : _delayGain;
              }}
            />
          </Stack>

          <Box>
            <Divider orientation="vertical" variant="middle" />
          </Box>
          <Stack width={200} flexBasis="25%">
            <Typography gutterBottom>Reverb</Typography>
            <Slider
              sx={sliderSize}
              color="info"
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => v.toFixed(2)}
              min={0}
              max={1}
              step={0.01}
              defaultValue={0}
              // value={reverbGain}
              // marks
              onChange={(e, newVal) => {
                const _reverbGain = (newVal as number) ** 0.9;
                setReverbGain(_reverbGain);
                if (fxBypassed) return;
                if (reverbGainNodeRef.current)
                  reverbGainNodeRef.current.gain.value = fxBypassed
                    ? 0
                    : _reverbGain;
              }}
            />
          </Stack>
          <Box>
            <Divider orientation="vertical" variant="middle" />
          </Box>
          <Stack width={200} flexBasis="25%">
            <Typography gutterBottom>Flanger</Typography>
            <Slider
              sx={sliderSize}
              color="info"
              valueLabelDisplay="auto"
              getAriaValueText={(v) => v.toString()}
              min={0}
              max={0.75}
              step={0.01}
              defaultValue={0}
              // value={flangerGain}
              // marks
              onChange={(e, newVal) => {
                const _flangerGain = (newVal as number) ** 0.9;
                setFlangerGain(newVal as number);
                if (fxBypassed) return;
                if (flangerGainNodeRef.current)
                  flangerGainNodeRef.current.gain.value = fxBypassed
                    ? 0
                    : _flangerGain;
              }}
            />
          </Stack>
          <Box>
            <Divider orientation="vertical" variant="middle" />
          </Box>
          <Stack width={200} flexBasis="25%">
            <Typography gutterBottom>Vocal</Typography>
            <Slider
              sx={sliderSize}
              color="info"
              valueLabelDisplay="auto"
              getAriaValueText={(v) => v.toString()}
              min={0}
              max={1}
              step={0.01}
              defaultValue={1}
              // value={vocalGain}
              // marks
              onChange={(e, newVal) => {
                const _vocalGain = (newVal as number) ** 0.9;
                setVocalGain(newVal as number);
                if (fxBypassed) return;
                if (vocalsGainNodeRef.current)
                  vocalsGainNodeRef.current.gain.value = _vocalGain;
              }}
            />
          </Stack>
        </Box>
      </Stack>
      {/* <Box mt={4} display={"flex"} justifyContent="center">
        <Button
          variant="outlined"
          color="info"
          onClick={() =>
            onFinish({
              delayTime,
              flangerGain,
              fxBypassed,
              instrGain,
              pitchFactor,
              reverbGain,
              speedFactor,
              vocalGain,
              warpBypassed,
            })
          }
        >
          Finish
        </Button>
      </Box> */}
    </Box>
  );

  // return (
  //   <div>
  //     {noWorkletVisible && (
  //       <div id="no-worklet" style={{ display: "block" }}>
  //         No Audio Worklet support
  //       </div>
  //     )}
  //     {!noWorkletVisible && (
  //       <Box>
  //         <Box display={"flex"} gap={4}>
  //           <Box display={"flex"} alignItems="center">
  //             <IconButton
  //               onClick={() => {
  //                 if (audioContext.state === "suspended") {
  //                   audioContext.resume();
  //                 }
  //                 if (!isPlaying) {
  //                   instrPlayControlRef.current?.start();
  //                   vocalPlayControlRef.current.start();
  //                   setIsPlaying(true);
  //                 } else {
  //                   instrPlayControlRef.current.pause();
  //                   vocalPlayControlRef.current.pause();
  //                   setIsPlaying(false);
  //                 }
  //               }}
  //             >
  //               {isPlaying ? (
  //                 <Pause />
  //               ) : isLoading ? (
  //                 <CircularProgress size="24px" color="secondary" />
  //               ) : (
  //                 <PlayArrowRounded />
  //               )}
  //             </IconButton>
  //           </Box>
  //           <Stack width={200}>
  //             <Typography>Speed</Typography>
  //             <Slider
  //               valueLabelDisplay="auto"
  //               getAriaValueText={(v) => v.toString()}
  //               min={0.5}
  //               max={1.5}
  //               step={0.01}
  //               defaultValue={1}
  //               // value={speedFactor}
  //               // marks
  //               onChange={(e, newVal) => {
  //                 const vocalPitchFactorParam =
  //                   vocalPhaseVocoderNodeRef.current.parameters.get(
  //                     "pitchFactor"
  //                   );
  //                 const instrPitchFactorParam =
  //                   vocalPhaseVocoderNodeRef.current.parameters.get(
  //                     "pitchFactor"
  //                   );
  //                 const newSpeedFactor = newVal as number;
  //                 vocalPlayControlRef.current.speed = warpBypassed
  //                   ? 1.0
  //                   : newSpeedFactor;
  //                 instrPlayControlRef.current.speed = warpBypassed
  //                   ? 1.0
  //                   : newSpeedFactor;
  //                 vocalPitchFactorParam.value = warpBypassed
  //                   ? 1.0
  //                   : (pitchFactor * 1) / speedFactor;
  //                 instrPitchFactorParam.value = warpBypassed
  //                   ? 1.0
  //                   : (pitchFactor * 1) / speedFactor;
  //                 setSpeedFactor(newSpeedFactor);
  //               }}
  //             />
  //           </Stack>
  //           <Stack width={200}>
  //             <Typography>Pitch</Typography>
  //             <Slider
  //               valueLabelDisplay="auto"
  //               getAriaValueText={(v) => v.toString()}
  //               min={0.5}
  //               max={1.5}
  //               step={0.01}
  //               defaultValue={1}
  //               // value={pitchFactor}
  //               // marks
  //               onChange={(e, newVal) => {
  //                 const vocalPitchFactorParam =
  //                   vocalPhaseVocoderNodeRef.current.parameters.get(
  //                     "pitchFactor"
  //                   );
  //                 const instrPitchFactorParam =
  //                   vocalPhaseVocoderNodeRef.current.parameters.get(
  //                     "pitchFactor"
  //                   );
  //                 const newSpeedFactor = newVal as number;

  //                 vocalPitchFactorParam.value = warpBypassed
  //                   ? 1.0
  //                   : (pitchFactor * 1) / speedFactor;
  //                 instrPitchFactorParam.value = warpBypassed
  //                   ? 1.0
  //                   : (pitchFactor * 1) / speedFactor;
  //                 setPitchFactor(newSpeedFactor);
  //               }}
  //             />
  //           </Stack>
  //           <Stack width={200}>
  //             <Typography>Vocal</Typography>
  //             <Slider
  //               valueLabelDisplay="auto"
  //               getAriaValueText={(v) => v.toString()}
  //               min={0}
  //               max={1}
  //               step={0.01}
  //               defaultValue={1}
  //               // value={vocalGain}
  //               // marks
  //               onChange={(e, newVal) => {
  //                 const _vocalGain = (newVal as number) ** 0.9;
  //                 if (vocalsGainNodeRef.current)
  //                   vocalsGainNodeRef.current.gain.value = _vocalGain;
  //                 setVocalGain(newVal as number);
  //               }}
  //             />
  //           </Stack>
  //           <Stack width={200}>
  //             <Typography>Delay</Typography>
  //             <Slider
  //               valueLabelDisplay="auto"
  //               valueLabelFormat={(v) => v.toFixed(2)}
  //               min={0}
  //               max={0.75}
  //               step={0.01}
  //               defaultValue={0}
  //               // value={delayGain}
  //               // marks
  //               onChange={(e, newVal) => {
  //                 const _delayGain = (newVal as number) ** 0.9;
  //                 if (delayGainNodeRef.current)
  //                   delayGainNodeRef.current.gain.value = fxBypassed
  //                     ? 0
  //                     : _delayGain;
  //                 setDelayGain(_delayGain);
  //               }}
  //             />
  //           </Stack>
  //           <Stack width={200}>
  //             <Typography>Reverb</Typography>
  //             <Slider
  //               valueLabelDisplay="auto"
  //               valueLabelFormat={(v) => v.toFixed(2)}
  //               min={0}
  //               max={1}
  //               step={0.01}
  //               defaultValue={0}
  //               // value={reverbGain}
  //               // marks
  //               onChange={(e, newVal) => {
  //                 const _reverbGain = (newVal as number) ** 0.9;
  //                 if (reverbGainNodeRef.current)
  //                   reverbGainNodeRef.current.gain.value = fxBypassed
  //                     ? 0
  //                     : _reverbGain;
  //                 setReverbGain(_reverbGain);
  //               }}
  //             />
  //           </Stack>
  //           <Stack width={200}>
  //             <Typography>Flanger</Typography>
  //             <Slider
  //               valueLabelDisplay="auto"
  //               getAriaValueText={(v) => v.toString()}
  //               min={0}
  //               max={0.75}
  //               step={0.01}
  //               defaultValue={0}
  //               // value={flangerGain}
  //               // marks
  //               onChange={(e, newVal) => {
  //                 const _flangerGain = (newVal as number) ** 0.9;
  //                 if (flangerGainNodeRef.current)
  //                   flangerGainNodeRef.current.gain.value = fxBypassed
  //                     ? 0
  //                     : _flangerGain;

  //                 setFlangerGain(newVal as number);
  //               }}
  //             />
  //           </Stack>
  //         </Box>
  //         <Button
  //           color="secondary"
  //           variant="outlined"
  //           onClick={() => {
  //             const newInstrGain = instrGain === 0.0 ? 1.0 : 0.0;
  //             if (instrGainNodeRef.current)
  //               instrGainNodeRef.current.gain.value = newInstrGain;
  //             setInstrGain(newInstrGain);
  //           }}
  //         >
  //           {instrGain === 0.0 ? "Enable Instr" : "Bypass Instr"}
  //         </Button>
  //         <Button
  //           color="secondary"
  //           variant="outlined"
  //           onClick={() => {
  //             const newWarpBypassed = !warpBypassed;
  //             if (newWarpBypassed) {
  //               vocalPhaseVocoderNodeRef.current.parameters.get(
  //                 "pitchFactor"
  //               ).value = 1.0;
  //               instrPhaseVocoderNodeRef.current.parameters.get(
  //                 "pitchFactor"
  //               ).value = 1.0;
  //               vocalPlayControlRef.current.speed = 1.0;
  //               instrPlayControlRef.current.speed = 1.0;
  //             } else {
  //               vocalPhaseVocoderNodeRef.current.parameters.get(
  //                 "pitchFactor"
  //               ).value = (pitchFactor * 1) / speedFactor;
  //               instrPhaseVocoderNodeRef.current.parameters.get(
  //                 "pitchFactor"
  //               ).value = (pitchFactor * 1) / speedFactor;
  //               vocalPlayControlRef.current.speed = speedFactor;
  //               instrPlayControlRef.current.speed = speedFactor;
  //             }
  //             setWarpBypassed(newWarpBypassed);
  //           }}
  //         >
  //           {warpBypassed ? "Enable Warp" : "Bypass Warp"}
  //         </Button>
  //         <Button
  //           color="secondary"
  //           variant="outlined"
  //           onClick={() => {
  //             const newFxBypassed = !fxBypassed;
  //             if (newFxBypassed) {
  //               // Set effect gains to 0 to bypass effects
  //               if (delayGainNodeRef.current)
  //                 delayGainNodeRef.current.gain.value = 0;
  //               if (reverbGainNodeRef.current)
  //                 reverbGainNodeRef.current.gain.value = 0;
  //               if (flangerGainNodeRef.current)
  //                 flangerGainNodeRef.current.gain.value = 0;
  //             } else {
  //               if (delayGainNodeRef.current)
  //                 delayGainNodeRef.current.gain.value = delayGain;
  //               if (reverbGainNodeRef.current)
  //                 reverbGainNodeRef.current.gain.value = reverbGain;
  //               if (flangerGainNodeRef.current)
  //                 flangerGainNodeRef.current.gain.value = flangerGain;
  //             }
  //             setFxBypassed(newFxBypassed);
  //           }}
  //         >
  //           {fxBypassed ? "Enable FX" : "Bypass FX"}
  //         </Button>
  //         <Button
  //           startIcon={<DownloadRounded />}
  //           color="secondary"
  //           variant="outlined"
  //           onClick={() => {
  //             const a = document.createElement("a");
  //             a.href = instrumentalUrl;
  //             a.setAttribute("download", "instr.wav");
  //             document.body.appendChild(a);
  //             a.click();
  //             document.body.removeChild(a);
  //             const b = document.createElement("a");
  //             b.href = vocalsUrl;
  //             b.setAttribute("download", "vocals.wav");
  //             document.body.appendChild(b);
  //             b.click();
  //             document.body.removeChild(b);
  //           }}
  //         >
  //           Instr & vocals
  //         </Button>
  //       </Box>
  //     )}
  //   </div>
  // );
};

export default AudioComponent;

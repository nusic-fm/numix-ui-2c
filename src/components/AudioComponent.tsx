/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PauseCircleRounded } from "@mui/icons-material";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import { Button, IconButton, Slider, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import * as wavesAudio from "waves-audio";
import * as wavesLoaders from "waves-loaders";
// import wavesUI from "waves-ui";

const AudioComponent = () => {
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

  const vocalPlayControlRef = useRef<any>(null);
  const vocalPhaseVocoderNodeRef = useRef<any>(null);
  const instrPlayControlRef = useRef<any>(null);
  const instrPhaseVocoderNodeRef = useRef<any>(null);
  const instrGainNodeRef = useRef<null | GainNode>(null);
  const delayGainNodeRef = useRef<null | GainNode>(null);
  const reverbGainNodeRef = useRef<null | GainNode>(null);
  const flangerGainNodeRef = useRef<null | GainNode>(null);
  const vocalsGainNodeRef = useRef<null | GainNode>(null);

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

  useEffect(() => {
    const init = async () => {
      if (audioContext.audioWorklet === undefined) {
        setNoWorkletVisible(true);
        return;
      }
      const vocalBuffer = await loader.load(
        "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
      );
      const instrBuffer = await loader.load(
        "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
      );
      // Vocals Setup
      const [vocalPlayerEngine, vocalPhaseVocoderNode, vocalGainNode] =
        await setupEngine(vocalBuffer);
      const vocalPlayControl = new wavesAudio.PlayControl(vocalPlayerEngine);
      vocalPlayControl.setLoopBoundaries(0, vocalBuffer.duration);
      vocalPlayControl.loop = true;
      // Instrumental Setup
      const [instrPlayerEngine, instrPhaseVocoderNode, instrGainNode] =
        await setupEngine(instrBuffer);
      const instrPlayControl = new wavesAudio.PlayControl(instrPlayerEngine);
      instrPlayControl.setLoopBoundaries(0, instrBuffer.duration);
      instrPlayControl.loop = true;

      const { delayNode, delayGainNode } = setupDelay(audioContext);
      const reverbBuffer = await loader.load("./rir.wav");
      const { reverbNode, reverbGainNode } = setupReverb(
        audioContext,
        reverbBuffer
      );
      const { flangerDelayNode, flangerGainNode } = setupFlanger(audioContext);

      vocalGainNode.connect(audioContext.destination);
      instrGainNode.connect(audioContext.destination);

      vocalGainNode.connect(delayNode);
      delayGainNode.connect(audioContext.destination);
      vocalGainNode.connect(reverbNode);
      reverbGainNode.connect(audioContext.destination);
      vocalGainNode.connect(flangerDelayNode);
      flangerGainNode.connect(audioContext.destination);

      vocalsGainNodeRef.current = vocalGainNode;
      vocalPlayControlRef.current = vocalPlayControl;
      vocalPhaseVocoderNodeRef.current = vocalPhaseVocoderNode;
      instrGainNodeRef.current = instrGainNode;
      instrPlayControlRef.current = instrPlayControl;
      instrPhaseVocoderNodeRef.current = instrPhaseVocoderNode;
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
    };

    init();

    // Clean-up function
    return () => {
      // Perform any necessary clean-up
    };
  }, []); // Empty dependency array to run the effect only once

  return (
    <div>
      {noWorkletVisible && (
        <div id="no-worklet" style={{ display: "block" }}>
          No Audio Worklet support
        </div>
      )}
      {!noWorkletVisible && (
        <Box>
          <Box display={"flex"} gap={4}>
            <Box display={"flex"} alignItems="center">
              <IconButton
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
                {isPlaying ? <PauseCircleRounded /> : <PlayArrowRounded />}
              </IconButton>
            </Box>
            <Stack width={200}>
              <Typography>Speed</Typography>
              <Slider
                valueLabelDisplay="auto"
                getAriaValueText={(v) => v.toString()}
                min={0.5}
                max={1.5}
                step={0.01}
                value={speedFactor}
                // marks
                onChange={(e, newVal) => {
                  const vocalPitchFactorParam =
                    vocalPhaseVocoderNodeRef.current.parameters.get(
                      "pitchFactor"
                    );
                  const instrPitchFactorParam =
                    vocalPhaseVocoderNodeRef.current.parameters.get(
                      "pitchFactor"
                    );
                  const newSpeedFactor = newVal as number;
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
                  setSpeedFactor(newSpeedFactor);
                }}
              />
            </Stack>
            <Stack width={200}>
              <Typography>Pitch</Typography>
              <Slider
                valueLabelDisplay="auto"
                getAriaValueText={(v) => v.toString()}
                min={0.5}
                max={1.5}
                step={0.01}
                value={pitchFactor}
                // marks
                onChange={(e, newVal) => {
                  const vocalPitchFactorParam =
                    vocalPhaseVocoderNodeRef.current.parameters.get(
                      "pitchFactor"
                    );
                  const instrPitchFactorParam =
                    vocalPhaseVocoderNodeRef.current.parameters.get(
                      "pitchFactor"
                    );
                  const newSpeedFactor = newVal as number;

                  vocalPitchFactorParam.value = warpBypassed
                    ? 1.0
                    : (pitchFactor * 1) / speedFactor;
                  instrPitchFactorParam.value = warpBypassed
                    ? 1.0
                    : (pitchFactor * 1) / speedFactor;
                  setPitchFactor(newSpeedFactor);
                }}
              />
            </Stack>
            <Stack width={200}>
              <Typography>Vocal</Typography>
              <Slider
                valueLabelDisplay="auto"
                getAriaValueText={(v) => v.toString()}
                min={0}
                max={1}
                step={0.01}
                value={vocalGain}
                // marks
                onChange={(e, newVal) => {
                  const _vocalGain = (newVal as number) ** 0.9;
                  if (vocalsGainNodeRef.current)
                    vocalsGainNodeRef.current.gain.value = _vocalGain;
                  setVocalGain(newVal as number);
                }}
              />
            </Stack>
            <Stack width={200}>
              <Typography>Delay</Typography>
              <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => v.toFixed(2)}
                min={0.5}
                max={1.5}
                step={0.01}
                value={delayGain}
                // marks
                onChange={(e, newVal) => {
                  const _delayGain = (newVal as number) ** 0.9;
                  if (delayGainNodeRef.current)
                    delayGainNodeRef.current.gain.value = fxBypassed
                      ? 0
                      : _delayGain;
                  setDelayGain(_delayGain);
                }}
              />
            </Stack>
            <Stack width={200}>
              <Typography>Reverb</Typography>
              <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => v.toFixed(2)}
                min={0}
                max={1}
                step={0.01}
                value={reverbGain}
                // marks
                onChange={(e, newVal) => {
                  const _reverbGain = (newVal as number) ** 0.9;
                  if (reverbGainNodeRef.current)
                    reverbGainNodeRef.current.gain.value = fxBypassed
                      ? 0
                      : _reverbGain;
                  setReverbGain(_reverbGain);
                }}
              />
            </Stack>
            <Stack width={200}>
              <Typography>Flanger</Typography>
              <Slider
                valueLabelDisplay="auto"
                getAriaValueText={(v) => v.toString()}
                min={0.5}
                max={0.75}
                step={0.01}
                value={flangerGain}
                // marks
                onChange={(e, newVal) => {
                  const _flangerGain = (newVal as number) ** 0.9;
                  if (flangerGainNodeRef.current)
                    flangerGainNodeRef.current.gain.value = fxBypassed
                      ? 0
                      : _flangerGain;

                  setFlangerGain(newVal as number);
                }}
              />
            </Stack>
          </Box>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => {
              const newInstrGain = instrGain === 0.0 ? 1.0 : 0.0;
              if (instrGainNodeRef.current)
                instrGainNodeRef.current.gain.value = newInstrGain;
              setInstrGain(newInstrGain);
            }}
          >
            {instrGain === 0.0 ? "Enable Instr" : "Bypass Instr"}
          </Button>
          <Button
            color="secondary"
            variant="outlined"
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
            {warpBypassed ? "Enable Warp" : "Bypass Warp"}
          </Button>
          <Button
            color="secondary"
            variant="outlined"
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
              } else {
                if (delayGainNodeRef.current)
                  delayGainNodeRef.current.gain.value = delayGain;
                if (reverbGainNodeRef.current)
                  reverbGainNodeRef.current.gain.value = reverbGain;
                if (flangerGainNodeRef.current)
                  flangerGainNodeRef.current.gain.value = flangerGain;
              }
              setFxBypassed(newFxBypassed);
            }}
          >
            {fxBypassed ? "Enable FX" : "Bypass FX"}
          </Button>
        </Box>
      )}
    </div>
  );
};

export default AudioComponent;

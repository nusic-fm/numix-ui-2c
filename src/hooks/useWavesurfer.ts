import { useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

export const useWavesurfer = (containerRef: any, audioUrl: string) => {
  const [wavesurfer, setWavesurfer] = useState<null | WaveSurfer>(null);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    const ctx = document.createElement("canvas").getContext("2d") as any;
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0.2, "#2B00FF");
    gradient.addColorStop(0.4, "#73D5EB");
    gradient.addColorStop(0.6, "#EB00FF");
    //   const ws = WaveSurfer.create({
    //     ...options,
    //     container: containerRef.current,
    //   });
    const ws = WaveSurfer.create({
      container: containerRef.current,
      //   waveColor: gradient,
      barWidth: 2,
      progressColor: gradient,
      url: audioUrl,
      height: 60,
      //   barGap: 1,
      barHeight: 0.6,
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [containerRef]);

  return wavesurfer;
};

import { useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram";
import colormap from "colormap";

export const useWavesurfer = (
  containerRef: any,
  audioUrl: string,
  options?: boolean
) => {
  const [wavesurfer, setWavesurfer] = useState<null | WaveSurfer>(null);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    const ctx = document.createElement("canvas").getContext("2d") as any;
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0.4, "#5432ff");
    gradient.addColorStop(0.67, "#73D5EB");
    gradient.addColorStop(0.9, "#EB00FF");
    //   const ws = WaveSurfer.create({
    //     ...options,
    //     container: containerRef.current,
    //   });
    const colors = colormap({
      colormap: "hot",
      nshades: 256,
      format: "float",
    });
    const wsOptions = options
      ? {
          container: containerRef.current,
          //   waveColor: gradient,
          barWidth: 2,
          progressColor: gradient,
          url: audioUrl,
          height: 100,
          width: 500,
          //   barGap: 1,
          barHeight: 0.9,
          // plugins: [
          //   SpectrogramPlugin.create({
          //     labels: true,
          //     height: 50,
          //     colorMap: colors,
          //     labelsColor: "black",
          //   }),
          // ],
        }
      : {
          container: containerRef.current,
          //   waveColor: gradient,
          barWidth: 2,
          progressColor: gradient,
          url: audioUrl,
          height: 60,
          width: 200,
          //   barGap: 1,
          barHeight: 0.6,
          // plugins: [SpectrogramPlugin.create({ labels: true, height: 200 })],
        };
    const ws = WaveSurfer.create(wsOptions);
    ws.on("click", () => {
      ws?.play();
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [containerRef, audioUrl]);

  return wavesurfer;
};

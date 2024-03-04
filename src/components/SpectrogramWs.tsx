import { useWavesurfer } from "@wavesurfer/react";
import { useRef } from "react";

const getCanvasGradient = () => {
  const ctx = document.createElement("canvas").getContext("2d") as any;
  const gradient = ctx.createLinearGradient(0, 0, 0, 150);
  gradient.addColorStop(0.2, "#2B00FF");
  gradient.addColorStop(0.4, "#73D5EB");
  gradient.addColorStop(0.6, "#EB00FF");
  return gradient;
};
const SpectrogramWs = ({ coverUrl }: { coverUrl: string }) => {
  const containerRef = useRef(null);
  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 100,
    width: 400,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    url: coverUrl,
    plugins: [],
    // plugins: useMemo(
    //   () => [
    //     SpectrogramPlugin.create({
    //       labels: true,
    //       height: 200,
    //       splitChannels: false,
    //     }),
    //   ],
    //   []
    // ),
  });
  console.log("r");
  return <div ref={containerRef} />;
};

export default SpectrogramWs;

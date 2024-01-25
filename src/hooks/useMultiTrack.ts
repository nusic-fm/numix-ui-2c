import { useState, useEffect } from "react";
import Multitrack from "wavesurfer-multitrack";

export const useMultiTrack = (
  containerRef: any,
  remixUrl: string,
  vocalsUrl: string
) => {
  const [wavesurfer, setWavesurfer] = useState<null | Multitrack>(null);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = document.createElement("canvas").getContext("2d") as any;
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0.2, "#2B00FF");
    gradient.addColorStop(0.4, "#73D5EB");
    gradient.addColorStop(0.6, "#EB00FF");
    //   const ws = WaveSurfer.create({
    //     ...options,
    //     container: containerRef.current,
    //   });
    const ws = Multitrack.create(
      [
        {
          id: 1,
          draggable: false,
          url: remixUrl,
          startPosition: 0,
          options: {
            progressColor: gradient,
          },
        },
        {
          id: 2,
          draggable: false,
          url: vocalsUrl,
          startPosition: 0,
          options: {
            progressColor: gradient,
          },
        },
      ],
      {
        container: containerRef.current, // required!
        minPxPerSec: 10, // zoom level
        rightButtonDrag: false, // set to true to drag with right mouse button
        cursorWidth: 2,
        cursorColor: "#D72F21",
        trackBackground: "#2D2D2D",
        trackBorderColor: "#7C7C7C",
        dragBounds: true,
      }
    );

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [containerRef]);

  return wavesurfer;
};

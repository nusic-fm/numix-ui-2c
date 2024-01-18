import { useRef, useState } from "react";
import * as Tone from "tone";
import { ToneAudioBuffer } from "tone";

export const useTonejs = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Tone.Player | null>();
  const playerRef = useRef<Tone.Player | null>(null);
  const startTimeRef = useRef(0);
  const scheduledNextTrackBf = useRef<Tone.ToneAudioBuffer | null>(null);

  const [isToneInitialized, setIsToneInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const [toneLoadingForSection, setToneLoadingForSection] = useState<
    string | null
  >(null);
  const [loop, setLoop] = useState(false);
  const onEndedCalledRef = useRef(false);

  const initializeTone = async () => {
    if (!isToneInitialized) {
      setIsToneInitialized(true);
      await Tone.start();
      console.log("context started");
      setEvents();
    }
  };

  const sonify = () => {
    // Initialize Tone.js
    initializeTone();
    // Initialize Tone.js
    const synth = new Tone.Synth().toDestination();

    // Function to play a sequence of clicks
    function playClickSequence() {
      // 16th notes for 2 seconds
      playNotes("1000", "4n", 4, () => {
        playNotes("1000", "8n", 4, () => {
          playNotes("1000", "16n", 8, () => {
            // 32nd notes for 2 seconds
            playNotes("1000", "32n", 16, () => {
              playNotes("100", "64n", 4, () => {
                // 64th notes for 2 seconds
                // playNotes("1000", "64n", 32, () => {});
              });
            });
          });
        });
      });
    }

    // Function to play a series of notes
    function playNotes(
      note: any,
      duration: any,
      numberOfNotes: any,
      onComplete: any
    ) {
      let time = 0;

      for (let i = 0; i < numberOfNotes; i++) {
        // Schedule each note with Tone.js
        synth.triggerAttackRelease(note, duration, `+${time}`);
        time += Tone.Time(duration).toSeconds();
      }

      // Call the onComplete callback after the sequence is complete
      if (onComplete) {
        setTimeout(onComplete, time * 1000);
      }
    }
    playClickSequence();
  };

  const setEvents = () => {
    Tone.Transport.on("start", (...args) => {
      console.log("Tone Started");
      setIsTonePlaying(true);
    });
    Tone.Transport.on("stop", (...args) => {
      console.log("Tone Stopped");
      setIsTonePlaying(false);
    });
    Tone.Transport.on("pause", (...args) => {
      console.log("Tone Paused");
      setIsTonePlaying(false);
    });
  };
  const changePlayerBuffer = (
    bf: ToneAudioBuffer,
    offsetPosition: Tone.Unit.Time
  ) => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.buffer = bf;
      playerRef.current.start(undefined, offsetPosition);
    }
  };

  const playAudio = async (url: string): Promise<void> => {
    if (toneLoadingForSection) {
      scheduledNextTrackBf.current = null;
      setToneLoadingForSection(null);
      onEndedCalledRef.current = false;
    }
    if (playerRef.current) {
      await switchAudio(url);
      return;
    }
    await initializeTone();

    // Load and play the new audio
    const player = new Tone.Player(url).sync().toDestination();
    playerRef.current = player;
    setCurrentPlayer(player);
    await Tone.loaded();
    if (isMuted) player.mute = true;
    // player.loop = true;
    player.fadeIn = 0.3;
    player.fadeOut = 0.3;
    Tone.Transport.start();
    player.start();
    startTimeRef.current = Tone.Transport.seconds;
  };

  const switchAudio = async (url: string) => {
    await new Promise((res) => {
      const audioBuffer = new Tone.Buffer(url);
      audioBuffer.onload = (bf) => {
        // Audio is downloaded
        if (isTonePlaying) {
          if (playerRef.current) {
            changePlayerBuffer(bf, 0);
          }
        } else if (playerRef.current) {
          playerRef.current.buffer = bf;
          Tone.Transport.start();
          playerRef.current.start();
        }
        res("");
      };
    });
  };

  const switchLoop = () => {
    if (currentPlayer) {
      currentPlayer.loop = !loop;
      setLoop(!loop);
    }
  };

  const mutePlayer = () => {
    setIsMuted(true);
    if (playerRef.current) {
      playerRef.current.mute = true;
      // currentPlayer.stop(currentPlayer.now() + 0.1);
    }
  };

  const unMutePlayer = () => {
    setIsMuted(false);
    if (playerRef.current) {
      playerRef.current.mute = false;
      // currentPlayer.start();
    }
  };

  const pausePlayer = () => {
    Tone.Transport.pause();
  };
  const playPlayer = () => {
    Tone.Transport.start();
  };
  const stopPlayer = () => {
    Tone.Transport.stop();
  };
  return {
    currentPlayer,
    playAudio,
    mutePlayer,
    unMutePlayer,
    pausePlayer,
    playPlayer,
    stopPlayer,
    isTonePlaying,
    isMuted,
    toneLoadingForSection,
    switchLoop,
    loop,
    initializeTone,
    sonify,
  };
};

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import "./App.css";
import Uploader from "./components/Uploader";
import { useTonejs } from "./hooks/useToneService";
import { motion } from "framer-motion";
import DropsFace, { getColorsForGroup } from "./components/DropsFace";
import WaveSelector from "./components/WaveSelector";
import useWebSocket from "react-use-websocket";
import { LoadingButton } from "@mui/lab";
// import MultiWaveform from "./components/MultiWaveform";
import { fileToArraybuffer } from "./helpers/audio";
import { getYouTubeVideoId } from "./helpers";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AudioComponent from "./components/AudioComponent";
import axios from "axios";
import { uploadFromAudioBlob } from "./services/storage/remix.service";
import { createWrapperDoc } from "./services/db/wrapper.service";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const genreNames = [
  "Progressive House",
  "Future House",
  "House, Indian instruments",
  "House, Arabic instruments",
  "Electronic, Futurebass",
  "Chill Out, Downtempo",
  "Trap",
  "Breakbeat",
  "Americana",
  "Reggaeton",
  "Pop",
  "Dubstep",
  "Trip Hop, Ethereal",
  "Rock",
  "A piano version",
].sort();

export type SnippetProp = {
  url: string;
  name: string;
  color: string;
  duration: number;
};

const voiceCoverMap = {
  eminem: ["eminem-new-era", "png"],
  trump: ["trump", "png"],
  CartmanClassico: ["CartmanClassico", "jpeg"],
  elvis: ["Elvis_model", "jpeg"],
  GreenDay300: ["GreenDay300", "jpeg"],
  KanyeWest: ["KanyeWestGraduation", "jpeg"],
  "minecraft door": ["mcdoor", "jpeg"],
};

export type Allin1Anaysis = {
  beatPositions: number[];
  beats: number[];
  bpm: number;
  downbeats: number[];
  segments: { start: number; end: number; label: string }[];
};

export type LongerSectionProps = {
  description?: string;
  start?: number;
  end: number;
  url: string;
};
export type FX_PARAMS = {
  speedFactor: number;
  pitchFactor: number;
  vocalGain: number;
  instrGain: number;
  warpBypassed: boolean;
  fxBypassed: boolean;
  delayTime: number;
  reverbGain: number;
  flangerGain: number;
};

function App() {
  const [melodyFile, setMelodyFile] = useState<File>();
  const [melodyUrl, setMelodyUrl] = useState<string>();
  const [melodyBlob, setMelodyBlob] = useState<Blob>();
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/arr.wav?alt=media"
  const [fullInstrBlob, setFullInstrBlob] = useState<Blob>();
  const [fullInstrUrl, setFullInstrUrl] = useState<string>();
  const [fullVocalsBlob, setFullVocalsBlob] = useState<Blob>();
  const [vocalsUrl, setVocalsUrl] = useState<string>();
  const [convertedVocalsBlob, setConvertedVocalsBlob] = useState<string>();
  const [convertedVocalsUrl, setConvertedVocalsUrl] = useState<string>();
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
  const [vocalsBlob, setVocalsBlob] = useState<Blob>();

  const [longerRemixUrl, setLongerRemixUrl] = useState<string>();
  // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
  const [longerRemixBlob, setLongerRemixBlob] = useState<Blob>();

  // const [showWaveSelector, setShowWaveSelector] = useState(false);
  const [skipShortClips, setSkipShortClips] = useState(false);
  const [noOfShortClips, setNoOfShortClips] = useState(15);
  // const [newAudio, setNewAudio] = useState<string>();
  const [longerAudioLoading, setLongerAudioLoading] = useState<boolean>(false);
  const [allin1Analysis, setAllIn1Analysis] = useState<Allin1Anaysis>();
  const [selectedArtist, setSelectedArtist] = useState("");
  // 1 - Bubbles & preparing voice cover
  // 2 - Voice cover is ready
  const [processStage, setProcessStage] = useState(0);
  // JSON.parse(
  //   '{"msg":"allin1","segments":[{"start":0.0,"end":0.01,"label":"verse"},{"start":0.01,"end":15.99,"label":"verse"},{"start":15.99,"end":16.0,"label":"verse"},{"start":15.99,"end":16.0,"label":"verse"},{"start":15.99,"end":16.0,"label":"verse"},{"start":15.99,"end":16.0,"label":"verse"},{"start":15.99,"end":16.0,"label":"verse"},{"start":15.99,"end":16.0,"label":"verse"}],"bpm":120,"beats":[0.49,1.0,1.49,2.0,2.49,2.99,3.5,4.0,4.5,5.0,5.5,6.0,6.5,7.0,7.49,8.0,8.5,9.0,9.49,10.0,10.49,11.0,11.5,12.0,12.5,13.0,13.5,14.0,14.5,15.0,15.49],"downbeats":[0.49,2.49,4.5,6.5,8.5,10.49,12.5,14.5],"beat_positions":[1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3]}'
  // )
  // https://www.youtube.com/watch?v=5z8TmIbyqwk
  const [loadingVid, setLoadingVid] = useState(false);
  const [voiceModelProps, setVoiceModelProps] = useState<{
    url?: string;
    name?: string;
  }>({});
  const [audioListObj, setAudioListObj] = useState<{
    [key: string]: SnippetProp;
  }>({});
  const [playUrl, setPlayUrl] = useState<string>();
  const [positionArr] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ]);
  const [reorderArr] = useState<number[]>(() =>
    [...positionArr].sort(() => Math.random() - 0.5)
  );
  const [showAudioComponent, setShowAudioComponent] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // const navigate = useNavigate();

  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [vid, setVid] = useState("");
  const [musicInfo, setMusicInfo] = useState<{ title: string; tag: string }>();
  const [isReady, setIsReady] = useState(false);
  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    // lastJsonMessage,
    readyState,
    // getWebSocket,
  } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    // heartbeat: { interval: 5000 },
    onOpen: () => console.log("Connected"),
    onClose: () => console.log("Closed"),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: () => true,
    reconnectAttempts: 5,
  });
  const readyStateString = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][
    readyState
  ];

  useEffect(() => {
    if (readyStateString === "OPEN" && isReady === false) {
      sendJsonMessage({ msg: "Connected to Client" });
    } else if (readyStateString === "OPEN" && longerAudioLoading) {
      // sendJsonMessage({ msg: "get_long_music", vid });
    }
  }, [readyState]);

  const [sectionInfo, setSectionInfo] = useState<{
    description: string;
  }>();
  const [sectionStartEnd, setSectionStartEnd] = useState<{
    start: number;
    end: number;
  }>();

  const { playAudio, initializeTone, isTonePlaying, stopPlayer, playPlayer } =
    useTonejs();

  const onGenreSelection = (description: string) => {
    setSectionInfo({ description });
  };
  const onSliceSelection = (start: number, end: number) => {
    setSectionStartEnd({ start, end });
  };

  const onDropMusicUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length && !loadingVid) {
      const melody = acceptedFiles[0];
      setMelodyFile(melody);
      setMelodyUrl(URL.createObjectURL(melody));
    }
  };

  const onDropFile = async () => {
    if (readyStateString === "OPEN" && melodyFile) {
      const bf_audio = await fileToArraybuffer(melodyFile);
      sendMessage(bf_audio as ArrayBuffer);
    }
  };

  const prepareVoiceCover = async (blob: Blob) => {
    const modelFormData = new FormData();
    modelFormData.append("file", blob);
    // modelFormData.append("ip", "35.184.8.220");
    if (voiceModelProps.url && !selectedArtist)
      modelFormData.append("model_url", voiceModelProps.url);
    if (voiceModelProps.name && !selectedArtist)
      modelFormData.append("model_name", voiceModelProps.name);
    if (selectedArtist) {
      modelFormData.append(
        "model_name",
        (voiceCoverMap as any)[selectedArtist][0]
      );
      modelFormData.append(
        "model_url",
        `https://firebasestorage.googleapis.com/v0/b/nusic-dao-website.appspot.com/o/${
          (voiceCoverMap as any)[selectedArtist][0]
        }.zip?alt=media`
      );
    }
    const voiceModelRes = await axios.post(
      `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/proxy-voice-cover`,
      modelFormData,
      { responseType: "blob" }
    );
    const convertedVoiceBlob = voiceModelRes.data;
    setConvertedVocalsBlob(convertedVoiceBlob);
    setConvertedVocalsUrl(URL.createObjectURL(convertedVoiceBlob));
    setProcessStage(2);
    setSnackbarMessage("AI voice cover ready");
  };

  const onGenerate = async () => {
    if (vid) {
      if (!sectionInfo?.description) {
        alert("Prompt is not provided");
        return;
      }
      // setVocalsUrl(
      //   "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vocals.wav?alt=media"
      // );
      // setLongerRemixUrl(
      //   "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/instrumental.wav?alt=media"
      // );
      // const base64_audio = await fileToBase64(melodyFile);
      sendJsonMessage({
        msg: "generate_long",
        start: sectionStartEnd?.start,
        end: sectionStartEnd?.end,
        description: sectionInfo?.description,
        vid,
      });
      setLongerAudioLoading(true);
      setShowAudioComponent(true);
      // if (!fullVocalsBlob) return;
      // const sliceFormData = new FormData();
      // sliceFormData.append("audio", fullVocalsBlob);
      // sliceFormData.append("start", sectionStartEnd?.start.toString() ?? "1");
      // sliceFormData.append("end", sectionStartEnd?.end.toString() ?? "2");
      // try {
      //   const res = await axios.post(
      //     `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/slice`,
      //     sliceFormData,
      //     { responseType: "blob" }
      //   );
      //   const slicedBlobData = res.data;
      //   console.log("Sliced vocals");
      //   // if (voiceModelProps.url || voiceModelProps.name) {

      //   // } else {
      //   setConvertedVocalsBlob(slicedBlobData);
      //   setConvertedVocalsUrl(URL.createObjectURL(slicedBlobData));
      //   // }
      // } catch (e) {
      //   console.error(e);
      // }
    } else {
      stopPlayer();
    }
  };

  const onFetchShorts = () => {
    // sendJsonMessage({
    //   msg: "generate_long",
    //   start: 0,
    //   end: 16,
    //   description: "Progressive House",
    // });
    setLoadingVid(false);
    const obj = {
      msg: "generate_short",
      descriptions: genreNames.slice(0, noOfShortClips),
      durations: Array(noOfShortClips).fill(1),
      vid,
      skip: skipShortClips,
    };
    sendJsonMessage(obj);
  };

  useEffect(() => {
    if (melodyBlob) prepareVoiceCover(melodyBlob);
    else if (melodyFile) prepareVoiceCover(melodyFile);
  }, [melodyBlob, melodyFile]);

  const onFinish = async ({
    speedFactor,
    pitchFactor,
    vocalGain,
    instrGain,
    warpBypassed,
    fxBypassed,
    delayTime,
    reverbGain,
    flangerGain,
  }: FX_PARAMS) => {
    if (vocalsBlob && longerRemixBlob) {
      const id = await createWrapperDoc({
        vid,
        genre: sectionInfo?.description ?? "",
        title: musicInfo?.title ?? "",
        tag: musicInfo?.tag ?? "",
        speedFactor,
        pitchFactor,
        vocalGain,
        instrGain,
        warpBypassed,
        fxBypassed,
        delayTime,
        reverbGain,
        flangerGain,
      });
      await uploadFromAudioBlob(`${id}/instr.wav`, longerRemixBlob);
      await uploadFromAudioBlob(`${id}/vocals.wav`, vocalsBlob);
      const formdata = new FormData();
      formdata.append("vocals", vocalsBlob);
      formdata.append("instrumental", longerRemixBlob);
      formdata.append(
        "fx_params",
        JSON.stringify({
          speedFactor,
          pitchFactor,
          vocalGain,
          instrGain,
          warpBypassed,
          fxBypassed,
          delay: {
            delayTime,
            delayFeedback: 0.3,
            delayCutoff: 1000,
            delayGain: 0,
          },
          reverb: { reverbGain, rirPath: "rir.wav" },
          flanger: {
            flangerDelayTime: 0.005,
            flangerDepth: 0.0025,
            flangerRate: 0.6,
            flangerFeedback: 0.8,
            flangerCutoff: 1000,
            flangerGain,
          },
        })
      );

      const res = await axios.post(
        `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/remix`,
        formdata
      );
      const blob = new Blob([res.data], { type: "audio/wav" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "remix.wav";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const fetchMusicInfo = async (_vid: string) => {
    try {
      const formData = new FormData();
      formData.append("vid", _vid);
      const res = await axios.post(
        import.meta.env.VITE_AUDIO_ANALYSER_PY + "/ytp-content",
        formData
      );
      setMusicInfo({ title: res.data.title, tag: res.data.tag });
    } catch {
      console.error("Unable to fetch Track info");
    }
  };

  useEffect(() => {
    if (vid) {
      setProcessStage(1);
      onFetchShorts();
      // if (youtubeLink) fetchMusicInfo(vid);
    }
  }, [vid]);

  const getVidFromYtbLink = () => {
    setLoadingVid(true);
    const vid = getYouTubeVideoId(youtubeLink);
    if (youtubeLink && readyStateString === "OPEN" && vid) {
      sendJsonMessage({ msg: "ytp", vid });
    }
  };
  useEffect(() => {
    if (lastMessage) {
      const data = lastMessage.data;
      if (data instanceof Blob) {
        if (longerAudioLoading) {
          const blob = new Blob([data], { type: "audio/wav" });
          setLongerRemixUrl(URL.createObjectURL(blob));
          setLongerRemixBlob(blob);
          setLongerAudioLoading(false);
        } else if (allin1Analysis && !fullInstrUrl) {
          const blob = new Blob([data], { type: "audio/wav" });
          // setFullVocalsBlob(blob);
          setFullInstrBlob(blob);
          setFullInstrUrl(URL.createObjectURL(blob));
        }
        // TODO: this is the prevocal applied vocals url, enable at some point with flow
        // else if (longerRemixUrl && !vocalsUrl) {
        //   const blob = new Blob([data], { type: "audio/wav" });
        //   // setVocalsUrl(URL.createObjectURL(blob));
        //   setVocalsBlob(blob);
        // }
        else if (!melodyUrl) {
          const blob = new Blob([data], { type: "audio/wav" });
          setMelodyUrl(URL.createObjectURL(blob));
          setMelodyBlob(blob);
          // if (skipShortClips) {
          //   setShowWaveSelector(true);
          // }
        } else {
          if (convertedVocalsUrl) return;
          const blob = new Blob([data], { type: "audio/wav" });
          const _newAudio = URL.createObjectURL(blob);
          // setNewAudio(URL.createObjectURL(blob));
          setAudioListObj((preAudioListObj) => {
            const currentIdx = Object.keys(preAudioListObj).length;
            // const idx = reorderArr[currentIdx] - 1;
            const name = genreNames[currentIdx];
            return {
              ...preAudioListObj,
              [reorderArr[currentIdx].toString()]: {
                name,
                color: getColorsForGroup(currentIdx),
                duration: 1,
                url: _newAudio,
              },
            };
          });
          // playAudio(newAudio, true);
          setPlayUrl(_newAudio);
        }
      } else {
        const dataObj = JSON.parse(data);
        if (dataObj.msg === "allin1") {
          setAllIn1Analysis(dataObj);
        } else if (dataObj.msg === "connected") {
          setIsReady(true);
        } else if (dataObj.msg === "saved" && dataObj.vid) {
          setVid(dataObj.vid);
        } else if (dataObj.msg === "status") {
          // sendJsonMessage({ msg: "get_long_music", vid });
        }
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (playUrl) {
      const key = Object.keys(audioListObj).find(
        (k) => audioListObj[k].url === playUrl
      );
      onGenreSelection(audioListObj[key ?? 0].name);
      playAudio(playUrl);
    }
  }, [playUrl]);

  useEffect(() => {
    if (Object.keys(audioListObj).length === noOfShortClips) {
      setSnackbarMessage("Analyzing the track");
    }
  }, [audioListObj]);

  useEffect(() => {
    if (melodyFile) {
      // new Array(10)
      //   .fill(1)
      //   .map((a, i) =>
      //     setTimeout(
      //       () =>
      //         setNewAudio(
      //           `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/shorts%2F${i}.wav?alt=media`
      //         ),
      //       (i + 1) * 4000
      //     )
      //   );
      onDropFile();
    }
  }, [melodyFile]);

  return (
    <Box
      height={"90vh"}
      // width={{ xs: "100vw", md: "unset" }}
      // position="relative"
    >
      <Box
        display={"flex"}
        alignItems="center"
        p={2}
        justifyContent="space-between"
      >
        <img
          src="numix.png"
          alt=""
          width={140}
          onClick={() => (window as any).navigation?.reload()}
        />
        <Typography>
          {readyStateString} - {isReady ? "Model Ready" : "Model Not Ready"}
        </Typography>
      </Box>

      <Box px={{ xs: "5%", md: "10%", lg: "15%" }}>
        <motion.div
          animate={{ y: vid ? "5%" : "20vh" }}
          transition={{ type: "spring", duration: 1 }}
        >
          <motion.div
          //  animate={{ display: vid ? "none" : "unset" }}
          >
            <Typography variant="h3" align="center" textTransform={"uppercase"}>
              Remix any Song with NUMIX
            </Typography>
            <Stack my={4} gap={1}>
              <Box>
                <Chip label="nuVoice" color="info" />
              </Box>
              {processStage === 1 && (
                <Stack>
                  <Box
                    display={"flex"}
                    alignItems="center"
                    my={2}
                    mx={1}
                    gap={2}
                    position="relative"
                  >
                    <Typography>Preparing the AI Cover for</Typography>
                    <Stack gap={2} alignItems="center">
                      <IconButton>
                        <img
                          src={`https://firebasestorage.googleapis.com/v0/b/nusic-dao-website.appspot.com/o/voice_cover_pics%2F${selectedArtist}.${
                            (voiceCoverMap as any)[selectedArtist][1]
                          }?alt=media`}
                          alt=""
                          width={100}
                          height={100}
                          style={{
                            objectFit: "contain",
                            borderRadius: "50%",
                            border: "2px solid #c3c3c3",
                          }}
                        />
                      </IconButton>
                      <Typography sx={{ textTransform: "uppercase" }}>
                        {selectedArtist}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <LinearProgress />
                  </Box>
                </Stack>
              )}
              {
                processStage === 2 &&
                  fullInstrUrl &&
                  convertedVocalsUrl &&
                  (!showAudioComponent ? (
                    <Box
                      display={"flex"}
                      alignItems="center"
                      my={2}
                      mx={1}
                      gap={2}
                      position="relative"
                    >
                      <Typography>Your AI Cover is ready</Typography>
                      <LoadingButton
                        variant={"contained"}
                        color={"primary"}
                        onClick={onGenerate}
                        loading={longerAudioLoading}
                      >
                        Proceed with {sectionInfo?.description}
                      </LoadingButton>
                    </Box>
                  ) : (
                    // {fullInstrUrl && convertedVocalsUrl && (
                    <Box width="100%" display={"flex"} justifyContent="center">
                      <AudioComponent
                        instrumentalUrl={longerRemixUrl ?? fullInstrUrl}
                        vocalsUrl={convertedVocalsUrl}
                        vid={vid}
                        selectedGenre={sectionInfo?.description ?? "Error"}
                        onFinish={onFinish}
                        musicInfo={{ title: selectedArtist, tag: "AI Cover" }}
                        onBack={() => {
                          setLongerRemixUrl("");
                          setVocalsUrl("");
                        }}
                      />
                    </Box>
                  ))
                // )}
              }
              {processStage === 0 && (
                <Box
                  display={"flex"}
                  justifyContent="center"
                  alignItems="center"
                  my={2}
                  mx={1}
                  gap={2}
                  flexWrap="wrap"
                >
                  {Object.entries(voiceCoverMap).map(([key, value]) => (
                    <Stack gap={2} key={key} alignItems="center">
                      <IconButton
                        onClick={() => {
                          if (selectedArtist === key) setSelectedArtist("");
                          else setSelectedArtist(key);
                        }}
                      >
                        <img
                          src={`https://firebasestorage.googleapis.com/v0/b/nusic-dao-website.appspot.com/o/voice_cover_pics%2F${key}.${value[1]}?alt=media`}
                          alt=""
                          width={100}
                          height={100}
                          style={{
                            objectFit: "contain",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor:
                              selectedArtist === key ? "#66bb6a" : "#c3c3c3",
                          }}
                        />
                      </IconButton>
                      <Typography
                        sx={{ textTransform: "uppercase" }}
                        color={key === selectedArtist ? "#66bb6a" : "#fff"}
                      >
                        {key}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              )}
              {processStage === 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Add Custom Models</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      display={"flex"}
                      justifyContent="center"
                      mb={2}
                      alignItems="center"
                      gap={2}
                    >
                      <TextField
                        label="Model Download Url"
                        sx={{ width: 500 }}
                        onChange={(e) => {
                          setVoiceModelProps({
                            ...voiceModelProps,
                            url: e.target.value,
                          });
                        }}
                        size="small"
                      />
                      <Typography>OR</Typography>
                      <TextField
                        label="Model Name"
                        // sx={{ width: 500 }}
                        onChange={(e) => {
                          setVoiceModelProps({
                            ...voiceModelProps,
                            name: e.target.value,
                          });
                        }}
                        size="small"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
            {!vid && (
              <Box
                // mt={10}
                width="100%"
                display={"flex"}
                justifyContent="center"
                flexWrap={"wrap"}
                gap={2}
              >
                <Box
                  flexBasis={{ xs: "100%", md: "63%" }}
                  display="flex"
                  alignItems={"center"}
                >
                  <TextField
                    fullWidth
                    disabled={!!vid}
                    sx={{
                      ".MuiInputBase-root": {
                        borderRadius: "8px",
                      },
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "#929292",
                      },
                    }}
                    label="Youtube Link"
                    color="secondary"
                    value={youtubeLink}
                    onChange={(e) => {
                      if (!loadingVid) setYoutubeLink(e.target.value);
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          onClick={getVidFromYtbLink}
                          sx={{
                            background:
                              "linear-gradient(90deg, rgba(84,50,255,1) 0%, rgba(237,50,255,1) 100%)",
                          }}
                        >
                          {loadingVid ? (
                            <CircularProgress color="secondary" size={"24px"} />
                          ) : (
                            <ArrowForwardIcon color="secondary" />
                          )}
                        </Button>
                      ),
                    }}
                  />
                </Box>
                <Box flexBasis={{ xs: "100%", md: "34%" }}>
                  <Uploader
                    onDrop={onDropMusicUpload}
                    melodyFile={melodyFile}
                    initializeTone={initializeTone}
                    playAudio={() => {}}
                    vid={vid}
                  />
                </Box>
              </Box>
            )}
            {/* <Box display={"flex"} alignItems="center" my={2} mx={1} gap={2}>
              <Box display={"flex"} alignItems="center">
                <Select
                  disabled={skipShortClips}
                  value={noOfShortClips}
                  onChange={(e) => setNoOfShortClips(e.target.value as number)}
                  size="small"
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                </Select>
                <Typography ml={1}>No of 1s samples</Typography>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ backgroundColor: "gray", ml: 1 }}
              />
              <Box display={"flex"} alignItems="center">
                <Checkbox
                  checked={skipShortClips}
                  onChange={(e, checked) => setSkipShortClips(checked)}
                />
                <Typography>Skip 1s samples</Typography>
              </Box>
            </Box> */}
          </motion.div>

          {vid && processStage <= 2 && !showAudioComponent && (
            <Box mt={4} width="100%" pb={10}>
              <Box mt={4} width="100%" display={"flex"} justifyContent="center">
                <DropsFace
                  isTonePlaying={isTonePlaying}
                  stopPlayer={stopPlayer}
                  playPlayer={playPlayer}
                  audioListObj={audioListObj}
                  playUrl={playUrl}
                  setPlayUrl={setPlayUrl}
                  positionArr={positionArr}
                  reorderArr={reorderArr}
                />
              </Box>
              {/* {!longerRemixUrl &&
                melodyUrl &&
                // newAudio &&
                allin1Analysis && (
                  <Box mt={4} display={"flex"} justifyContent="center">
                    <LoadingButton
                      variant={"contained"}
                      color={"primary"}
                      onClick={onGenerate}
                      loading={longerAudioLoading}
                    >
                      Generate Instr with {sectionInfo?.description}
                    </LoadingButton>
                  </Box>
                )} */}
            </Box>
          )}
          {/* {melodyUrl &&
            showWaveSelector &&
            !longerRemixUrl &&
            !longerAudioLoading &&
            allin1Analysis && (
              <Box
                mt={10}
                width="100%"
                display={"flex"}
                justifyContent="center"
              >
                <WaveSelector
                  url={melodyUrl}
                  analysis={allin1Analysis}
                  onSliceSelection={onSliceSelection}
                  onGenreSelection={onGenreSelection}
                  genre={sectionInfo?.description ?? ""}
                />
              </Box>
            )} */}
          {/* {(longerRemixUrl || longerAudioLoading) &&
            (vocalsUrl || convertedVocalsUrl) && ( */}

          {/* {!longerRemixUrl &&
            melodyUrl &&
            // showWaveSelector &&
            allin1Analysis && (
              <Box mt={4} display={"flex"} justifyContent="center">
                <LoadingButton
                  loading={longerAudioLoading}
                  variant={allin1Analysis ? "contained" : "outlined"}
                  color={allin1Analysis ? "primary" : "info"}
                  onClick={onGenerate}
                >
                  Generate
                </LoadingButton>
              </Box>
            )} */}
        </motion.div>
      </Box>
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage("")}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
}

export default App;

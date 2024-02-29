import {
  TextField,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Snackbar,
  Chip,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useMemo, useRef, useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import { voiceCoverMap } from "./App";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import axios from "axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { client, duplicate } from "@gradio/client";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import { whoAmI } from "@huggingface/hub";
import { LoadingButton } from "@mui/lab";
import { useWavesurfer } from "./hooks/useWavesurfer";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayRounded from "@mui/icons-material/PlayArrowRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";

type Props = {};

const getSpaceId = (userName: string) =>
  `${userName}/${import.meta.env.VITE_HF_SOURCE_SPACE_ID}`;

function VoiceCover({}: Props) {
  const [showAccountSetupStepper, setShowAccountSetupStepper] = useState(false);
  const [accountSetupSteps, setAccountSetupSteps] = useState(0);
  const [enteredAccessToken, setEnteredAccessToken] = useState("");
  const [hfToken, setHfToken] = useState("");
  const [userName, setUserName] = useState("");
  const [spaceAvailable, setSpaceAvailable] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // const [spaceExists, setSpaceExists] = useState(false);
  // const [isSpaceRunning, setIsSpaceRunning] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

  const [youtubeLink, setYoutubeLink] = useState("");
  // const [inputFile, setInputFile] = useState<File>();
  // const [inputUrl, setInputUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [machineType, setMachineType] = useState("");
  const [coverUrl, setCoverUrl] = useState(
    ""
    // "https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/arr.wav?alt=media&token=141f6e3c-3ef7-48ec-bd37-3df48783570b"
  );
  const [localCoverUrl, setLocalCoverUrl] = useState("");
  const [voiceModelProps, setVoiceModelProps] = useState({ url: "", name: "" });
  const [eta, setEta] = useState(0);

  const [progressMsgs, setProgressMsgs] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showAt, setShowAt] = useState(false);
  const [hfStatus, setHfStatus] = useState<string>();

  const containerRef = useRef(null);
  const wavesurfer = useWavesurfer(containerRef, localCoverUrl, true);

  const checkUserAccessToken = async () => {
    try {
      setSettingsLoading(true);
      const user = await whoAmI({
        credentials: { accessToken: enteredAccessToken },
      });
      const _userName = user.name;
      setSettingsLoading(false);
      window.localStorage.setItem("HF_AT", enteredAccessToken);
      setHfToken(enteredAccessToken);
      setUserName(_userName.endsWith("nusic") ? "nusic" : _userName); // user.name "nusic"
    } catch (e) {
      setShowAccountSetupStepper(true);
      setErrorSnackbarMessage("Invalid Access Token");
    }
  };
  const checkSpace = async () => {
    try {
      setSettingsLoading(true);
      const statusRes = await axios.get(
        `https://huggingface.co/api/spaces/${userName}/nusic-VoiceCoverGen`,
        {
          headers: { Authorization: `Bearer ${hfToken}` },
        }
      );
      setSettingsLoading(false);
      if (statusRes) {
        setHfStatus(statusRes.data?.runtime?.stage);
        setMachineType(statusRes.data?.runtime?.hardware?.requested);
      }
      setSpaceAvailable(true);
      setAccountSetupSteps(2);
    } catch (e) {
      setErrorSnackbarMessage("Space is not found, duplicate one");
      setShowAccountSetupStepper(true);
      setAccountSetupSteps(1);
    }
  };
  const onDuplicateSpace = async () => {
    try {
      setSettingsLoading(true);
      const formData = new FormData();
      formData.append("space_id", "nusic/nusic-VoiceCoverGen");
      formData.append("hf_token", hfToken);
      formData.append("hardware", machineType);
      await axios.post(
        `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/duplicate`,
        formData
      );
      setSettingsLoading(false);
      setSnackbarMessage("Space is created successfully");
      setAccountSetupSteps(2);
    } catch (e) {
      setErrorSnackbarMessage(
        "Error occurred, kindly check if you have billing enabled"
      );
    }
  };
  const onStartOrPause = async () => {
    setSettingsLoading(true);
    const formData = new FormData();
    formData.append("space_id", getSpaceId(userName));
    formData.append("hf_token", hfToken);
    if (hfStatus === "RUNNING") {
      await axios.post(
        `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/pause-space`,
        formData
      );
      await checkSpace();
    } else {
      await axios.post(
        `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/start-space`,
        formData
      );
      await checkSpace();
    }
    setSettingsLoading(false);
  };

  // const onDropMusicUpload = async (acceptedFiles: File[]) => {
  //   if (!selectedArtist) {
  //     alert("Select a voice model and drop the file again");
  //     return;
  //   }
  //   if (acceptedFiles.length && !isProcessing) {
  //     const melody = acceptedFiles[0];
  //     setInputFile(melody);
  //     setInputUrl(URL.createObjectURL(melody));
  //   }
  // };

  const onGenerateVoiceCover = async () => {
    if (hfToken) {
      if (hfStatus !== "RUNNING") {
        setSnackbarMessage("Space is Building now, try again later");
        await checkSpace();
        return;
      }
      if (!selectedArtist && !(voiceModelProps.url && voiceModelProps.name)) {
        setErrorSnackbarMessage(
          "Select a voice model or provide a custom model"
        );
        return;
      }
      if (!youtubeLink) {
        setErrorSnackbarMessage("Enter a Youtube link");
        return;
      }
      // Reset State:
      setCoverUrl("");
      setProgressMsgs([]);

      setIsGenerating(true);
      const app = await client(getSpaceId(userName), {
        hf_token: hfToken as `hf_${string}`,
      });
      const _modelObj = { url: "", name: "" };
      if (selectedArtist) {
        const name = (voiceCoverMap as any)[selectedArtist][0];
        const voiceModelUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-dao-website.appspot.com/o/${name}.zip?alt=media`;
        _modelObj.url = voiceModelUrl;
        _modelObj.name = name;
      } else {
        _modelObj.url = voiceModelProps.url;
        _modelObj.name = voiceModelProps.name;
      }

      const choicesResult = await app.predict(5, []);
      const choices = (choicesResult as any).data[0].choices;
      const choiceIdx = choices.findIndex((c: string[]) =>
        c.includes(_modelObj.name)
      );
      if (choiceIdx === -1) {
        try {
          const result = await app.predict(8, [
            _modelObj.url, //"https://huggingface.co/nolanaatama/jjsbd10krvcstpsncgm/resolve/main/diobrando.zip",
            _modelObj.name, //"diobrando",
          ]);
          setSnackbarMessage((result as any).data[0]);
        } catch (e) {
          console.log(e);
        }
      }
      // const voiceModelName = selectedArtist;
      try {
        const generateData = [
          youtubeLink,
          _modelObj.name,
          0,
          false,
          1,
          0,
          0,
          0,
          0.5,
          3,
          0.25,
          "rmvpe",
          128,
          0.33,
          0,
          0.15,
          0.2,
          0.8,
          0.7,
          "mp3",
        ];
        // const genResult = await app.predict(6, generateData);

        //nusic-nusic-voicecovergen.hf.space/file=/tmp/gradio/7a16847668b16521ddd40585cab98614ad86bbd8/Short%20Song%20English%20Song%20W%20Lyrics%2030%20seconds%20Test%20Ver.mp3
        // const audioUrl = `https://nusic-nusic-voicecovergen.hf.space/file=${
        //   (genResult as any).data[0].name
        // }`;
        // setCoverUrl(audioUrl);
        const submitData = app.submit(6, generateData);
        submitData.on("data", (event) => {
          if (event.data.length) {
            const fileData = event.data[0] as any;
            if (fileData) {
              console.log(fileData.name, fileData.orig_name);
              const _name = fileData.name;
              const audioUrl = `https://nusic-nusic-voicecovergen.hf.space/file=${_name}`;
              setCoverUrl(audioUrl);
              setGenerationProgress(0);
            }
          }
        });
        submitData.on("status", async (event) => {
          // eta = 74.32423
          // position = 0
          // queue = true
          // size = 1
          console.log("status: ", event);
          if (event.stage === "pending") {
            const _progressData = event?.progress_data?.at(0);
            setGenerationProgress((_progressData?.progress ?? 0) * 100);
            setProgressMsgs((msg) => [...msg, _progressData?.desc ?? ""]);
          }
          if (event.stage === "pending" && event.eta) {
            setEta(event.eta);
            // {
            //     eta: event.eta,
            //     position: event.position,
            //     size: event.size,
            //   }
          }
          //|| event.stage === "complete"
        });
      } catch (e) {
      } finally {
        setIsGenerating(false);
      }
    }

    // 8: Download Model
    // {"data":["https://huggingface.co/QuickWick/Music-AI-Voices/resolve/main/The%20Weeknd%20(RVC)%201k%20Epoch/The%20Weeknd%20(RVC)%201k%20Epoch.zip","Weeknd"],"event_data":null,"fn_index":8,"session_hash":"t6dc35uqlup"}
    // Response: result.data[0] -> '[+] diobrando Model successfully downloaded!'
    // 5: Model Choices Dropdown
    // Response: result.data[0].choices -> [['Weeknd', 'Weeknd'], ['diobrando', 'diobrando']]
    // 6: Generate
    // {"data":["https://www.youtube.com/watch?v=UKxf74oK9-Q","Weeknd",0,false,1,0,0,0,0.5,3,0.25,"rmvpe",128,0.33,0,0.15,0.2,0.8,0.7,"mp3"],"event_data":null,"fn_index":6,"session_hash":"t6dc35uqlup"}
    // Response: result.data[0].name: "/tmp/gradio/1130f624ea6fd895687173c8c32affbbd9eb3bc8/Perfect Status  Ed Sheeran  Whatsapp Status  trump Ver.mp3"
    // 0: Generate with upload
    // {"data":[{"name":"/tmp/gradio/845f77312dbe62450452cca0181ea6fca735676a/noreturn_chorus_16s 1.wav","size":512078,"data":"","orig_name":"noreturn_chorus_16s (1).wav","is_file":true}],"event_data":null,"fn_index":0,"session_hash":"yw4turma3s"}
    // {"msg":"process_completed","output":{"data":[{"orig_name":"noreturn_chorus_16s 1.wav","name":"/tmp/gradio/8db15c9c74acd78c78be88ff4d2c6a16b9099eb2/noreturn_chorus_16s 1.wav","size":512078,"data":null,"is_file":true},{"value":"/tmp/gradio/8db15c9c74acd78c78be88ff4d2c6a16b9099eb2/noreturn_chorus_16s 1.wav","__type__":"update"}],"is_generating":false,"duration":0.0005247592926025391,"average_duration":0.0005247592926025391},"success":true}
  };

  useEffect(() => {
    if (coverUrl) {
      (async () => {
        const res = await axios.get(coverUrl, { responseType: "blob" });
        const blob = new Blob([res.data]);
        setLocalCoverUrl(URL.createObjectURL(blob));
      })();
    }
  }, [coverUrl]);

  useEffect(() => {
    if (hfToken && userName && !spaceAvailable) {
      checkSpace();
    }
  }, [hfToken, userName]);

  useEffect(() => {
    if (!hfToken) {
      const _token = window.localStorage.getItem("HF_AT");
      if (_token) {
        setEnteredAccessToken(_token);
      } else {
        setShowAccountSetupStepper(true);
      }
    }
  }, []);

  useEffect(() => {
    if (enteredAccessToken) {
      checkUserAccessToken();
    }
  }, [enteredAccessToken]);

  return (
    <Box px={{ xs: "5%", md: "10%", lg: "15%" }}>
      <Stack gap={2}>
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
                    borderColor: selectedArtist === key ? "#66bb6a" : "#c3c3c3",
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
        <Box>
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
        </Box>
        <Box
          // mt={10}
          width="100%"
          display={"flex"}
          justifyContent="center"
          flexWrap={"wrap"}
          gap={2}
        >
          <Box
            flexBasis={{ xs: "100%", md: "58%" }}
            display="flex"
            alignItems={"center"}
          >
            <TextField
              fullWidth
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
                if (!isGenerating) setYoutubeLink(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={onGenerateVoiceCover}
                    sx={{
                      background:
                        "linear-gradient(90deg, rgba(84,50,255,1) 0%, rgba(237,50,255,1) 100%)",
                    }}
                  >
                    {isGenerating ? (
                      <CircularProgress color="secondary" size={"24px"} />
                    ) : (
                      <ArrowForwardIcon color="secondary" />
                    )}
                  </Button>
                ),
              }}
            />
          </Box>
          {/* <Box flexBasis={{ xs: "100%", md: "30%" }}>
            <Uploader
              onDrop={onDropMusicUpload}
              melodyFile={inputFile}
              initializeTone={() => {}}
              playAudio={() => {}}
              vid={""}
            />
          </Box> */}
          <IconButton
            onClick={() => setShowAccountSetupStepper(true)}
            color={
              hfStatus === "RUNNING"
                ? "success"
                : hfStatus === "BUILDING"
                ? "warning"
                : "error"
            }
          >
            <SettingsRounded />
          </IconButton>
        </Box>
        {/* {!!eta && (
          <Box display={"flex"} justifyContent="center">
            <Typography>ETA: {eta}</Typography>
          </Box>
        )} */}
        <Stack alignItems={"center"} gap={1}>
          {progressMsgs.map((msg) => (
            <Typography key={msg}>{msg}</Typography>
          ))}
        </Stack>
        <Box display={"flex"} justifyContent="center">
          {!!generationProgress && (
            <Box width={400}>
              <LinearProgress
                color="info"
                variant="determinate"
                value={generationProgress}
                sx={{
                  height: 20,
                  borderRadius: 5,
                  [`&.MuiLinearProgress-root`]: {
                    backgroundColor: "rgb(66, 66, 66)",
                  },
                  [`& .MuiLinearProgress-bar`]: {
                    borderRadius: 5,
                    backgroundColor: "#1a90ff",
                  },
                }}
              />
            </Box>
          )}
          {coverUrl && (
            <Box>
              <div ref={containerRef} />
              <div id={"wave-spectrogram"} />
              <Box display={"flex"} justifyContent="center" gap={2} pt={2}>
                <Button
                  onClick={() => wavesurfer?.playPause()}
                  variant="outlined"
                  color="info"
                >
                  <PlayRounded />
                  <PauseRounded />
                </Button>
                <IconButton
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = localCoverUrl;
                    a.download = `${selectedArtist}_nusic_cover.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <DownloadRounded />
                </IconButton>
              </Box>
            </Box>
            // <SpectrogramWs coverUrl={coverUrl} />
            // <audio controls>
            //   <source src={coverUrl} />
            // </audio>
          )}
        </Box>
      </Stack>
      <Dialog open={showAccountSetupStepper}>
        <DialogTitle>Settings</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            if (hfToken && spaceAvailable) setShowAccountSetupStepper(false);
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <Stepper orientation="vertical" activeStep={accountSetupSteps}>
            <Step>
              <StepLabel color="success">
                <Typography>Account</Typography>
              </StepLabel>
              <StepContent>
                <Stack my={2} gap={2}>
                  <Stack gap={1}>
                    <Box display={"flex"} alignItems="center" gap={2}>
                      <TextField
                        value={enteredAccessToken}
                        label="Access Token"
                        fullWidth
                        onChange={(e) => setEnteredAccessToken(e.target.value)}
                        error={!enteredAccessToken}
                        type={showAt ? "text" : "password"}
                        disabled={settingsLoading}
                      />
                      <IconButton onClick={() => setShowAt(!showAt)}>
                        {showAt ? (
                          <VisibilityOffRoundedIcon />
                        ) : (
                          <RemoveRedEyeRoundedIcon />
                        )}
                      </IconButton>
                    </Box>
                    <Box display={"flex"} gap={0.5}>
                      <Typography variant="caption">
                        Create an Access Token
                      </Typography>
                      <Typography
                        variant="caption"
                        component={"a"}
                        fontStyle="italic"
                        sx={{ textDecoration: "underline" }}
                        href="https://huggingface.co/settings/tokens"
                        target={"_blank"}
                      >
                        here
                      </Typography>
                    </Box>
                    {settingsLoading && <LinearProgress />}
                  </Stack>
                  {/* <Button
                    variant="outlined"
                    color="warning"
                    onClick={checkUserAccessToken}
                    disabled={!enteredAccessToken}
                  >
                    Validate
                  </Button> */}
                </Stack>
              </StepContent>
            </Step>
            <Step>
              <StepLabel color="success">
                <Typography>Voice Cover Gen</Typography>
              </StepLabel>
              <StepContent>
                <Box display={"flex"} gap={2} py={2}>
                  <FormControl
                    sx={{ width: "250px" }}
                    size="small"
                    color="info"
                  >
                    <InputLabel id="demo-simple-select-label">
                      Machine Type
                    </InputLabel>
                    <Select
                      label="Machine Type"
                      value={machineType}
                      onChange={(e) => setMachineType(e.target.value)}
                    >
                      <MenuItem value={"t4-small"}>t4-small ($0.6/h)</MenuItem>
                      <MenuItem value={"t4-medium"}>
                        t4-medium ($0.9/h)
                      </MenuItem>
                      <MenuItem value={"a10g-small"}>
                        a10g-small ($1.5/h)
                      </MenuItem>
                      <MenuItem value={"a10g-large"}>
                        a10g-large ($3.15/h)
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <LoadingButton
                    loading={settingsLoading}
                    variant="contained"
                    onClick={onDuplicateSpace}
                  >
                    Duplicate
                  </LoadingButton>
                </Box>
                <Box display={"flex"} gap={0.5}>
                  <Typography variant="caption">
                    Make sure the billing is setup
                  </Typography>
                  <Typography
                    variant="caption"
                    component={"a"}
                    fontStyle="italic"
                    sx={{ textDecoration: "underline" }}
                    href="https://huggingface.co/settings/billing/payment"
                    target={"_blank"}
                  >
                    here
                  </Typography>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel color="success">
                <Typography>Configuration</Typography>
              </StepLabel>
              <StepContent>
                <Stack gap={2}>
                  <Box display={"flex"} alignItems="center" gap={1}>
                    <FormControlLabel
                      sx={{
                        display: "block",
                      }}
                      control={
                        <Switch
                          disabled={settingsLoading || hfStatus === "BUILDING"}
                          checked={
                            hfStatus === "RUNNING" || hfStatus === "BUILDING"
                          }
                          onChange={onStartOrPause}
                          name="loading"
                          color={
                            hfStatus === "RUNNING" || hfStatus === "BUILDING"
                              ? "success"
                              : "error"
                          }
                        />
                      }
                      label="VM"
                    />
                    <Chip
                      label={hfStatus || "--"}
                      color={
                        hfStatus === "RUNNING"
                          ? "success"
                          : hfStatus === "BUILDING"
                          ? "warning"
                          : "error"
                      }
                      size="small"
                    ></Chip>
                    <IconButton
                      onClick={() => checkSpace()}
                      disabled={settingsLoading}
                    >
                      <RefreshRounded fontSize="small" />
                    </IconButton>
                  </Box>
                  {settingsLoading && <LinearProgress />}
                  <Box display={"flex"} alignItems="center" gap={2}>
                    <TextField
                      value={hfToken}
                      label="Access Token"
                      fullWidth
                      onChange={(e) => setEnteredAccessToken(e.target.value)}
                      error={!hfToken}
                      type={showAt ? "text" : "password"}
                    />
                    <IconButton onClick={() => setShowAt(!showAt)}>
                      {showAt ? (
                        <VisibilityOffRoundedIcon />
                      ) : (
                        <RemoveRedEyeRoundedIcon />
                      )}
                    </IconButton>
                  </Box>
                  {hfToken && (
                    <Box display={"flex"} alignItems="center" gap={4}>
                      <FormControl sx={{ width: "250px" }}>
                        <InputLabel id="demo-simple-select-label">
                          Machine Type
                        </InputLabel>
                        <Select
                          label="Machine Type"
                          value={machineType}
                          onChange={(e) => setMachineType(e.target.value)}
                        >
                          <MenuItem value={"t4-small"}>
                            t4-small ($0.6)
                          </MenuItem>
                          <MenuItem value={"t4-medium"}>
                            t4-medium ($0.9)
                          </MenuItem>
                          <MenuItem value={"a10g-small"}>
                            a10g-small ($1.5)
                          </MenuItem>
                          <MenuItem value={"a10g-large"}>
                            a10g-large ($3.15)
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={async () => {
                          setSettingsLoading(true);
                          const formData = new FormData();
                          formData.append("space_id", getSpaceId(userName));
                          formData.append("hf_token", hfToken);
                          formData.append("hardware", machineType);
                          await axios.post(
                            `${
                              import.meta.env.VITE_GPU_REMIX_SERVER
                            }/upgrade-space`,
                            formData
                          );
                          setSettingsLoading(false);
                        }}
                      >
                        Upgrade
                      </Button>
                    </Box>
                  )}
                </Stack>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={!!snackbarMessage}
        message={snackbarMessage}
        onClose={() => setSnackbarMessage("")}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />

      <Snackbar
        open={!!errorSnackbarMessage}
        color="error"
        onClose={() => setErrorSnackbarMessage("")}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setErrorSnackbarMessage("")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorSnackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default VoiceCover;

{
  /* <Dialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Box display={"flex"} alignItems="center" gap={1}>
              <FormControlLabel
                sx={{
                  display: "block",
                }}
                control={
                  <Switch
                    disabled={isHfStatusLoading || hfStatus === "BUILDING"}
                    checked={hfStatus === "RUNNING" || hfStatus === "BUILDING"}
                    onChange={async (e, checked) => {
                      if (hfStatus === "RUNNING") {
                        setIsHfStatusLoading(true);
                        await axios.post(
                          `${
                            import.meta.env.VITE_AUDIO_ANALYSER_PY
                          }/pause-space`,
                          { spaceId: "", hf_token: "" }
                        );
                        await getHfSpaceStatus(hfToken);
                        setIsHfStatusLoading(false);
                      } else {
                        setIsHfStatusLoading(true);
                        const formData = new FormData();
                        formData.append("space_id", spaceId);
                        formData.append("hf_token", hfToken);
                        await axios.post(
                          `${
                            import.meta.env.VITE_AUDIO_ANALYSER_PY
                          }/start-space`,
                          formData
                        );
                        await getHfSpaceStatus(hfToken);
                        setIsHfStatusLoading(false);
                      }
                    }}
                    name="loading"
                    color={
                      hfStatus === "RUNNING" || hfStatus === "BUILDING"
                        ? "success"
                        : "error"
                    }
                  />
                }
                label="VM"
              />
              <Chip
                label={hfStatus || "--"}
                color={
                  hfStatus === "RUNNING"
                    ? "success"
                    : hfStatus === "BUILDING"
                    ? "warning"
                    : "error"
                }
                size="small"
              ></Chip>
              <IconButton onClick={() => getHfSpaceStatus(hfToken)}>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Box>
            <Box display={"flex"} alignItems="center" gap={2}>
              <TextField
                value={hfToken}
                label="Access Token"
                fullWidth
                onChange={onAccessTokenChange}
                error={!hfToken}
                type={showAt ? "text" : "password"}
              />
              <IconButton onClick={() => setShowAt(!showAt)}>
                {showAt ? (
                  <VisibilityOffRoundedIcon />
                ) : (
                  <RemoveRedEyeRoundedIcon />
                )}
              </IconButton>
            </Box>
            {hfToken && (
              <Box display={"flex"} alignItems="center" gap={4}>
                <FormControl sx={{ width: "250px" }}>
                  <InputLabel id="demo-simple-select-label">
                    Machine Type
                  </InputLabel>
                  <Select
                    label="Machine Type"
                    value={machineType}
                    onChange={(e) => setMachineType(e.target.value)}
                  >
                    <MenuItem value={"t4-small"}>t4-small ($0.6)</MenuItem>
                    <MenuItem value={"t4-medium"}>t4-medium ($0.9)</MenuItem>
                    <MenuItem value={"a10g-small"}>a10g-small ($1.5)</MenuItem>
                    <MenuItem value={"a10g-large"}>a10g-large ($3.15)</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={async () => {
                    //   setLoadingStatus(true);
                    const formData = new FormData();
                    formData.append("hardware", machineType);
                    await axios.post(
                      `${import.meta.env.VITE_GPU_REMIX_SERVER}/upgrade-space`,
                      formData
                    );
                    //   await refreshHfStatus();
                    //   setLoadingStatus(false);
                  }}
                >
                  Upgrade
                </Button>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog> */
}
// const getHfSpaceStatus = async (_token: string) => {
//   const statusRes = await axios.get(
//     `https://huggingface.co/api/spaces/${spaceId}`,
//     {
//       headers: { Authorization: `Bearer ${hfToken}` },
//     }
//   );
//   if (statusRes) {
//     setHfStatus(statusRes.data.runtime.stage);
//     setMachineType(statusRes.data.runtime.hardware.requested);
//   }
//   // try {
//   //   const user = await whoAmI({
//   //     credentials: { accessToken: hfToken },
//   //   });
//   //   // const userId = user.id;
//   //   try {
//   //     await axios.get(
//   //       `https://huggingface.co/api/spaces/${user.name}/nusic-VoiceCoverGen`,
//   //       {
//   //         headers: { Authorization: `Bearer ${hfToken}` },
//   //       }
//   //     );
//   //   } catch (e) {
//   //     setSnackbarMessage("Space doesn't exist, creating one");
//   //     try {
//   //       const formData = new FormData();
//   //       formData.append("space_id", "nusic/nusic-VoiceCoverGen");
//   //       formData.append("hardware", machineType);
//   //       await axios.post(
//   //         `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/duplicate`,
//   //         formData
//   //       );
//   //       setSnackbarMessage("Space is created successfully");
//   //     } catch (e) {
//   //       setSnackbarMessage(
//   //         "Error occurred, kindly check if you have billing enabled"
//   //       );
//   //     }
//   //   }
//   //   const statusRes = await axios.get(
//   //     `https://huggingface.co/api/spaces/${spaceId}`,
//   //     {
//   //       headers: { Authorization: `Bearer ${hfToken}` },
//   //     }
//   //   );
//   //   if (statusRes) {
//   //     setHfStatus(statusRes.data.runtime.stage);
//   //     setMachineType(statusRes.data.runtime.hardware.requested);
//   //   }
//   // } catch (e) {
//   //   // TODO
//   // }
// };

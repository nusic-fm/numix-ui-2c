import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { collection, query, where } from "firebase/firestore";
import { useState } from "react";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { db } from "../services/firebase.service";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import { useDropzone } from "react-dropzone";

type Props = {
  voiceModelProps: {
    url: string;
    name: string;
    uploadFileUrl: string;
  };
  setVoiceModelProps: React.Dispatch<
    React.SetStateAction<{
      url: string;
      name: string;
      uploadFileUrl: string;
    }>
  >;
  userId: string;
  onDropZipFile: (acceptedFiles: File[]) => Promise<void>;
};

const VoiceModelSelection = ({
  voiceModelProps,
  setVoiceModelProps,
  userId,
  onDropZipFile,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles, rejectedFiles, e) => {
      if (acceptedFiles.length) {
        setChipSelected(false);
        setIsLoading(true);
        await onDropZipFile(acceptedFiles);
        setIsLoading(false);
      }
    },
    maxFiles: 1,
    multiple: false,
    accept: { "application/zip": [".zip"] },
  });
  const modelsRef = collection(db, "voice_models");
  const [list] = useCollectionDataOnce(
    query(modelsRef, where("user_id", "==", userId))
  );
  const [chipSelected, setChipSelected] = useState(false);

  return (
    <Stack
      mb={5}
      gap={2}
      mx={{ lg: 25 }}
      // sx={{ bgcolor: "rgb(20, 20, 20)" }}
      // p={5}
      // borderRadius="16px"
    >
      <Box
        display={"flex"}
        justifyContent="center"
        alignItems="center"
        gap={2}
        position="relative"
      >
        <TextField
          id="modelurl"
          fullWidth
          label="Model url or Upload zip"
          value={voiceModelProps.url || voiceModelProps.uploadFileUrl}
          onChange={(e) => {
            setVoiceModelProps({
              ...voiceModelProps,
              url: e.target.value,
              uploadFileUrl: "",
            });
          }}
          size="small"
          placeholder="HuggingFace/Pixeldrain urls"
          disabled={
            chipSelected || !!voiceModelProps.uploadFileUrl || isLoading
          }
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={isLoading}
                {...getRootProps({ className: "dropzone" })}
                size="small"
                sx={{
                  borderRadius: "4px",
                  width: 42,
                  height: 36,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={"16px"} color="secondary" />
                ) : (
                  <FileUploadRoundedIcon color="secondary" fontSize="small" />
                )}
              </IconButton>
            ),
          }}
        />
        <TextField
          id="modelname"
          label="Model Name"
          // sx={{ width: 500 }}
          value={voiceModelProps.name}
          onChange={(e) => {
            setVoiceModelProps({
              ...voiceModelProps,
              name: e.target.value,
            });
          }}
          size="small"
          disabled={chipSelected}
        />
      </Box>
      <Box
        display={"flex"}
        gap={1}
        flexWrap="wrap"
        justifyContent={"start"}
        alignItems="center"
      >
        <Typography variant="caption">Quick Selection:</Typography>
        {list && list.length > 0 ? (
          list.map((obj) => (
            <Chip
              label={obj.model_name}
              key={obj.model_url}
              variant="outlined"
              clickable
              color={
                obj.model_url === voiceModelProps.url ? "success" : "secondary"
              }
              onClick={() => {
                if (obj.model_url === voiceModelProps.url) {
                  setVoiceModelProps({ url: "", name: "", uploadFileUrl: "" });
                  setChipSelected(false);
                } else {
                  setChipSelected(true);
                  setVoiceModelProps({
                    url: obj.model_url,
                    name: obj.model_name,
                    uploadFileUrl: "",
                  });
                }
              }}
            />
          ))
        ) : (
          <Typography>-</Typography>
        )}
      </Box>
    </Stack>
  );
};

export default VoiceModelSelection;

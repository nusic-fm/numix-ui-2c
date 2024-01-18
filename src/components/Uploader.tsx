import { Box, Typography, Button, IconButton } from "@mui/material";
import { useDropzone } from "react-dropzone";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

type Props = {
  onDrop: (acceptedFiles: File[]) => void;
  initializeTone: () => void;
  playAudio: (url: string) => void;
  melodyFile?: File;
};

const Uploader = ({ onDrop, initializeTone, playAudio, melodyFile }: Props) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "audio/mpeg": [".mp3"], "audio/wav": [".wav"] },
  });

  return (
    <Box
      border={"1px dashed grey"}
      borderRadius="8px"
      onClick={() => {
        initializeTone();
        // onFetchAudio();
      }}
      display="flex"
      justifyContent={"center"}
    >
      {melodyFile ? (
        <Button
          disabled
          color="secondary"
          // size="small"
          sx={{ width: 300, textTransform: "none" }}
          variant="contained"
        >
          {melodyFile.name}
        </Button>
      ) : (
        <div
          {...getRootProps({ className: "dropzone" })}
          style={{ cursor: "default", padding: "24px" }}
        >
          <input {...getInputProps()} />
          <Typography>Drop your Favorite Music to start NUMIXing</Typography>
        </div>
      )}
      {melodyFile && (
        <IconButton
          onClick={() => {
            if (melodyFile) playAudio(URL.createObjectURL(melodyFile));
          }}
        >
          <PlayArrowRoundedIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default Uploader;

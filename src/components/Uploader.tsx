import { Box, Typography, Button, IconButton } from "@mui/material";
import { useDropzone } from "react-dropzone";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";

type Props = {
  onDrop: (acceptedFiles: File[]) => void;
  initializeTone: () => void;
  playAudio: (url: string) => void;
  melodyFile?: File;
  vid: string;
};

const Uploader = ({ onDrop, initializeTone, melodyFile, vid }: Props) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "audio/mpeg": [".mp3"], "audio/wav": [".wav"] },
  });

  return (
    <Box
      border={"1px solid #929292"}
      borderRadius="8px"
      onClick={() => {
        initializeTone();
        // onFetchAudio();
      }}
      display="flex"
      justifyContent={"center"}
      alignItems="center"
      height={56}
      position={"relative"}
    >
      {!!vid && (
        <Box
          position={"absolute"}
          top={0}
          left={0}
          zIndex={9}
          width="100%"
          height="100%"
          sx={{ borderRadius: "4px" }}
          onClick={() => {}}
        />
      )}
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
        <Box
          {...getRootProps({ className: "dropzone" })}
          style={{ cursor: "default" }}
          display="flex"
          alignItems={"center"}
          width="100%"
          pl={"14px"}
          gap={2}
        >
          <IconButton
            disabled={!!vid}
            sx={{
              borderRadius: "4px",
              width: 42,
              height: 36,
              background:
                "linear-gradient(90deg, rgba(84,50,255,1) 0%, rgba(237,50,255,1) 100%)",
            }}
          >
            <FileUploadRoundedIcon color="secondary" />
          </IconButton>
          <input {...getInputProps()} />
          <Typography align="center">Drop your Music here</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Uploader;

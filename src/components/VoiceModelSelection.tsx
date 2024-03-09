import { Box, Chip, Stack, TextField, Typography } from "@mui/material";
import { collection, query, where } from "firebase/firestore";
import { useState } from "react";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { db } from "../services/firebase.service";

type Props = {
  voiceModelProps: any;
  setVoiceModelProps: any;
  userId: string;
};

const VoiceModelSelection = ({
  voiceModelProps,
  setVoiceModelProps,
  userId,
}: Props) => {
  const modelsRef = collection(db, "voice_models");
  const [list] = useCollectionDataOnce(
    query(modelsRef, where("user_id", "==", userId))
  );
  const [chipSelected, setChipSelected] = useState(false);

  return (
    <Stack mb={5} gap={2} mx={{ lg: 25 }}>
      <Box
        display={"flex"}
        justifyContent="center"
        alignItems="center"
        gap={2}
        position="relative"
      >
        <TextField
          fullWidth
          label="Model Url"
          value={voiceModelProps.url}
          onChange={(e) => {
            setVoiceModelProps({
              ...voiceModelProps,
              url: e.target.value,
            });
          }}
          size="small"
          helperText="HugginFace/Pixeldrain"
          disabled={chipSelected}
        />
        <TextField
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
          helperText=" "
          disabled={chipSelected}
        />
      </Box>
      <Box
        display={"flex"}
        gap={2}
        flexWrap="wrap"
        justifyContent={"start"}
        alignItems="center"
      >
        <Typography variant="caption">Quick Selection:</Typography>
        {list ? (
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
                  setVoiceModelProps({ url: "", name: "" });
                  setChipSelected(false);
                } else {
                  setChipSelected(true);
                  setVoiceModelProps({
                    url: obj.model_url,
                    name: obj.model_name,
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

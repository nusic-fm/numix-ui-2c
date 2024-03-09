import {
  Autocomplete,
  Box,
  // createFilterOptions,
  TextField,
} from "@mui/material";
import { collection, query, where } from "firebase/firestore";
// import { useState } from "react";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { db } from "../services/firebase.service";

type Props = { userId: string };

const modelsRef = collection(db, "voice_models");

// const filter = createFilterOptions<{ name: string; url: string }>();

const VoiceModelsAutoComplete = ({ userId }: Props) => {
  const [collection] = useCollectionDataOnce(
    query(modelsRef, where("user_id", "==", userId))
  );

  return (
    <Box display={"flex"} gap={2} alignItems="center">
      <Autocomplete
        color="secondary"
        fullWidth
        id="free-solo-demo"
        freeSolo
        options={[{ title: "Test" }].map((option) => option.title)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter Voice Model link or Name"
            color="secondary"
          />
        )}
        onChange={(e, value, reason) => {
          debugger;
        }}
        onChangeCapture={(e) => {
          debugger;
        }}
      />
      {/* <Autocomplete
        fullWidth
        color="secondary"
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo
        options={collection as {url: string; name: string}[]}
        getOptionLabel={(option) => {
          // Regular option
          return option;
        }}
        renderOption={(props, option) => <li {...props}>{option.url}</li>}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.url);
          if (inputValue !== "" && !isExisting) {
            filtered.push({
              name: `Add "${inputValue}"`,
              url: inputValue,
            });
          }

          return filtered;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter Voice Model link or Name"
            color="secondary"
          />
        )}
        onChange={(e, value, reason, details) => {
          debugger;
        }}
      ></Autocomplete> */}
    </Box>
  );
};

export default VoiceModelsAutoComplete;

export const fileToBase64 = async (file: Blob) => {
  const reader = new FileReader();

  const promise = new Promise(
    (res) =>
      (reader.onload = (event) => {
        if (event.target?.result)
          res((event.target.result as string).split(",")[1]);
      })
  );

  // Read the entire file as a data URL
  reader.readAsDataURL(file);
  return promise;
};

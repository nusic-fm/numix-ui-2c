export const fileToArraybuffer = async (file: Blob) => {
  const reader = new FileReader();

  const promise = new Promise(
    (res) =>
      (reader.onload = (event) => {
        if (event.target?.result) res(event.target.result);
      })
  );

  // Read the entire file as a data URL
  reader.readAsArrayBuffer(file);
  return promise;
};

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

export const convertSecondsToHHMMSS = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let hhmmss = "";

  if (hours > 0) {
    hhmmss += hours + ":";
  }

  hhmmss += ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);

  return hhmmss;
};

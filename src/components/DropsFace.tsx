import { Button, Skeleton, Box } from "@mui/material";
import { useEffect, useState } from "react";
import BubbleUI from "react-bubble-ui";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseIcon from "@mui/icons-material/Pause";
import "react-bubble-ui/dist/index.css";

const getColorsForGroup = (name: string) => {
  switch (name) {
    case "House":
    case "Ambient":
    case "Pluggnb":
      return "rgb(33, 206, 175)";
    case "The Raver":
    case "Mystical":
    case "The Chase":
      return "rgb(58, 106, 231)";
    case "The Rocker":
    case "Future Bass":
    case "Indian":
    case "African":
      return "rgb(255, 130, 14)";
    default:
      return "rgb(208, 43, 250)";
  }
};
const testUrls = (idx: number) =>
  `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/shorts%2F${idx}.wav?alt=media`;

type SnippetProp = {
  url: string;
  name: string;
  color: string;
  duration: number;
};

type Props = {
  isTonePlaying: boolean;
  stopPlayer: () => void;
  playPlayer: () => void;
  genreNames: string[];
  newAudio?: string;
  playAudio: any;
};

const DropsFace = ({
  isTonePlaying,
  stopPlayer,
  playPlayer,
  genreNames,
  newAudio,
  playAudio,
}: Props) => {
  // const [prevLoadingNo, setPrevLoadingNo] = useState(-1);
  const [playUrl, setPlayUrl] = useState<string>();
  // const [newAudioNo, setNewAudioNo] = useState<number>(-1);
  const [positionArr] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [reorderArr] = useState<number[]>(() =>
    [...positionArr].sort(() => Math.random() - 0.5)
  );
  const [audioListObj, setAudioListObj] = useState<{
    [key: string]: SnippetProp;
  }>({});

  // useEffect(() => {
  //   const renderOrder = [...reorderArr];
  //   // console.log(renderOrder);
  //   renderOrder.map((no, i) => {
  //     const prompt = genreNames[i];

  //     // generateBatchMusic(prompt, durationArr[i].toString())
  //     new Promise((res) => setTimeout(res, (i + 1) * 2000)).then(() => {
  //       const url = testUrls(no - 1);
  //       if (url) {
  //         //   console.log(`no inside: ${no}`);
  //         audioListObjRef.current = {
  //           ...audioListObjRef.current,
  //           [no.toString()]: {
  //             url,
  //             name: prompt,
  //             color: getColorsForGroup(prompt),
  //             duration: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1][i],
  //           },
  //         };
  //       } else {
  //         console.error("Unable to fetch URL: ", no);
  //       }
  //       setPrevLoadingNo(no);
  //       setNewAudioNo(no);
  //       // const nextAudioToLoadNo = renderOrder[renderOrder.indexOf(no) + 1];
  //       // console.log("Next Loading: ", nextAudioToLoadNo);
  //       // // setLoadingNo(nextAudioToLoadNo);
  //     });
  //   });
  // }, []);

  useEffect(() => {
    if (playUrl) {
      playAudio(playUrl, true);
    }
  }, [playUrl]);

  useEffect(() => {
    if (newAudio) {
      setAudioListObj((preAudioListObj) => {
        const currentIdx = Object.keys(preAudioListObj).length;
        const name = genreNames[currentIdx];
        return {
          ...preAudioListObj,
          [reorderArr[currentIdx].toString()]: {
            name,
            color: getColorsForGroup(name),
            duration: 1,
            url: newAudio,
          },
        };
      });
      // playAudio(newAudio, true);
      setPlayUrl(newAudio);
    }
  }, [newAudio]);
  console.log(audioListObj);

  return (
    <BubbleUI
      options={{
        size: 140,
        minSize: 20,
        gutter: 40,
        provideProps: true,
        numCols: 4,
        fringeWidth: 160,
        yRadius: 130,
        xRadius: 220,
        cornerRadius: 50,
        showGuides: false,
        compact: true,
        gravitation: 5,
      }}
      className="myBubbleUI"
    >
      {positionArr.map((pos) => {
        const snippet = audioListObj[pos];
        const isSnippetPlaying = playUrl === snippet?.url;
        // if (snippet) {
        return (
          <Box
            className="childComponent"
            key={pos}
            height={snippet ? "140px" : "24px"}
            width={snippet ? "140px" : "24px"}
            style={{
              backgroundColor: isSnippetPlaying
                ? "transparent"
                : snippet?.color,
              outline: snippet?.color ? `4px solid ${snippet.color}` : "unset",
              transition: "0.3s ease",
            }}
          >
            {snippet && playUrl === snippet.url && (
              <Box
                position={"absolute"}
                height="100%"
                width={"100%"}
                borderRadius="50%"
                sx={{
                  border: `4px solid ${snippet.color}`,
                  filter: "blur(7px)",
                }}
              ></Box>
            )}
            {snippet ? (
              <Button
                color="secondary"
                sx={{
                  height: "100%",
                  width: "100%",
                  borderRadius: "50%",
                }}
                onClick={() => {
                  if (isSnippetPlaying) {
                    stopPlayer();
                    playPlayer();
                  } else setPlayUrl(snippet.url);
                }}
              >
                {snippet.name}
                {isTonePlaying && isSnippetPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayArrowRoundedIcon />
                )}
              </Button>
            ) : (
              <Skeleton
                variant="circular"
                width={"100%"}
                height={"100%"}
                animation="wave"
              />
            )}
          </Box>
        );
      })}
    </BubbleUI>
  );
};

export default DropsFace;

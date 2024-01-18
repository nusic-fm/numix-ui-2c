import { Button, Skeleton, Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
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
  const [prevLoadingNo, setPrevLoadingNo] = useState(-1);
  const [playPosition, setPlayPosition] = useState<number>(-1);
  const [newAudioNo, setNewAudioNo] = useState<number>(-1);
  const [positionArr] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [reorderArr] = useState<number[]>(() =>
    [...positionArr].sort(() => Math.random() - 0.5)
  );
  const [audioListObj, setAudioListObj] = useState<{
    [key: string]: SnippetProp;
  }>({});
  const audioListObjRef = useRef<object>({});

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
    if (newAudio) {
      console.log("triggered");
      setAudioListObj((preAudioListObj) => {
        const currentIdx = Object.keys(preAudioListObj).length;
        const name = genreNames[currentIdx];
        if (!currentIdx) {
          return {
            [reorderArr[0].toString()]: {
              name,
              color: getColorsForGroup(name),
              duration: 1,
              url: newAudio,
            },
          };
        } else
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
      playAudio(newAudio, true);
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
        // if (snippet) {
        return (
          <Box
            className="childComponent"
            key={pos}
            height={snippet ? "140px" : "24px"}
            width={snippet ? "140px" : "24px"}
            style={{
              backgroundColor: snippet?.color ?? "unset",
              transition: "0.2s ease",
            }}
          >
            {snippet && playPosition === pos && (
              <Box
                position={"absolute"}
                height="100%"
                width={"100%"}
                borderRadius="50%"
                sx={{
                  animation: "waves 2s linear infinite",
                  animationDelay: "1s",
                  background: snippet.color,
                  transition: "5s ease",
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
                  if (playPosition === pos) {
                    stopPlayer();
                    playPlayer();
                  } else setPlayPosition(pos);
                }}
              >
                {snippet.name}
                {isTonePlaying && playPosition === pos ? (
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

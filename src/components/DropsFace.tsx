import { Button, Skeleton, Box } from "@mui/material";
import { useEffect, useState } from "react";
import BubbleUI from "react-bubble-ui";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseIcon from "@mui/icons-material/Pause";
import "react-bubble-ui/dist/index.css";

const getColorsForGroup = (idx: number) => {
  switch (idx) {
    case 5:
    case 2:
    case 8:
      return "rgb(33, 206, 175)";
    case 9:
    case 1:
    case 7:
      return "rgb(58, 106, 231)";
    case 3:
    case 6:
    case 10:
      return "rgb(255, 130, 14)";
    default:
      return "rgb(208, 43, 250)";
  }
};

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
  playAudio: (url: string, start: boolean) => void;
  onGenreSelection: (description: string) => void;
};

const DropsFace = ({
  isTonePlaying,
  stopPlayer,
  playPlayer,
  genreNames,
  newAudio,
  playAudio,
  onGenreSelection,
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
      const key = Object.keys(audioListObj).find(
        (k) => audioListObj[k].url === playUrl
      );
      onGenreSelection(audioListObj[key ?? 0].name);
      playAudio(playUrl, true);
    }
  }, [playUrl]);

  useEffect(() => {
    if (newAudio) {
      setAudioListObj((preAudioListObj) => {
        const currentIdx = Object.keys(preAudioListObj).length;
        // const idx = reorderArr[currentIdx] - 1;
        const name = genreNames[currentIdx];
        return {
          ...preAudioListObj,
          [reorderArr[currentIdx].toString()]: {
            name,
            color: getColorsForGroup(currentIdx),
            duration: 1,
            url: newAudio,
          },
        };
      });
      // playAudio(newAudio, true);
      setPlayUrl(newAudio);
    }
  }, [newAudio]);

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
        const isNext = reorderArr[Object.keys(audioListObj).length] === pos;
        // if (snippet) {
        return (
          <Box
            className={"childComponent"}
            key={pos}
            height={snippet ? "140px" : isNext ? "120px" : "24px"}
            width={snippet ? "140px" : isNext ? "120px" : "24px"}
            style={{
              backgroundColor: snippet?.color,
              // outline: snippet?.color ? `4px solid ${snippet.color}` : "unset",
              transition: "all 0.4s",
            }}
          >
            {isNext && (
              <Skeleton
                variant="circular"
                width={"24px"}
                height={"24px"}
                animation="wave"
              />
            )}
            {/* {snippet && playUrl === snippet.url && (
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
            )} */}
            {/* {isNext ? (
              // <Box
              //   // position={"absolute"}
              //   height="100%"
              //   width={"100%"}
              //   borderRadius="50%"
              //   sx={{
              //     border: `4px solid ${getColorsForGroup(genreNames[pos])}`,
              //     filter: "blur(7px)",
              //   }}
              // ></Box>
              <motion.div
                initial={{ opacity: 0.5, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 4 }}
                className="loader-css"
                style={{
                  borderColor: getColorsForGroup(
                    genreNames[Object.keys(audioListObj).length]
                  ),
                }}
              ></motion.div>
            ) : (
              !snippet && (
                // <Skeleton
                //   variant="circular"
                //   width={"100%"}
                //   height={"100%"}
                //   animation="wave"
                // />
                <></>
              )
            )} */}
            {snippet && (
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
            )}
          </Box>
        );
      })}
    </BubbleUI>
  );
};

export default DropsFace;

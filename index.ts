import fs from "fs";

type Word = {
  alignedWord: string;
  case: string;
  end: number;
  endOffset: number;
  phones: Phone[];
  start: number;
  startOffset: number;
  word: string;
};

type Phone = {
  duration: number;
  phone: string;
};

type GentleOutput = {
  transcript: string;
  words: Word[];
};

type Lyric = {
  lyric: string;
  start: string;
  end: string;
};

const jsonFile = fs.readFileSync("assets/align.json", "utf-8");
const align = JSON.parse(jsonFile) as GentleOutput;

const lyrics = align["transcript"]
  .replace(/[^a-z|A-Z|0-9|'|\n]/g, " ")
  .split(" ")
  .filter((w) => w !== "");

console.log(lyrics);

const words = align["words"];

const timeMatchedLyrics: Lyric[] = [];

let j = 0;
let runningLyric: Lyric = {
  lyric: "",
  start: "",
  end: "",
};
for (let i = 0; i < lyrics.length; i++) {
  const transcriptWord = lyrics[i];
  let word = words[j];

  // console.log({ transcriptWord, word: word.word });

  if (transcriptWord[0] === "\n") {
    timeMatchedLyrics.push(runningLyric);
    runningLyric = {
      lyric: "",
      start: word?.start ? word.start.toString() : runningLyric.start,
      end: "",
    };
  }

  runningLyric.lyric += transcriptWord.trim() + " ";
  if (i === 0) {
    runningLyric.start = "0";
  } else {
    if (word.start) runningLyric.end = word.start.toString();
  }

  if (transcriptWord.trim() === word.word.trim()) j++;
}

timeMatchedLyrics.push(runningLyric);

console.log(timeMatchedLyrics);

function getTimeFromSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${minutes}:${secs}`;
}

function generateLRC(lyrics: Lyric[]): string {
  return lyrics
    .map((item) => {
      // Extract minutes, seconds, and milliseconds from the start time which is in seconds
      const startSeconds = getTimeFromSeconds(parseFloat(item.start));

      // Format the LRC timestamp as [mm:ss.xx]
      return `[${startSeconds}] ${item.lyric}`;
    })
    .join("\n");
}

console.log(generateLRC(timeMatchedLyrics));

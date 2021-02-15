import { spawn } from "child_process";
import { Stream } from "stream";
import ffmpeg_static from "ffmpeg-static";

export default (
  params: {
    ar?: number;
    ac?: number;
    timelength?: number;
    informat?: string;
    input: string | string[];
    outformat?: string;
    output: string;
  },
  pipes: {
    stdin:
      | number
      | Stream
      | "pipe"
      | "inherit"
      | "ignore"
      | "ipc"
      | null
      | undefined;
    stdout:
      | number
      | Stream
      | "pipe"
      | "inherit"
      | "ignore"
      | "ipc"
      | null
      | undefined;
  }
) => {
  const args = [
    "-vn", // cut video
    ...(params.ar ? ["-ar", params.ar + ""] : []),
    ...(params.ac ? ["-ac", params.ac + ""] : []),
    ...(params.informat ? ["-f", params.informat] : []),
    ...(params.timelength ? ["-t", params.timelength + ""] : []),
    ...(typeof params.input === "string"
      ? ["-i", params.input || "pipe:0"]
      : params.input.length === 0
      ? ["-i", "pipe:0"]
      : params.input.reduce(
          (acc: string[], input) => [...acc, "-i", input],
          []
        )),
    ...(params.outformat ? ["-f", params.outformat] : []),
    params.output || "pipe:1",
  ].filter((x) => !!x);

  return spawn(ffmpeg_static, args, {
    stdio: [
      pipes.stdin,
      pipes.stdout,
      process.env.NODE_ENV !== "production" ? "inherit" : "ignore",
    ],
    cwd: ".",
  });
};

import { toVideoProvider } from "@/shared/utils/video";

/** Past this the duration is left empty instead of making the editor wait */
const TIMEOUT_MS = 10_000;
/** The API takes from 1 s to 24 h */
const MAX_SECONDS = 24 * 60 * 60;

/**
 * Reads how long a video lasts, so the teacher doesn't have to type it.
 * The server doesn't do it: YouTube needs an API key and fetching URLs the
 * user picks would open the server to SSRF.
 */
export async function readVideoDuration(
  videoUrl: string,
): Promise<number | null> {
  const provider = toVideoProvider(videoUrl);
  const reading =
    provider.kind === "youtube"
      ? youtubeDuration(provider.id)
      : provider.kind === "vimeo"
        ? vimeoDuration(provider.id)
        : fileDuration(videoUrl);

  const seconds = await Promise.race([
    reading.catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS)),
  ]);
  if (!seconds || !Number.isFinite(seconds)) return null;

  return Math.min(MAX_SECONDS, Math.max(1, Math.round(seconds)));
}

/** Only the metadata is downloaded, never the video */
function fileDuration(src: string): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const done = (seconds: number | null) => {
      video.removeAttribute("src");
      video.load();
      resolve(seconds);
    };

    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => done(video.duration);
    video.onerror = () => done(null);
    video.src = src;
  });
}

/** The oEmbed endpoint answers without an API key */
async function vimeoDuration(id: string): Promise<number | null> {
  const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const { duration } = (await response.json()) as { duration?: number };
  return duration ?? null;
}

type YouTubePlayer = { getDuration: () => number; destroy: () => void };
type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onError: () => void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApi: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  youtubeApi ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT);

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      // Lets a later call try again
      youtubeApi = null;
      script.remove();
      reject(new Error("Could not load the YouTube player"));
    };
    document.head.append(script);
  });

  return youtubeApi;
}

const POLL_MS = 250;

/** A hidden player that is never played; the duration comes with the video data */
async function youtubeDuration(id: string): Promise<number | null> {
  const YT = await loadYouTubeApi();

  return new Promise((resolve) => {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:fixed;width:1px;height:1px;left:-9999px;top:0;opacity:0;pointer-events:none";
    const target = document.createElement("div");
    host.append(target);
    document.body.append(host);

    let player: YouTubePlayer | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    const started = Date.now();
    const done = (seconds: number | null) => {
      clearInterval(timer);
      player?.destroy();
      host.remove();
      resolve(seconds);
    };

    new YT.Player(target, {
      videoId: id,
      events: {
        // getDuration() can answer 0 until the video data arrives
        onReady: ({ target: ready }) => {
          player = ready;
          timer = setInterval(() => {
            const seconds = ready.getDuration();
            if (seconds > 0) done(seconds);
            else if (Date.now() - started > TIMEOUT_MS) done(null);
          }, POLL_MS);
        },
        onError: () => done(null),
      },
    });
  });
}

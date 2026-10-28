export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string };

/** Where a video URL is hosted, with the id of the video when it's embedded */
export type VideoProvider =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "file" };

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com"];

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") return url.pathname.slice(1) || null;
  if (!YOUTUBE_HOSTS.includes(url.hostname)) return null;
  if (url.pathname === "/watch") return url.searchParams.get("v");
  const [, kind, id] = url.pathname.split("/");
  return (kind === "embed" || kind === "shorts") && id ? id : null;
}

function vimeoId(url: URL): string | null {
  if (url.hostname === "player.vimeo.com") {
    return url.pathname.match(/^\/video\/(\d+)/)?.[1] ?? null;
  }
  if (url.hostname !== "vimeo.com" && url.hostname !== "www.vimeo.com")
    return null;
  return url.pathname.match(/^\/(\d+)/)?.[1] ?? null;
}

export function toVideoProvider(videoUrl: string): VideoProvider {
  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return { kind: "file" };
  }

  const youtube = youtubeId(url);
  if (youtube) return { kind: "youtube", id: youtube };

  const vimeo = vimeoId(url);
  if (vimeo) return { kind: "vimeo", id: vimeo };

  return { kind: "file" };
}

/**
 * YouTube and Vimeo links play in their embed player, any other URL is
 * treated as a video file for the `<video>` element.
 */
export function toVideoSource(videoUrl: string): VideoSource {
  const provider = toVideoProvider(videoUrl);

  if (provider.kind === "youtube")
    return {
      kind: "embed",
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(provider.id)}`,
    };

  if (provider.kind === "vimeo")
    return {
      kind: "embed",
      src: `https://player.vimeo.com/video/${provider.id}`,
    };

  return { kind: "file", src: videoUrl };
}

export function isVideoUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

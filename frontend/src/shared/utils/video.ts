export type VideoSource =
  { kind: "embed"; src: string } | { kind: "file"; src: string };

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

/**
 * YouTube and Vimeo links play in their embed player, any other URL is
 * treated as a video file for the `<video>` element.
 */
export function toVideoSource(videoUrl: string): VideoSource {
  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return { kind: "file", src: videoUrl };
  }

  const youtube = youtubeId(url);
  if (youtube)
    return {
      kind: "embed",
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}`,
    };

  const vimeo = vimeoId(url);
  if (vimeo)
    return { kind: "embed", src: `https://player.vimeo.com/video/${vimeo}` };

  return { kind: "file", src: videoUrl };
}

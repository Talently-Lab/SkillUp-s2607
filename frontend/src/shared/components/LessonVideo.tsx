import { toVideoSource } from "@/shared/utils/video";
import PlayIcon from "@/assets/icons/play.svg";
import "./LessonVideo.css";

type LessonVideoProps = {
  /** null shows a placeholder, the lesson has no video yet */
  videoUrl: string | null;
  title: string;
  poster?: string;
};

export function LessonVideo({ videoUrl, title, poster }: LessonVideoProps) {
  if (!videoUrl) {
    return (
      <div className="lesson-video lesson-video--empty">
        <img className="lesson-video__empty-icon" src={PlayIcon} alt="" />
        <p className="lesson-video__empty-text">
          Esta clase todavía no tiene video
        </p>
      </div>
    );
  }

  const source = toVideoSource(videoUrl);

  return (
    <div className="lesson-video">
      {source.kind === "embed" ? (
        <iframe
          className="lesson-video__media"
          src={source.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video
          className="lesson-video__media"
          src={source.src}
          poster={poster}
          controls
          preload="metadata"
          aria-label={title}
        />
      )}
    </div>
  );
}

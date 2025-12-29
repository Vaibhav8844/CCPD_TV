import { BACKEND_URL } from "../config";

export default function YoutubePlayer({ data }) {
  if (!data || (!data.videoId && !data.videoUrl)) {
    return (
      <div className="widget youtube">
        <p>No video selected</p>
      </div>
    );
  }

  const {
    videoSource = "youtube",
    videoId,
    videoUrl,
    autoplay = true,
    mute = true,
    loop = true
  } = data;

  // If uploaded video
  if (videoSource === "uploaded" && videoUrl) {
    const fullVideoUrl = videoUrl.startsWith("http") 
      ? videoUrl 
      : `${BACKEND_URL}${videoUrl}`;

    return (
      <video
        src={fullVideoUrl}
        autoPlay={autoplay}
        muted={mute}
        loop={loop}
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: "#000"
        }}
      />
    );
  }

  // If YouTube video
  if (videoSource === "youtube" && videoId) {
    // Loop requires playlist param = same videoId
    const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${mute ? 1 : 0}&controls=0&rel=0&loop=${loop ? 1 : 0}&playlist=${loop ? videoId : ""}&fullscreen=1`;

    return (
      <iframe
        src={src}
        title="YouTube Player"
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
      />
    );
  }

  return (
    <div className="widget youtube">
      <p>No video selected</p>
    </div>
  );
}

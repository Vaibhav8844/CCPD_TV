import { useEffect, useRef } from "react";
import { BACKEND_URL } from "../config";

export default function BackgroundMusic({ data }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (data?.enabled && data?.musicUrl) {
      audio.volume = data.volume || 0.3;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [data]);

  if (!data?.enabled || !data?.musicUrl) {
    return null;
  }

  const fullAudioUrl = data.musicUrl.startsWith("http") 
    ? data.musicUrl 
    : `${BACKEND_URL}${data.musicUrl}`;

  return (
    <audio
      ref={audioRef}
      src={fullAudioUrl}
      loop
      style={{ display: "none" }}
    />
  );
}

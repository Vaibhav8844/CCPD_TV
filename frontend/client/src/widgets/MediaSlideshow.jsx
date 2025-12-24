import { useEffect, useState } from "react";

export default function MediaSlideshow({ data = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!data.length) return;

    const duration = (data[index]?.duration || 5) * 1000;

    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % data.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [index, data]);

  if (!data.length) {
    return (
      <div className="media-slideshow empty">
        No media configured
      </div>
    );
  }

  return (
    <div className="media-slideshow">
      <img
        src={data[index].url}
        alt="Slide"
        className="media-image"
        draggable={false}
      />
    </div>
  );
}

import React from "react";
import YouTubePlayer from "./video/YouTubePlayer";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  thumbnailUrl?: string;
  className?: string;
}

export default function VideoPlayer({
  videoId,
  title = "Workout Video",
}: VideoPlayerProps) {
  return (
    <YouTubePlayer
      videoId={videoId}
      title={title}
    />
  );
}

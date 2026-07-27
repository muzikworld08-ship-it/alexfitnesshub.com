import React, { useState } from "react";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
}

export default function YouTubePlayer({
  videoId,
  title,
}: YouTubePlayerProps) {
  const [hasError, setHasError] = useState(false);

  if (!videoId) {
    return (
      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-6 text-center text-sm font-medium text-slate-500">
        Video unavailable.
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-xl bg-red-55/10 dark:bg-red-950/10 border border-red-200 dark:border-red-900 p-6 text-center">
        <p className="text-sm font-bold text-red-600 dark:text-red-400">
          Video temporarily unavailable.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Please check your network connection or if embedding is allowed for this content.
        </p>
      </div>
    );
  }

  // Sanitize video ID just in case an full URL slipped in
  const cleanVideoId = videoId.includes("/") || videoId.includes("?") 
    ? (videoId.split("v=")[1]?.split("&")[0] || videoId.split("/").pop()?.split("?")[0] || videoId)
    : videoId;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-slate-950"
      style={{ paddingBottom: "56.25%" }}
    >
      <iframe
        className="absolute top-0 left-0 h-full w-full"
        src={`https://www.youtube.com/embed/${cleanVideoId}?rel=0&modestbranding=1&playsinline=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => {
          console.error("YouTube Player failed to load video with ID:", cleanVideoId);
          setHasError(true);
        }}
      />
    </div>
  );
}

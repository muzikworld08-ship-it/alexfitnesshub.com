export async function validateYoutubeVideo(videoId: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  if (!videoId || videoId.trim() === "") {
    return { isValid: false, error: "Invalid Video ID: Empty value." };
  }

  const apiKey = (typeof window !== "undefined" 
    ? (import.meta.env.VITE_YOUTUBE_API_KEY || (window as any).NEXT_PUBLIC_YOUTUBE_API_KEY)
    : process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) || "";

  // 1. If API Key is configured, use official YouTube v3 API
  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=status,player,snippet&id=${videoId}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }
      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        return { isValid: false, error: "Video Deleted or Invalid Video ID." };
      }

      const video = data.items[0];
      const embeddable = video.status?.embeddable;
      const privacyStatus = video.status?.privacyStatus;

      if (embeddable === false) {
        return { isValid: false, error: "Embedding Disabled." };
      }
      if (privacyStatus === "private") {
        return { isValid: false, error: "Video is private." };
      }

      return { isValid: true };
    } catch (err: any) {
      console.warn("YouTube API check failed, falling back to oEmbed validation:", err.message);
    }
  }

  // 2. oEmbed validation fallback (extremely robust & works without API keys)
  try {
    const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      return { isValid: false, error: "Network Error: Unable to verify video existence." };
    }
    const data = await res.json();
    if (data.error) {
      return { isValid: false, error: "Invalid Video ID or Embedding Disabled." };
    }
    // Check if it's a valid youtube object
    if (!data.title || !data.provider_name || data.provider_name !== "YouTube") {
      return { isValid: false, error: "Video not found or is private/unembeddable." };
    }
    return { isValid: true };
  } catch (err: any) {
    console.error("Verification error:", err);
    return { isValid: false, error: "Network Error: Failed to connect to verification servers." };
  }
}

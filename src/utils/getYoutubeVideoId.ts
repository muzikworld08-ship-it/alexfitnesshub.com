export function getYoutubeVideoId(url: string): string {
  if (!url) return "";
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^?&/]+)/;
  const match = url.match(regex);
  return match ? match[1] : url;
}

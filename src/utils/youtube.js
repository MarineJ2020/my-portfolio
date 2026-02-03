/**
 * Extracts YouTube video ID from various URL formats and returns embed URL, or null if not YouTube.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  let id = null;
  // youtu.be/ID
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) id = shortMatch[1];
  // youtube.com/watch?v=ID or youtube.com/embed/ID
  if (!id) {
    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    id = watchMatch?.[1] || embedMatch?.[1] || null;
  }
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export function isYouTubeUrl(url) {
  return !!getYouTubeEmbedUrl(url);
}

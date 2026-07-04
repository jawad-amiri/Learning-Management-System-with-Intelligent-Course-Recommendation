export function formatDate(value?: string) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDuration(totalSeconds?: number) {
  const seconds = Number(totalSeconds ?? 0);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function toNumber(value?: string | number | null) {
  return Number(value ?? 0);
}

export function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function youtubeEmbedUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const id =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.replace("/", "")
        : parsed.searchParams.get("v");

    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

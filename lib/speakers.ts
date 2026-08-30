const speakerImages: Record<string, string> = {
  "sergio gonzalez": "/images/wix/about/sergio.webp"
};

function normalizeSpeakerKey(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getSpeakerImage(
  name?: string,
  authorImage?: string
): string | undefined {
  if (authorImage) return authorImage;
  if (!name) return undefined;
  return speakerImages[normalizeSpeakerKey(name)];
}

export function previewUrl(collection: "series" | "teachings" | "resources") {
  return (data: Record<string, unknown>, options?: { req?: { locale?: string } }) => {
    const id = data.id;
    if (!id) return "/";
    const locale = options?.req?.locale || (typeof data._locale === "string" ? data._locale : "es");
    const query = new URLSearchParams({ collection, id: String(id), locale });
    return `/api/preview?${query.toString()}`;
  };
}

export type NotionMetadataOption = {
  id?: string;
  name: string;
};

export function normalizeMetadataName(value: string) {
  return value
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-MX");
}

export function seriesMigrationKey(optionId: string | undefined, slug: string) {
  return optionId
    ? `notion:series-option:${optionId}`
    : `notion:series:${slug}`;
}

export function topicMigrationKey(option: NotionMetadataOption) {
  return option.id
    ? `notion:topic-option:${option.id}`
    : `topic:${normalizeMetadataName(option.name)}`;
}

export function authorMigrationKey(pageId: string) {
  return `notion:author:${pageId}`;
}

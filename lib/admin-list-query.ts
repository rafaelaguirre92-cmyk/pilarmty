export function normalizeColumnsParam(params: URLSearchParams): boolean {
  const rawColumns = params.get("columns");
  if (!rawColumns) return false;

  let parsedColumns: unknown = rawColumns;

  // Payload serializes the column array into the URL. Older/custom navigation
  // could serialize that value a second time, leaving a JSON string that
  // contains another JSON string. Unwrap both representations here.
  for (let pass = 0; pass < 2 && typeof parsedColumns === "string"; pass += 1) {
    try {
      parsedColumns = JSON.parse(parsedColumns);
    } catch {
      return false;
    }
  }

  if (!Array.isArray(parsedColumns) || !parsedColumns.every((column) => typeof column === "string")) {
    return false;
  }

  const normalizedColumns = JSON.stringify(parsedColumns);
  if (normalizedColumns === rawColumns) return false;

  params.set("columns", normalizedColumns);
  return true;
}

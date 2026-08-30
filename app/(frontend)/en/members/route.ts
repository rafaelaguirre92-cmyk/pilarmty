export function GET() {
  return new Response("This service is no longer available.", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}

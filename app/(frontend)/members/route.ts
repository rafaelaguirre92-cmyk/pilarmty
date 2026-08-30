export function GET() {
  return new Response("Este servicio ya no está disponible.", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}

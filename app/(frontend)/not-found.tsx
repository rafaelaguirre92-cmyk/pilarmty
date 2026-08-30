import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-page">
      <p className="eyebrow">404</p>
      <h1>Esta página no está disponible</h1>
      <p>
        Puede que haya cambiado de dirección o que ya no forme parte del sitio.
      </p>
      <Link className="button" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}

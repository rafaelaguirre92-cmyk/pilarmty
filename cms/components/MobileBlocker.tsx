import Image from "next/image";
import Link from "next/link";

export function MobileBlocker() {
  return (
    <div className="pilar-mobile-blocker" role="region" aria-label="Aviso de compatibilidad">
      <div className="pilar-mobile-blocker__card">
        <header className="pilar-mobile-blocker__header">
          <Link href="/" className="pilar-mobile-blocker__logo-link" aria-label="Iglesia Pilar">
            <Image
              className="pilar-mobile-blocker__logo pilar-mobile-blocker__logo--light"
              src="/brand/iglesia-pilar.png"
              alt="Iglesia Pilar"
              width={224}
              height={84}
              priority
              unoptimized
            />
            <Image
              className="pilar-mobile-blocker__logo pilar-mobile-blocker__logo--dark"
              src="/brand/iglesia-pilar-white.png"
              alt="Iglesia Pilar"
              width={224}
              height={84}
              priority
              unoptimized
            />
          </Link>
        </header>

        <div className="pilar-mobile-blocker__content">
          <p className="pilar-mobile-blocker__kicker">Panel editorial · Iglesia Pilar</p>

          <h1 className="pilar-mobile-blocker__title">
            Una experiencia pensada para pantallas amplias.
          </h1>

          <p className="pilar-mobile-blocker__body">
            El panel de administración requiere mayor espacio de trabajo para la redacción, edición y gestión de enseñanzas y publicaciones.
          </p>

          <aside className="pilar-mobile-blocker__note">
            <span className="pilar-mobile-blocker__note-label">Recomendación</span>
            <p>
              Por favor ingresa desde tu <strong>computadora</strong> o <strong>tablet</strong> para continuar.
            </p>
          </aside>

          <div className="pilar-mobile-blocker__actions">
            <Link href="/" className="pilar-mobile-blocker__btn-primary">
              Volver al sitio web →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

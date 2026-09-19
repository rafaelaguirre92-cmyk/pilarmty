import Image from "next/image";

export function AdminLogo() {
  return (
    <div className="pilar-admin-logo" aria-label="Iglesia Pilar">
      <Image
        className="pilar-admin-logo__image pilar-admin-logo__image--light"
        src="/brand/iglesia-pilar.png"
        alt="Iglesia Pilar"
        width={224}
        height={84}
        priority
        unoptimized
      />
      <Image
        className="pilar-admin-logo__image pilar-admin-logo__image--dark"
        src="/brand/iglesia-pilar-white.png"
        alt="Iglesia Pilar"
        width={224}
        height={84}
        priority
        unoptimized
      />
    </div>
  );
}

export function AdminIcon() {
  return (
    <span
      aria-label="Iglesia Pilar"
      className="pilar-admin-icon"
      role="img"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="pilar-admin-icon__image pilar-admin-icon__image--light"
        height={1024}
        src="/brand/iso-iglesia-pilar.png"
        unoptimized
        width={1024}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="pilar-admin-icon__image pilar-admin-icon__image--dark"
        height={1024}
        src="/brand/iso-iglesia-pilar-white.png"
        unoptimized
        width={1024}
      />
    </span>
  );
}

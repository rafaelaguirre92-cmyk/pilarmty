import Image from "next/image";

export function AdminLogo() {
  return (
    <div
      className="pilar-admin-logo"
      aria-label="Iglesia Pilar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "100%"
      }}
    >
      <Image
        className="pilar-admin-logo__image pilar-admin-logo__image--light"
        src="/brand/iglesia-pilar.png"
        alt="Iglesia Pilar"
        width={240}
        height={90}
        priority
        unoptimized
        style={{ width: "auto", height: "auto", maxHeight: "54px", maxWidth: "240px", objectFit: "contain" }}
      />
      <Image
        className="pilar-admin-logo__image pilar-admin-logo__image--dark"
        src="/brand/iglesia-pilar-white.png"
        alt="Iglesia Pilar"
        width={240}
        height={90}
        priority
        unoptimized
        style={{ width: "auto", height: "auto", maxHeight: "54px", maxWidth: "240px", objectFit: "contain" }}
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        flexShrink: 0
      }}
    >
      <Image
        alt="Iglesia Pilar"
        aria-hidden="true"
        className="pilar-admin-icon__image pilar-admin-icon__image--light"
        height={32}
        src="/brand/iso-iglesia-pilar.png"
        unoptimized
        width={32}
        style={{ width: "32px", height: "32px", objectFit: "contain" }}
      />
      <Image
        alt="Iglesia Pilar"
        aria-hidden="true"
        className="pilar-admin-icon__image pilar-admin-icon__image--dark"
        height={32}
        src="/brand/iso-iglesia-pilar-white.png"
        unoptimized
        width={32}
        style={{ width: "32px", height: "32px", objectFit: "contain" }}
      />
    </span>
  );
}


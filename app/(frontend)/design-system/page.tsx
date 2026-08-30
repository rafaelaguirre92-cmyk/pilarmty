import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./design-system.module.css";

export const metadata: Metadata = {
  title: "Design system",
  description: "Referencia visual interna para la migración de Iglesia Pilar.",
  robots: {
    index: false,
    follow: false
  }
};

const colors = [
  { name: "Fondo principal", value: "#F0ECE9", className: styles.paper },
  { name: "Azul Pilar", value: "#142534", className: styles.navy },
  { name: "Acento", value: "#A4580C", className: styles.rust },
  { name: "Verde", value: "#AEB592", className: styles.sage },
  { name: "Petróleo", value: "#1D434B", className: styles.teal },
  { name: "Fondo alterno", value: "#F3F8F0", className: styles.mist }
];

const spacingScale = [
  { token: "01", value: 8, use: "Separación mínima" },
  { token: "02", value: 16, use: "Controles y elementos relacionados" },
  { token: "03", value: 24, use: "Espacio interno compacto" },
  { token: "04", value: 32, use: "Espacio entre componentes" },
  { token: "06", value: 48, use: "Bloques de contenido" },
  { token: "08", value: 64, use: "Separación editorial" },
  { token: "10", value: 80, use: "Secciones compactas" },
  { token: "14", value: 112, use: "Secciones principales" }
];

function SearchMark() {
  return <span aria-hidden="true" className={styles.searchMark} />;
}

export default function DesignSystemPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logo} href="/" aria-label="Iglesia Pilar">
          <Image
            className={styles.lightLogo}
            src="/brand/iglesia-pilar.png"
            alt="Iglesia Pilar"
            width={245}
            height={92}
            priority
          />
          <Image
            className={styles.darkLogo}
            src="/brand/iglesia-pilar-white.png"
            alt="Iglesia Pilar"
            width={980}
            height={368}
            priority
          />
        </Link>
        <nav className={styles.nav} aria-label="Muestra de navegación">
          <a className={styles.active} href="#fundamentos">
            Inicio
          </a>
          <a href="#tipografia">Conócenos</a>
          <a href="#componentes">Recursos</a>
          <a href="#plantillas">Visítanos</a>
        </nav>
        <div className={styles.headerActions}>
          <button aria-label="Buscar" className={styles.iconButton} type="button">
            <SearchMark />
          </button>
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.kicker}>Referencia interna · Iglesia Pilar</p>
        <h1>
          Un sistema visual construido para conservar la{" "}
          <em>identidad actual.</em>
        </h1>
        <p>
          Esta página reúne los elementos que deben aprobarse antes de aplicarlos
          a Inicio, Recursos y las páginas institucionales.
        </p>
      </section>

      <section className={styles.section} id="fundamentos">
        <div className={styles.sectionHeading}>
          <p>01</p>
          <div>
            <span>Fundamentos</span>
            <h2>
              Color, superficie y <em>ritmo.</em>
            </h2>
          </div>
        </div>

        <div className={styles.colorGrid}>
          {colors.map((color) => (
            <article className={styles.colorCard} key={color.value}>
              <div className={color.className} />
              <p>{color.name}</p>
              <code>{color.value}</code>
            </article>
          ))}
        </div>

        <div className={styles.gradientGuide}>
          <div className={styles.gradientHeading}>
            <p className={styles.specimenLabel}>Degradados</p>
            <p>
              El sistema utiliza degradados para conectar superficies vecinas o
              para integrar una fotografía. Las transiciones siguen un orden
              definido y mantienen una zona sólida detrás del texto.
            </p>
          </div>

          <p className={styles.gradientSubheading}>Degradados de superficie</p>
          <div className={styles.surfaceGradientGrid}>
            <article>
              <div className={styles.creamToMist} />
              <div>
                <strong>Crema → fondo alterno</strong>
                <code>#F0ECE9 → #F3F8F0</code>
              </div>
            </article>
            <article>
              <div className={styles.mistToSage} />
              <div>
                <strong>Fondo alterno → verde</strong>
                <code>#F3F8F0 → #AEB592</code>
              </div>
            </article>
            <article>
              <div className={styles.sageToTeal} />
              <div>
                <strong>Verde → petróleo</strong>
                <code>#AEB592 → #1D434B</code>
              </div>
            </article>
            <article>
              <div className={styles.tealToNavy} />
              <div>
                <strong>Petróleo → azul Pilar</strong>
                <code>#1D434B → #142534</code>
              </div>
            </article>
          </div>

          <p className={styles.gradientSubheading}>Degradados hacia fotografía</p>
          <div className={styles.gradientGrid}>
            <article>
              <div className={styles.sagePhotoGradient}>
                <span>Texto sobre verde sólido</span>
              </div>
              <div>
                <strong>Verde a fotografía</strong>
                <p>Para formularios y bloques de comunidad.</p>
              </div>
            </article>
            <article>
              <div className={styles.navyPhotoGradient}>
                <span>Texto claro sobre azul</span>
              </div>
              <div>
                <strong>Azul a fotografía</strong>
                <p>Para portadas con contenido sobre imagen.</p>
              </div>
            </article>
            <article>
              <div className={styles.creamPhotoGradient}>
                <span>Transición desde crema</span>
              </div>
              <div>
                <strong>Crema a fotografía</strong>
                <p>Para transiciones editoriales suaves.</p>
              </div>
            </article>
          </div>

          <div className={styles.gradientRules}>
            <span>Solo se conectan superficies consecutivas de la secuencia.</span>
            <span>El texto permanece dentro de la zona sólida.</span>
            <span>Fotografía y color usan una sola superficie como transición.</span>
            <span>El naranja no participa en degradados de superficie.</span>
          </div>
        </div>

        <div className={styles.contrastGuide}>
          <div className={styles.contrastHeading}>
            <p className={styles.specimenLabel}>Combinaciones y contraste</p>
            <p>
              El color de texto se elige por legibilidad, no solamente por
              afinidad visual. El texto normal requiere al menos 4.5:1 y el
              texto grande, los iconos y los controles requieren 3:1.
            </p>
          </div>

          <div className={styles.approvedContrasts}>
            <article className={styles.navyOnSage}>
              <span>Aprobado · 7.31:1</span>
              <strong>Azul sobre verde</strong>
              <p>Texto, títulos y controles.</p>
            </article>
            <article className={styles.tealOnSage}>
              <span>Aprobado · 5.02:1</span>
              <strong>Petróleo sobre verde</strong>
              <p>Texto normal y elementos funcionales.</p>
            </article>
            <article className={styles.navyOnCream}>
              <span>Aprobado · 13.30:1</span>
              <strong>Azul sobre crema</strong>
              <p>Combinación principal del sitio.</p>
            </article>
            <article className={styles.rustOnWhite}>
              <span>Aprobado · 5.28:1</span>
              <strong>Naranja sobre blanco</strong>
              <p>Etiquetas y acentos editoriales.</p>
            </article>
            <article className={styles.whiteOnTeal}>
              <span>Aprobado · 10.73:1</span>
              <strong>Blanco sobre petróleo</strong>
              <p>Bloques de énfasis y llamadas.</p>
            </article>
            <article className={styles.whiteOnRust}>
              <span>Aprobado · 5.28:1</span>
              <strong>Blanco sobre naranja</strong>
              <p>Bloques breves y acciones destacadas.</p>
            </article>
            <article className={styles.whiteOnNavy}>
              <span>Aprobado · 15.63:1</span>
              <strong>Blanco sobre azul Pilar</strong>
              <p>Principios, navegación y bloques institucionales.</p>
            </article>
          </div>

          <div className={styles.rejectedContrasts}>
            <p className={styles.specimenLabel}>No utilizar para texto</p>
            <div>
              <article>
                <span className={styles.sageSwatch} />
                <span className={styles.rustSwatch} />
                <strong>Naranja + verde</strong>
                <small>2.47:1</small>
              </article>
              <article>
                <span className={styles.sageSwatch} />
                <span className={styles.whiteSwatch} />
                <strong>Blanco + verde</strong>
                <small>2.14:1</small>
              </article>
              <article>
                <span className={styles.rustSwatch} />
                <span className={styles.navySwatch} />
                <strong>Azul + naranja</strong>
                <small>2.96:1</small>
              </article>
            </div>
          </div>
        </div>

        <div className={styles.tokenGrid}>
          <article>
            <span>Contenedor</span>
            <strong>1200 px</strong>
            <p>Máximo observado en las composiciones principales.</p>
          </article>
          <article>
            <span>Unidad base</span>
            <strong>8 px</strong>
            <p>Origen de todas las medidas de espacio y geometría.</p>
          </article>
          <article>
            <span>Radio base</span>
            <strong>8 px</strong>
            <p>Controles, fotografías y tarjetas de contenido.</p>
          </article>
          <article>
            <span>Radio destacado</span>
            <strong>16 px</strong>
            <p>Tarjetas destacadas y superficies flotantes.</p>
          </article>
        </div>
      </section>

      <section className={styles.section} id="espaciado">
        <div className={styles.sectionHeading}>
          <p>02</p>
          <div>
            <span>Espaciado</span>
            <h2>
              Una retícula de <em>8 píxeles.</em>
            </h2>
          </div>
        </div>

        <div className={styles.spacingStatement}>
          <p className={styles.specimenLabel}>Regla del sistema</p>
          <p>
            Márgenes, rellenos, separaciones, alturas estructurales y radios
            utilizan múltiplos de 8 px. La tipografía, los bordes de 1 px y la
            construcción interna de los iconos conservan sus propias medidas.
          </p>
        </div>

        <div className={styles.spacingScale}>
          {spacingScale.map((space) => (
            <article key={space.value}>
              <div>
                <span>{space.token}</span>
                <strong>{space.value} px</strong>
              </div>
              <i
                aria-hidden="true"
                style={{ "--space-width": `${space.value}px` } as CSSProperties}
              />
              <p>{space.use}</p>
            </article>
          ))}
        </div>

        <div className={styles.radiusScale}>
          <article>
            <div className={styles.radiusEight} />
            <span>Radio base</span>
            <strong>8 px</strong>
            <p>Botones, campos, imágenes y tarjetas.</p>
          </article>
          <article>
            <div className={styles.radiusSixteen} />
            <span>Radio destacado</span>
            <strong>16 px</strong>
            <p>Tarjetas destacadas y superficies flotantes.</p>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.typeSection}`} id="tipografia">
        <div className={styles.sectionHeading}>
          <p>03</p>
          <div>
            <span>Tipografía</span>
            <h2>
              Montserrat conversa con <em>Playfair Display.</em>
            </h2>
          </div>
        </div>

        <div className={styles.typeSpecimens}>
          <article>
            <p className={styles.specimenLabel}>Titular principal · 48/62</p>
            <h3 className={styles.displaySpecimen}>
              Una <em>comunidad</em> construida sobre un solo fundamento:{" "}
              <em>Cristo.</em>
            </h3>
          </article>
          <article>
            <p className={styles.specimenLabel}>Titular de sección · 40/52</p>
            <h3 className={styles.sectionSpecimen}>
              El <em>discipulado</em> se vive en comunidad.
            </h3>
          </article>
          <article>
            <p className={styles.specimenLabel}>Cuerpo · 18/29</p>
            <p className={styles.bodySpecimen}>
              Somos Iglesia Pilar, una comunidad en la zona sur de Monterrey.
              Caminamos juntos en el discipulado para vivir y anunciar el
              evangelio en nuestra ciudad.
            </p>
          </article>
          <article>
            <p className={styles.specimenLabel}>Navegación · 16/20 · 700</p>
            <p className={styles.navSpecimen}>
              INICIO · CONÓCENOS · RECURSOS · VISÍTANOS
            </p>
          </article>
        </div>

        <div className={styles.typeRules}>
          <article>
            <p className={styles.specimenLabel}>Montserrat · Tipografía principal</p>
            <h3>Se usa para comunicar con claridad.</h3>
            <ul>
              <li>Títulos y subtítulos completos.</li>
              <li>Párrafos y contenido de lectura.</li>
              <li>Navegación, botones, etiquetas y metadatos.</li>
              <li>Peso 400 para lectura y peso 700 para jerarquía funcional.</li>
            </ul>
            <div className={styles.ruleExample}>
              <span>Ejemplo</span>
              <p>Explorando la Palabra de Dios para vivir el evangelio.</p>
            </div>
          </article>

          <article>
            <p className={styles.specimenLabel}>
              Playfair Display · Acento editorial
            </p>
            <h3>
              Se usa para dar <em>énfasis y calidez.</em>
            </h3>
            <ul>
              <li>Una palabra o frase breve dentro de un titular.</li>
              <li>Conceptos centrales como comunidad, discipulado o Cristo.</li>
              <li>Siempre en cursiva y acompañada por Montserrat.</li>
              <li>No se usa en párrafos, navegación, botones ni etiquetas.</li>
            </ul>
            <div className={styles.ruleExample}>
              <span>Ejemplo</span>
              <p>
                Una <em>comunidad</em> construida sobre Cristo.
              </p>
            </div>
          </article>
        </div>

        <aside className={styles.typePrinciple}>
          <span>Regla general</span>
          <p>
            Montserrat construye la frase; Playfair Display destaca solamente
            la idea que debe permanecer en la memoria.
          </p>
        </aside>
      </section>

      <section className={styles.section} id="componentes">
        <div className={styles.sectionHeading}>
          <p>04</p>
          <div>
            <span>Componentes</span>
            <h2>
              Acciones y contenido con una presencia <em>serena.</em>
            </h2>
          </div>
        </div>

        <div className={styles.componentBlock}>
          <p className={styles.specimenLabel}>Botones</p>
          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} type="button">
              Visítanos
            </button>
            <button className={styles.secondaryButton} type="button">
              Conoce más
            </button>
            <button className={styles.textButton} type="button">
              Ver enseñanzas →
            </button>
          </div>
        </div>

        <div className={styles.cardGrid}>
          <article className={styles.communityCard}>
            <div className={styles.cardImage}>
              <Image
                src="/images/wix/visit/comunidad.webp"
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className={styles.specimenLabel}>Comunidad misional</p>
              <h3>Comunidad Sur</h3>
              <button className={styles.textButton} type="button">
                Conoce más →
              </button>
            </div>
          </article>

          <article className={styles.teachingCard}>
            <div className={styles.cardImage}>
              <Image
                src="/images/series/orador-invitado.webp"
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className={styles.specimenLabel}>Enseñanza</p>
              <h3>La grandiosa sabiduría de Dios</h3>
              <p>Romanos 11:33-36</p>
              <button className={styles.textButton} type="button">
                Leer enseñanza →
              </button>
            </div>
          </article>
        </div>

        <div className={styles.formSpecimen}>
          <div>
            <p className={styles.specimenLabel}>Formulario</p>
            <h3>
              Queremos <em>conocerte.</em>
            </h3>
          </div>
          <form>
            <label>
              Nombre
              <input placeholder="Nombre" readOnly />
            </label>
            <label>
              Correo
              <input placeholder="Correo" readOnly />
            </label>
            <label className={styles.fullField}>
              Mensaje
              <textarea placeholder="Mensaje" readOnly rows={3} />
            </label>
            <button className={styles.primaryButton} type="button">
              Enviar
            </button>
          </form>
        </div>
      </section>

      <section className={`${styles.section} ${styles.templateSection}`} id="plantillas">
        <div className={styles.sectionHeading}>
          <p>05</p>
          <div>
            <span>Construcción</span>
            <h2>
              Cómo se construyen las páginas del <em>sitio.</em>
            </h2>
          </div>
        </div>

        <div className={styles.constructionIntro}>
          <p className={styles.specimenLabel}>Principio general</p>
          <p>
            Cada página se ensambla con secciones independientes dentro de un
            contenedor común. La jerarquía, el espacio y las proporciones se
            mantienen; el contenido determina qué composición se utiliza.
          </p>
        </div>

        <div className={styles.mobileFirstGuide}>
          <div>
            <p className={styles.specimenLabel}>Enfoque obligatorio</p>
            <h3>
              El sitio se construye <em>mobile first.</em>
            </h3>
            <p>
              La versión móvil define el orden del contenido, la jerarquía y los
              estilos base. Tablet y escritorio amplían esa estructura sin
              cambiar su prioridad editorial.
            </p>
          </div>

          <div className={styles.viewportScale}>
            <article>
              <span>Base</span>
              <strong>Móvil</strong>
              <small>Hasta 719 px</small>
              <p>Una columna y contenido esencial primero.</p>
            </article>
            <article>
              <span>Expansión 01</span>
              <strong>Tablet</strong>
              <small>Desde 720 px</small>
              <p>Se habilitan divisiones cuando el contenido las necesita.</p>
            </article>
            <article>
              <span>Expansión 02</span>
              <strong>Escritorio</strong>
              <small>Desde 980 px</small>
              <p>Rejillas amplias dentro del contenedor de 1200 px.</p>
            </article>
          </div>

          <div className={styles.mobileFirstRule}>
            <span>Regla técnica</span>
            <code>Base móvil → @media (min-width: 720px) → @media (min-width: 980px)</code>
          </div>
        </div>

        <div className={styles.layoutPatterns}>
          <article>
            <span className={styles.patternNumber}>01</span>
            <div className={`${styles.patternExample} ${styles.editorialExample}`}>
              <p className={styles.specimenLabel}>Iglesia Pilar</p>
              <h4>
                Una <em>comunidad</em> construida sobre un solo fundamento:{" "}
                <em>Cristo.</em>
              </h4>
              <button className={styles.primaryButton} type="button">
                Visítanos
              </button>
              <div>
                <Image
                  src="/images/church-community.webp"
                  alt=""
                  fill
                  sizes="(max-width: 980px) 100vw, 33vw"
                />
              </div>
            </div>
            <h3>Entrada editorial</h3>
            <p>
              Etiqueta, titular, introducción y acción. Puede alinearse al centro
              o a la izquierda, sin superar el ancho de lectura.
            </p>
          </article>

          <article>
            <span className={styles.patternNumber}>02</span>
            <div className={`${styles.patternExample} ${styles.realSplitExample}`}>
              <div>
                <Image
                  src="/images/wix/visit/comunidad.webp"
                  alt=""
                  fill
                  sizes="(max-width: 980px) 50vw, 16vw"
                />
              </div>
              <div>
                <p className={styles.specimenLabel}>Comunidad misional</p>
                <h4>Comunidad Sur</h4>
                <button className={styles.textButton} type="button">
                  Conoce más →
                </button>
              </div>
            </div>
            <h3>Contenido dividido</h3>
            <p>
              Imagen y contenido comparten el espacio. Se utiliza en bloques
              institucionales, comunidades y llamados destacados.
            </p>
          </article>

          <article>
            <span className={styles.patternNumber}>03</span>
            <div className={`${styles.patternExample} ${styles.realGridExample}`}>
              <div>
                <div>
                  <Image
                    src="/images/series/orador-invitado.webp"
                    alt=""
                    fill
                    sizes="(max-width: 980px) 33vw, 11vw"
                  />
                </div>
                <span>Orador Invitado</span>
                <strong>La grandiosa sabiduría de Dios</strong>
              </div>
              <div>
                <div>
                  <Image
                    src="/images/series/marcos.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 980px) 33vw, 11vw"
                  />
                </div>
                <span>Marcos</span>
                <strong>La semilla que crece en secreto</strong>
              </div>
              <div>
                <div>
                  <Image
                    src="/images/series/profetas-a-ninive.webp"
                    alt=""
                    fill
                    sizes="(max-width: 980px) 33vw, 11vw"
                  />
                </div>
                <span>Profetas a Nínive</span>
                <strong>El Evangelio es para Todos</strong>
              </div>
            </div>
            <h3>Rejilla editorial</h3>
            <p>
              Tarjetas repetibles para enseñanzas y recursos. La proporción se
              elige según la jerarquía y el contexto de la imagen.
            </p>
          </article>
        </div>

        <div className={styles.constructionRules}>
          <div>
            <p className={styles.specimenLabel}>Geometría</p>
            <dl>
              <div>
                <dt>Contenedor</dt>
                <dd>1200 px máximo</dd>
              </div>
              <div>
                <dt>Sección</dt>
                <dd>112 px vertical · 80 px móvil</dd>
              </div>
              <div>
                <dt>Texto de lectura</dt>
                <dd>760 px máximo</dd>
              </div>
              <div>
                <dt>Imagen editorial</dt>
                <dd>16:9 destacada · 1:1 listados y series</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className={styles.specimenLabel}>Comportamiento</p>
            <ol>
              <li>Una sección comunica una sola idea principal.</li>
              <li>Montserrat construye la jerarquía y Playfair marca el énfasis.</li>
              <li>Las superficies parten del crema y usan color por bloques.</li>
              <li>Los estilos base son móviles y se amplían con min-width.</li>
              <li>
                La navegación principal se centra respecto al ancho completo
                de la página, independientemente del logo y las acciones.
              </li>
            </ol>
          </div>
        </div>

        <div className={styles.surfaceBand}>
          <article>
            <span>Base</span>
            <strong>Crema principal</strong>
          </article>
          <article>
            <span>Contenido</span>
            <strong>Superficie clara</strong>
          </article>
          <article>
            <span>Énfasis</span>
            <strong>Color por bloque</strong>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkModeSection}`} id="dark-mode">
        <div className={styles.sectionHeading}>
          <p>06</p>
          <div>
            <span>Dark mode</span>
            <h2>
              Reglas para construir el tema <em>oscuro.</em>
            </h2>
          </div>
        </div>

        <div className={styles.darkModeIntro}>
          <p className={styles.specimenLabel}>Principio general</p>
          <p>
            El modo oscuro cambia las superficies y la jerarquía de texto, pero
            no modifica la identidad de marca, las fotografías ni el significado
            de los colores. Cada combinación debe conservar contraste AA.
          </p>
        </div>

        <div className={styles.darkTokenGrid}>
          <article>
            <span>Lienzo</span>
            <div className={styles.darkCanvasToken} />
            <strong>Azul Pilar</strong>
            <code>#142534</code>
          </article>
          <article>
            <span>Superficie elevada</span>
            <div className={styles.darkSurfaceToken} />
            <strong>Petróleo</strong>
            <code>#1D434B</code>
          </article>
          <article>
            <span>Texto principal</span>
            <div className={styles.darkTextToken} />
            <strong>Crema</strong>
            <code>#F0ECE9</code>
          </article>
          <article>
            <span>Etiqueta y foco</span>
            <div className={styles.darkAccentToken} />
            <strong>Verde</strong>
            <code>#AEB592</code>
          </article>
        </div>

        <div className={styles.darkMapping}>
          <p className={styles.specimenLabel}>Mapa de aplicación</p>
          <div>
            <article>
              <span>Contexto</span>
              <strong>Superficie</strong>
              <strong>Texto</strong>
              <strong>Acento</strong>
            </article>
            <article>
              <span>Página</span>
              <p>Azul Pilar</p>
              <p>Crema</p>
              <p>Verde</p>
            </article>
            <article>
              <span>Tarjeta elevada</span>
              <p>Petróleo</p>
              <p>Fondo alterno</p>
              <p>Verde</p>
            </article>
            <article>
              <span>Tarjeta editorial con imagen</span>
              <p>Blanco</p>
              <p>Azul Pilar</p>
              <p>Naranja</p>
            </article>
            <article>
              <span>Navegación</span>
              <p>Azul Pilar</p>
              <p>Blanco</p>
              <p>Verde</p>
            </article>
            <article>
              <span>Campos</span>
              <p>Azul Pilar</p>
              <p>Crema</p>
              <p>Verde</p>
            </article>
          </div>
        </div>

        <div className={styles.darkRuleGrid}>
          <article>
            <p className={styles.specimenLabel}>Navegación</p>
            <ul>
              <li>Se integra al fondo y utiliza solamente un divisor inferior.</li>
              <li>No utiliza cápsula, sombra ni efecto frost.</li>
              <li>Utiliza azul Pilar con el logotipo blanco oficial.</li>
              <li>El estado activo utiliza verde, nunca naranja.</li>
              <li>Iconos y texto utilizan blanco.</li>
            </ul>
          </article>
          <article>
            <p className={styles.specimenLabel}>Componentes</p>
            <ul>
              <li>Las tarjetas elevadas utilizan petróleo, no negro.</li>
              <li>
                Las tarjetas editoriales con imagen conservan el cuerpo blanco
                y texto azul Pilar en ambos modos.
              </li>
              <li>Los campos utilizan azul Pilar con texto crema.</li>
              <li>El foco se muestra siempre con verde o fondo alterno.</li>
            </ul>
          </article>
          <article>
            <p className={styles.specimenLabel}>Imágenes y degradados</p>
            <ul>
              <li>Las fotografías nunca se invierten ni cambian de color.</li>
              <li>Los overlays parten de petróleo o azul Pilar.</li>
              <li>La transición preferida es petróleo → azul Pilar.</li>
            </ul>
          </article>
          <article>
            <p className={styles.specimenLabel}>Contraste</p>
            <ul>
              <li>Crema sobre azul Pilar: 13.30:1.</li>
              <li>Crema sobre petróleo: 9.14:1.</li>
              <li>Verde sobre azul Pilar: 7.31:1.</li>
              <li>Nunca usar naranja directamente sobre fondos oscuros.</li>
            </ul>
          </article>
        </div>

        <div className={styles.darkComponentSample}>
          <div>
            <p className={styles.specimenLabel}>Muestra funcional</p>
            <h3>
              Contenido legible sobre una superficie <em>oscura.</em>
            </h3>
            <p>
              El fondo oscuro reduce luminosidad sin perder la calidez de la
              identidad ni alterar el contenido editorial.
            </p>
          </div>
          <div className={styles.darkActions}>
            <button type="button">Acción principal</button>
            <button type="button">Acción secundaria</button>
            <a href="#dark-mode">Enlace de texto →</a>
          </div>
        </div>

        <div className={styles.darkTechnicalRules}>
          <div>
            <p className={styles.specimenLabel}>Regla técnica</p>
            <code>data-theme=&quot;dark&quot;</code>
          </div>
          <ol>
            <li>El tema claro es el valor predeterminado.</li>
            <li>La elección explícita de la persona se conserva.</li>
            <li>La preferencia del sistema se usa solo cuando no existe elección.</li>
            <li>El tema se aplica antes de mostrar la página para evitar parpadeos.</li>
          </ol>
        </div>

        <aside className={styles.darkManualNote}>
          Las muestras anteriores de paleta, contraste y componentes permanecen
          claras cuando se activa el toggle porque documentan el tema original.
          Esta excepción no se aplica a los componentes del sitio público.
        </aside>
      </section>

      <footer className={styles.footer}>
        <Image
          className={styles.lightLogo}
          src="/brand/iglesia-pilar.png"
          alt="Iglesia Pilar"
          width={245}
          height={92}
        />
        <Image
          className={styles.darkLogo}
          src="/brand/iglesia-pilar-white.png"
          alt="Iglesia Pilar"
          width={980}
          height={368}
        />
        <p>
          Design system interno · No indexable ·{" "}
          <Link href="/">Volver al sitio</Link>
        </p>
        <label className={styles.themeToggle}>
          <span className={styles.themeName}>
            <span className={styles.lightModeLabel}>Light mode</span>
            <span className={styles.darkModeLabel}>Dark mode</span>
          </span>
          <input
            aria-label="Cambiar modo de color"
            className={styles.themeInput}
            role="switch"
            type="checkbox"
          />
          <span aria-hidden="true" className={styles.themeTrack}>
            <i />
          </span>
        </label>
      </footer>
    </main>
  );
}

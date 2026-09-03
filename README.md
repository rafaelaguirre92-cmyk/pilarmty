# Iglesia Pilar

Sitio público en Next.js 16 y administración editorial con Payload CMS. Las
páginas institucionales permanecen en código; series, enseñanzas, recursos,
autores, temas, medios y redirecciones viven en Payload.

## Desarrollo local

1. Copiar `.env.example` a `.env.local`.
2. Ejecutar `npm install` y `npm run dev`.
3. Abrir `http://localhost:3000/admin` y crear el primer administrador.

Sin `DATABASE_URL`, Payload usa `.payload/pilar.db` y guarda medios en
`public/payload-media`. En producción, `DATABASE_URL` es obligatoria y debe
apuntar a Neon PostgreSQL. Todos los usuarios autenticados son administradores;
solo el primer usuario puede registrarse sin una sesión existente.

## Variables de producción

- `SITE_URL=https://www.iglesiapilar.mx`
- `DATABASE_URL`: conexión pooled de Neon.
- `PAYLOAD_SECRET`: secreto aleatorio largo y exclusivo de producción.
- `BLOB_READ_WRITE_TOKEN`: almacenamiento de Vercel Blob.
- `BIBLE_API_KEY`: contenido de los tooltips de referencias bíblicas.
- `RESEND_API_KEY` y `PAYLOAD_FROM_EMAIL`: recuperación de contraseñas.
- `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY` y
  `QSTASH_NEXT_SIGNING_KEY`: publicaciones programadas.
- `CONTENT_SOURCE=notion|payload`: interruptor de lanzamiento y rollback.

Para el primer despliegue se puede usar temporalmente `PAYLOAD_DB_PUSH=true`
para crear el esquema vacío. Después de generar y aplicar las migraciones de
PostgreSQL, debe volver a `false`; nunca se debe activar para cambios de esquema
no revisados en producción.

## Programación editorial

Payload crea trabajos idempotentes para publicar y despublicar. QStash debe
enviar un `POST` cada cinco minutos a:

`https://www.iglesiapilar.mx/api/payload-jobs`

El endpoint rechaza cualquier petición sin una firma QStash válida. La
precisión máxima esperada es cinco minutos. Draft Mode se activa desde la vista
previa del panel y exige una sesión administrativa.

## Idiomas

El español es el contenido canónico y el único registro principal de cada
publicación. El inglés vive como una variante localizada dentro del mismo
documento; nunca debe crearse como una publicación independiente. Al publicar
o actualizar contenido español, Payload genera la variante inglesa cuando
`DEEPL_API_KEY` está configurada. Una corrección manual hecha en inglés se
conserva y no modifica el original español.

## Conexión y migración desde Notion

Crear una conexión interna en Notion y compartirle únicamente `Recursos - IP`
y sus páginas relacionadas. Para el primer ensayo basta `Read content`; para la
sincronización de dos vías también necesita `Update content`. Guardar el secreto
como `NOTION_API_TOKEN` en `.env.local` y nunca copiarlo al repositorio.

La base `Recursos - IP` utiliza estos campos de integración: `Payload ID`,
`CMS URL`, `Estado de sincronización`, `Última sincronización` y `Origen del
último cambio`. Los enlaces de reproducción se guardan en `YouTube URL` y
`Spotify URL`; el campo histórico `Youtube` conserva su texto editorial.

```bash
npm run content:migrate:dry
npm run content:migrate
```

El primer comando no modifica Payload y escribe el reporte en
`.payload/migration-report.json`. La migración real exige el token de Notion,
hace upsert mediante claves estables, importa archivos, convierte los bloques a
Lexical, enlaza traducciones y registra bloques no compatibles y archivos
fallidos. Debe ejecutarse dos veces y compararse el reporte y los conteos antes
del cambio de fuente. Con `NOTION_WRITEBACK_ENABLED=false` no escribe nada en
Notion. Al activarlo, confirma en Notion el ID y estado de cada registro
importado.

Para cambios posteriores, configurar un webhook de páginas hacia
`https://www.iglesiapilar.mx/api/notion/webhook` y guardar su secreto en
`NOTION_WEBHOOK_VERIFICATION_TOKEN`. El webhook actualiza el documento ligado
en Payload. Las ediciones de las propiedades de un documento ligado en Payload
se devuelven a Notion cuando `NOTION_WRITEBACK_ENABLED=true`; el contexto interno
evita ciclos de actualización.

La reconciliación completa se ejecuta diariamente mediante Vercel Cron en
`/api/notion/sync`. El endpoint exige `CRON_SECRET`; Vercel lo envía
automáticamente como `Authorization: Bearer ...`. La regla editorial es:

- Si Payload tiene un cambio pendiente, Payload se escribe en Notion.
- Si ambos lados cambiaron, prevalece Payload.
- Si Payload no cambió y Notion sí, se importa la versión de Notion.
- Un error individual queda registrado y no detiene el resto del lote.

El mismo proceso puede ejecutarse manualmente desde **Configuración** en el
panel. Los autosaves de Payload solo marcan el documento como pendiente para
evitar múltiples escrituras remotas mientras se edita.

Inventario mínimo esperado:

- 8 series o eventos.
- 42 enseñanzas históricas en español.
- 12 enseñanzas en inglés.
- 12 pares de traducción.
- Todo recurso o enseñanza adicional de Notion con `Web=true` y campos completos.

## Lanzamiento y rollback

1. Desplegar con `CONTENT_SOURCE=notion` y crear el primer administrador.
2. Ejecutar dry-run, migración real dos veces y revisar el reporte de paridad.
3. Validar URLs, metadata, sitemaps, imágenes, búsqueda y redirecciones.
4. Cambiar únicamente `CONTENT_SOURCE=payload` y redesplegar.
5. Mantener Notion disponible siete días. Para revertir, restaurar
   `CONTENT_SOURCE=notion`; no se cambia DNS ni ninguna URL.
6. Al terminar la ventana, exportar Notion, eliminar su webhook y credenciales.

Las redirecciones históricas de Wix siguen en `proxy.ts`. Los cambios de slug
publicado en Payload requieren confirmación y crean una redirección permanente
directa automáticamente.

## Verificación

```bash
npm test
npm run lint
npm run build
```

`/api/health` informa el estado de Payload/PostgreSQL y la configuración de Blob
y QStash sin revelar secretos. `/admin` y `/api` están excluidos de indexación.

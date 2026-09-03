"use client";

import { Button, useForm, useFormProcessing } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TopicPublishControlClientProps = {
  automatic: boolean;
  contentCount: number;
  initialManual: boolean;
  initialUnpublished: boolean;
};

export function TopicPublishControlClient({
  automatic,
  contentCount,
  initialManual,
  initialUnpublished
}: TopicPublishControlClientProps) {
  const { submit } = useForm();
  const router = useRouter();
  const processing = useFormProcessing();
  const [manual, setManual] = useState(initialManual);
  const [unpublished, setUnpublished] = useState(initialUnpublished);
  const hasContent = contentCount > 0;
  const published = !unpublished && (automatic || (hasContent && manual));
  const disabled = processing || published || !hasContent;

  const title = automatic && !unpublished
    ? `Publicada automáticamente porque tiene ${contentCount} contenidos.`
    : !hasContent
      ? "El tema necesita al menos un contenido antes de publicar su página."
      : published
        ? "La página está publicada. Usa el menú de tres puntos para despublicarla."
        : "Publicar la página de este tema.";

  async function togglePublication() {
    if (disabled) return;
    const result = await submit({
      overrides: {
        publishPage: automatic ? false : true,
        unpublishPage: false
      }
    });
    if (result?.res?.ok) {
      setManual(!automatic);
      setUnpublished(false);
      router.refresh();
    }
  }

  return (
    <Button
      aria-pressed={published}
      buttonStyle="secondary"
      className={`topic-publish-control${published ? " is-published" : ""}`}
      disabled={disabled}
      id="action-publish-topic-page"
      onClick={togglePublication}
      size="medium"
      tooltip={title}
      type="button"
    >
      {published ? "Publicada" : "Publicar"}
    </Button>
  );
}

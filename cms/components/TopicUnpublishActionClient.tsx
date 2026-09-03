"use client";

import { PopupList, useForm, useFormProcessing } from "@payloadcms/ui";
import { useRouter } from "next/navigation";

export function TopicUnpublishActionClient() {
  const { submit } = useForm();
  const processing = useFormProcessing();
  const router = useRouter();

  async function unpublish() {
    if (processing) return;
    const result = await submit({
      overrides: {
        publishPage: false,
        unpublishPage: true
      }
    });
    if (result?.res?.ok) router.refresh();
  }

  return (
    <PopupList.Button id="action-unpublish-topic-page" onClick={unpublish}>
      Despublicar
    </PopupList.Button>
  );
}

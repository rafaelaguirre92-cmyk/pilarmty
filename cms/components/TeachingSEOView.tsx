"use client";

import { DefaultEditView } from "@payloadcms/ui";
import type { DocumentViewClientProps } from "payload";
import { useEffect } from "react";

const SEO_TAB_INDEX = 1;
const CONTENT_TAB_INDEX = 0;

function selectEditorialTab(index: number) {
  const tabs = document.querySelectorAll<HTMLButtonElement>(
    ".tabs-field > .tabs-field__tabs-wrap .tabs-field__tab-button"
  );

  tabs[index]?.click();
}

function TeachingDocumentView({
  activeTabIndex,
  ...props
}: DocumentViewClientProps & { activeTabIndex: number }) {
  useEffect(() => {
    // DefaultEditView mounts the native Tabs field after this view. Let it
    // initialize, then select its own requested tab so Payload retains normal
    // form state, validation, draft and save behavior.
    const timer = window.setTimeout(() => selectEditorialTab(activeTabIndex), 300);

    return () => window.clearTimeout(timer);
  }, [activeTabIndex]);

  return <DefaultEditView {...props} />;
}

/**
 * Keeps SEO as a first-class Payload document view while reusing Payload's
 * own form, save controls, validation, drafts and leave-without-saving flow.
 */
export function TeachingSEOView(props: DocumentViewClientProps) {
  return <TeachingDocumentView {...props} activeTabIndex={SEO_TAB_INDEX} />;
}

export function TeachingContentView(props: DocumentViewClientProps) {
  return <TeachingDocumentView {...props} activeTabIndex={CONTENT_TAB_INDEX} />;
}

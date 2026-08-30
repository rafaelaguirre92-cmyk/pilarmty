import {
  BlocksFeature,
  ChecklistFeature,
  lexicalEditor,
  UploadFeature
} from "@payloadcms/richtext-lexical";

import {
  AccordionBlock,
  CalloutBlock,
  DownloadBlock,
  EmbedBlock
} from "@/cms/blocks/content";

export const contentEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    ChecklistFeature(),
    UploadFeature({ collections: { media: { fields: [] } } }),
    BlocksFeature({
      blocks: [CalloutBlock, EmbedBlock, AccordionBlock, DownloadBlock]
    })
  ]
});


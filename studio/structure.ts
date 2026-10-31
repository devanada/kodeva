import type { StructureResolver } from 'sanity/structure';

// The landing page is a singleton: one document with a fixed id (the website queries `_id == "landingPage"`).
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Konten')
    .items([
      S.listItem()
        .title('Landing page')
        .id('landingPage')
        .child(S.document().schemaType('landingPage').documentId('landingPage').title('Landing page')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'landingPage'),
    ]);

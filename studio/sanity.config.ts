import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './schemaTypes';
import { structure } from './structure';

// Hosted Studio: `npm run studio:deploy` publishes it to <studioHost>.sanity.studio (free), where marketing signs in.
export default defineConfig({
  name: 'kodeva',
  title: 'Kodeva CMS',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // the landing page is one fixed document and leads are created by the website, so neither is offered in "New"
    templates: (templates) => templates.filter(({ schemaType }) => !['landingPage', 'lead'].includes(schemaType)),
  },
});

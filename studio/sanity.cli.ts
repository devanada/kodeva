import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  // the hostname of the hosted Studio, https://<studioHost>.sanity.studio (pick a unique one)
  studioHost: process.env.SANITY_STUDIO_HOST,
});

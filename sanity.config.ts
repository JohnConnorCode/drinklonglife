import { defineConfig, type Config } from 'sanity';
// @ts-expect-error - structureTool exists at runtime but TypeScript definitions are missing
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';
import { deskStructure } from './sanity/structure';
import { OpenPreviewAction } from './sanity/actions/OpenPreviewAction';

const config: Config = defineConfig({
  name: 'default',
  title: 'Long Life',
  basePath: '/admin/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev) => {
      return [...prev, OpenPreviewAction];
    },
  },
});

export default config;

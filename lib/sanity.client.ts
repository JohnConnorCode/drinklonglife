import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

let cachedClient: ReturnType<typeof createClient> | null | undefined;
let cachedPreviewClient: ReturnType<typeof createClient> | null | undefined;

function createSanityClient() {
  try {
    if (!projectId) return null;
    return createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      token: process.env.SANITY_READ_TOKEN,
    });
  } catch {
    return null;
  }
}

function createSanityPreviewClient() {
  try {
    if (!projectId) return null;
    return createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_READ_TOKEN,
    });
  } catch {
    return null;
  }
}

export function getClient(usePreview = false) {
  if (usePreview) {
    if (cachedPreviewClient === undefined) {
      cachedPreviewClient = createSanityPreviewClient();
    }
    return cachedPreviewClient;
  } else {
    if (cachedClient === undefined) {
      cachedClient = createSanityClient();
    }
    return cachedClient;
  }
}

// Initialize clients safely
try {
  cachedClient = createSanityClient();
  cachedPreviewClient = createSanityPreviewClient();
} catch {
  // Clients will be null if initialization fails
  cachedClient = null;
  cachedPreviewClient = null;
}

export const client = cachedClient || createSanityClient();
export const previewClient = cachedPreviewClient || createSanityPreviewClient();

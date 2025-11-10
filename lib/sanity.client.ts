import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

let cachedClient: ReturnType<typeof createClient> | null = null;
let cachedPreviewClient: ReturnType<typeof createClient> | null = null;

function initializeClients() {
  if (!projectId) return;

  if (!cachedClient) {
    cachedClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      token: process.env.SANITY_READ_TOKEN,
    });
  }

  if (!cachedPreviewClient) {
    cachedPreviewClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_READ_TOKEN,
    });
  }
}

export function getClient(usePreview = false) {
  initializeClients();
  return usePreview ? cachedPreviewClient : cachedClient;
}

// Lazy getters for backward compatibility
export const client = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    initializeClients();
    if (!cachedClient) return undefined;
    return (cachedClient as any)[prop];
  },
  has: () => {
    initializeClients();
    return cachedClient !== null;
  },
});

export const previewClient = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    initializeClients();
    if (!cachedPreviewClient) return undefined;
    return (cachedPreviewClient as any)[prop];
  },
  has: () => {
    initializeClients();
    return cachedPreviewClient !== null;
  },
});

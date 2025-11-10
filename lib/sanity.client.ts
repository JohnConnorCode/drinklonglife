import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from './sanity.env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token: process.env.SANITY_READ_TOKEN,
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_READ_TOKEN,
});

export function getClient(usePreview = false) {
  return usePreview ? previewClient : client;
}

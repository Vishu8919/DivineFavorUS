import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env.ts";

export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  token: process.env.SANITY_API_TOKEN,
});

import { defineCollection, z } from "astro:content";

// Stub schema for the Research Vault content collection.
// Quill authors real entries in D3; D2 ships placeholder .md files
// so getCollection() returns a non-empty list at build time.
const research = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.string(),
    summary: z.string(),
    published: z.string(), // ISO date — kept as string to dodge timezone churn
    readMin: z.number().optional(),
  }),
});

export const collections = { research };

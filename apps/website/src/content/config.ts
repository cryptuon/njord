import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Njord Team'),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum([
      'tutorial',
      'thought-leadership',
      'case-study',
      'protocol-update',
      'guide',
    ]),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }

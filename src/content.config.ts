import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const artikkel = z.object({
  title: z.string(),
  slug: z.string(),
  lang: z.string(),
  kategooria: z.string(),
  date: z.string().optional(),
  author: z.string().optional(),
});

const mkCollection = (dir: string) => defineCollection({
  loader: glob({ pattern: '**/*.md', base: `./src/content/${dir}` }),
  schema: artikkel,
});

export const collections = {
  blogi: mkCollection('blogi'),
  galerii: mkCollection('galerii'),
  'harju-maarugement': mkCollection('harju-maarugement'),
  meist: mkCollection('meist'),
  lisainformatsioon: mkCollection('lisainformatsioon'),
  lehed: mkCollection('lehed'),
  failid: mkCollection('failid'),
};

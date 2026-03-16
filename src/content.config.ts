import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { listPhotosFromS3 } from './lib/photos';

const s3PhotoSchema = z.object({
  title: z.string(),
  alt: z.string(),
  category: z.string(),
  filename: z.string(),
  src: z.string(),
});

function makeS3Collection(prefix: string, category: string) {
  return defineCollection({
    loader: async () => {
      try {
        const items = await listPhotosFromS3(prefix, category);
        return items.map((item) => ({ ...item, id: item.id }));
      } catch (e) {
        console.error(`Failed to load S3 photos for "${category}":`, e);
        return [];
      }
    },
    schema: s3PhotoSchema,
  });
}

const mainPhotos = makeS3Collection('main/', 'main');
const smokestackPhotos = makeS3Collection('smokestack/', 'smokestack');
const birdPhotos = makeS3Collection('birds/', 'birds');
const foodcardPhotos = makeS3Collection('foodcart/', 'foodcart');

export const collections = {
  mainPhotos,
  smokestackPhotos,
  birdPhotos,
  foodcardPhotos,
};

import { listFilesFromS3, PUBLIC_BASE_URL } from "./s3Photos";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i;

function stripExtension(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

function humanize(filename: string) {
  return stripExtension(filename)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export type S3Photo = {
  id: string;
  title: string;
  alt: string;
  category: string;
  filename: string;
  src: string;
};

export async function listPhotosFromS3(prefix: string, category: string): Promise<S3Photo[]> {
  const files = await listFilesFromS3(prefix);

  return files
    .filter((f) => IMAGE_EXT.test(f.key))
    .map((f) => {
      const filename = f.key.split("/").pop() ?? f.key;
      const slug = stripExtension(filename);
      const title = humanize(filename);
      return {
        id: slug,
        title,
        alt: title,
        category,
        filename,
        src: `${PUBLIC_BASE_URL}/${encodeURIComponent(f.key)}`,
      };
    })
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

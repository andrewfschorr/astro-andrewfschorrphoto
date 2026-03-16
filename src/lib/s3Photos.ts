import "dotenv/config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const BUCKET = "andrewschorrphoto-26";
const REGION = "us-east-2";
export const PUBLIC_BASE_URL = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});


export type S3ListFile = {
  key: string;
  size?: number;
  lastModified?: string;
};

function normalizePrefix(prefix: string) {
  if (!prefix) return "";
  return prefix.endsWith("/") ? prefix : `${prefix}/`;
}

export async function listFilesFromS3(prefix: string): Promise<S3ListFile[]> {
  const normalizedPrefix = normalizePrefix(prefix);

  let continuationToken: string | undefined;
  const files: S3ListFile[] = [];

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const obj of res.Contents ?? []) {
      if (!obj.Key) continue;

      files.push({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified?.toISOString(),
      });
    }

    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return files;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i;

/**
 * List all objects in the bucket (no prefix). Use listFilesFromS3("") for the same.
 */
export async function listAllBucketFiles(): Promise<S3ListFile[]> {
  return listFilesFromS3("");
}

/**
 * List all image keys in the bucket (any folder). Filters by extension.
 */
export async function listAllBucketImages(): Promise<S3ListFile[]> {
  const files = await listFilesFromS3("");
  return files.filter((f) => IMAGE_EXT.test(f.key));
}
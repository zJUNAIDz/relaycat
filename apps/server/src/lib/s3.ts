import { S3Service } from "@/services/S3.service";
import { getEnv } from "@/utils/env";
import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";

/**
 * Single shared S3 client/service used across HTTP routes (presigned uploads)
 * and server-side jobs (e.g. re-hosting OAuth avatars in profile.service).
 */
export const s3Client = new S3Client({
  endpoint: getEnv("AWS_S3_ENDPOINT"),
  region: getEnv("AWS_REGION"),
  forcePathStyle: true,
  credentials: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID") || "test",
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY") || "test",
  },
});

export const s3Service = new S3Service(s3Client, getEnv("AWS_S3_BUCKET_NAME"));

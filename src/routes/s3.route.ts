import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";
import { Context, Hono } from "hono";
import { policyMap } from "../config/uploads";
import { S3Service } from "../services/S3.service";
import { getEnv } from "../utils/env";

const s3Service = new S3Service(new S3Client({
  endpoint: getEnv("AWS_S3_ENDPOINT"),
  region: getEnv("AWS_REGION"),
  forcePathStyle: true,
  credentials: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
  },
}), getEnv("AWS_S3_BUCKET_NAME"))

const s3Routes = new Hono();
s3Routes.get("/uploads/:uploadType", async (c: Context) => {
  const { serverName, fileType } = c.req.query();

  if (!serverName || serverName.trim() === "") {
    return c.json({ error: "serverName is required" }, 400);
  }

  if (!fileType || fileType.trim() === "") {
    return c.json({ error: "fileType is required" }, 400);
  }

  const uploadType = c.req.param("uploadType");
  const policy = policyMap[uploadType];

  if (!policy) {
    return c.json({ error: "Invalid upload type" }, 400);
  }

  const response = await s3Service.generatePresignedUrl(serverName, fileType, policy);
  if (!response.success) {
    return c.json({ error: response.error }, 500);
  }
  const { signedUrl, bucketName, key } = response.data;
  return c.json({ signedUrl, key, bucketName });
});

export default s3Routes;

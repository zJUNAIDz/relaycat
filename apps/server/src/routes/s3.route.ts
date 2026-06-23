import { policyMap } from "@/config/uploads";
import { s3Service } from "@/lib/s3";
import { AppContext } from "@/types";
import "dotenv/config";
import { Context, Hono } from "hono";

const s3Routes = new Hono<AppContext>();
s3Routes.get("/uploads/:uploadType", async (c: Context) => {
  const { serverName, fileType } = c.req.query();

  if (!fileType || fileType.trim() === "") {
    return c.json({ error: "fileType is required" }, 400);
  }

  const uploadType = c.req.param("uploadType");
  const policy = policyMap[uploadType!];

  if (!policy) {
    return c.json({ error: "Invalid upload type" }, 400);
  }

  const fileName = serverName?.trim() || "upload";
  const response = await s3Service.generatePresignedUrl(
    fileName,
    fileType,
    policy
  );
  if (!response.success) {
    return c.json({ error: response.error }, 500);
  }
  const { signedUrl, key } = response.data;
  return c.json({ signedUrl, key });
});

export default s3Routes;

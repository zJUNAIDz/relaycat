import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import { UploadPolicy } from "../config/uploads";
import { generateErrorMessage } from "../utils/error-handler";

type GeneratePresignedUrlResult =
  | { success: true; data: { signedUrl: string; key: string }; error: null }
  | { success: false; data: null; error: { message: string } };

type UploadFromUrlResult =
  | { success: true; data: { key: string }; error: null }
  | { success: false; data: null; error: { message: string } };

/**
 * Make a user-supplied name safe to embed in an S3 object key: no spaces or
 * special characters that would produce invalid/awkward URLs at read time.
 */
function slugifyFileName(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();
  return slug || "upload";
}

export class S3Service {
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucketName: string,
  ) {}

  /**
   * Returns a presigned PUT url plus the object key (relative path) to store.
   * The key is what callers persist; the public host is appended at read time.
   */
  async generatePresignedUrl(
    fileName: string,
    fileType: string,
    policy: UploadPolicy,
  ): Promise<GeneratePresignedUrlResult> {
    if (!policy.allowedFileTypes.includes(fileType)) {
      return {
        data: null,
        success: false,
        error: {
          message: `File type not supported. Must be one of these [${policy.allowedFileTypes.join(", ")}]`,
        },
      };
    }
    try {
      const fileExtension = fileType.includes("/")
        ? fileType.split("/")[1]
        : fileType;
      const key = `${policy.pathPrefix}${slugifyFileName(fileName)}-${crypto.randomUUID()}.${fileExtension}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: policy.signedUrlExpirationSeconds,
        signableHeaders: new Set(["Content-Type"]),
      });
      return { data: { signedUrl, key }, success: true, error: null };
    } catch (err: unknown) {
      return {
        data: null,
        success: false,
        error: {
          message: generateErrorMessage(
            err,
            "An unknown error occurred while generating the signed URL.",
            "[s3Service/generatePresignedUrl]",
          ),
        },
      };
    }
  }

  /**
   * Downloads a remote image (e.g. a Google/GitHub OAuth avatar) and re-hosts
   * it in our own bucket, returning the stored object key. Used to break our
   * dependency on rate-limited provider CDNs — we copy the image once at
   * sign-up and serve it ourselves forever after.
   */
  async uploadFromUrl(
    sourceUrl: string,
    policy: UploadPolicy,
    fileName: string,
  ): Promise<UploadFromUrlResult> {
    try {
      const res = await fetch(sourceUrl);
      if (!res.ok) {
        return {
          data: null,
          success: false,
          error: { message: `Failed to fetch source image (${res.status})` },
        };
      }
      const contentType =
        res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
      if (!policy.allowedFileTypes.includes(contentType)) {
        return {
          data: null,
          success: false,
          error: { message: `Unsupported source image type: ${contentType}` },
        };
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.byteLength > policy.maxFileSizeInBytes) {
        return {
          data: null,
          success: false,
          error: { message: "Source image exceeds the maximum allowed size." },
        };
      }

      const fileExtension = contentType.includes("/")
        ? contentType.split("/")[1]
        : contentType;
      const key = `${policy.pathPrefix}${slugifyFileName(fileName)}-${crypto.randomUUID()}.${fileExtension}`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return { data: { key }, success: true, error: null };
    } catch (err: unknown) {
      return {
        data: null,
        success: false,
        error: {
          message: generateErrorMessage(
            err,
            "An unknown error occurred while re-hosting the remote image.",
            "[s3Service/uploadFromUrl]",
          ),
        },
      };
    }
  }
}

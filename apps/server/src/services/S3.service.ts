import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import { UploadPolicy } from "../config/uploads";
import { generateErrorMessage } from "../utils/error-handler";

type GeneratePresignedUrlResult =
  | { success: true; data: { signedUrl: string; key: string }; error: null }
  | { success: false; data: null; error: { message: string } };

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
      const key = `${policy.pathPrefix}${fileName}-${crypto.randomUUID()}.${fileExtension}`;
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
}

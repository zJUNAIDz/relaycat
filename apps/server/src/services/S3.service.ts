import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import { generateErrorMessage } from "../utils/error-handler";
import { UploadPolicy } from "../config/uploads";

type getSignedUrlResponse = {
  success: true;
  data: {
    signedUrl: string;
    bucketName: string;
    key: string
  };
  error: null;
} | {
  success: false;
  data: null;
  error: { message: string }
};
interface S3ServiceOptions {
  allowedFileTypes?: string[];
  signedUrlExpirationSeconds?: number;
}


export class S3Service {

  private ALLOWED_FILE_TYPES: string[];
  private SIGNED_URL_EXPIRATION_SECONDS: number;
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucketName: string,
    private readonly options: S3ServiceOptions = {},
  ) {
    this.ALLOWED_FILE_TYPES = this.options.allowedFileTypes ?? [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/jpg",
      "image/webp",
    ];
    this.SIGNED_URL_EXPIRATION_SECONDS = this.options.signedUrlExpirationSeconds ?? 1 * 60 * 60; // 1 hour default
  }


  /**
   * Returns a signed url for uploading a new image
   * @param fileName  The key of the object
   * @param fileType  The type of the file
   * @returns { data: {signedUrl:string, bucketName:string} | null, error: string | null }
   * @example getUploadNewImageUrl("my-bucket", "my-key", "image/png") => { signedUrl: "https://amazonaws.com/my-bucket.s3/my-key", error: null } || { signedUrl: null, error: "File type not supported" }
   */
  async generatePresignedUrl(
    fileName: string,
    fileType: string,
    policy: UploadPolicy
  ): Promise<getSignedUrlResponse> {
    if (!policy.allowedFileTypes.includes(fileType)) {
      return {
        data: null,
        success: false,
        error: {
          message:
            `File type not supported. Must be one of these [${policy.allowedFileTypes.join(", ")}]`,
        },
      };
    }
    try {
      const key = `${policy.pathPrefix}${fileName}-${crypto.randomUUID()}.${fileType.split("/")[1]}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: policy.signedUrlExpirationSeconds,

      });
      return {
        data: {
          signedUrl,
          bucketName: this.bucketName,
          key
        },
        success: true,
        error: null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        success: false,
        error: {
          message: generateErrorMessage(err, "An unknown error occurred while generating the signed URL.", "[s3Service/getUploadImageUrlError]"),
        },
      };
    }
  }
}  
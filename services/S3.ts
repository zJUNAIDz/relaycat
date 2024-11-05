import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";

class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME!;
  }

  async getSignedUrl(bucketName: string, key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (err) {
      console.error("[S3Service.getSignedUrl] ", err);
      return "";
    }
  }

  async uploadImage(key: string, file: File) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    try {
      //* get signed url first
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      const response = await axios.put(signedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
      return response;
    } catch (err) {
      console.error("[S3Service.uploadImage] ", err);
    }
  }

}

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  try {
    //* require server name for bucket key convinience
    const serverName = req.nextUrl.searchParams.get("serverName");
    const fileType = req.nextUrl.searchParams.get("fileType");
    // const serverName = req.query.serverName as string;
    // const fileType = req.query.fileType as string;
    if (!serverName) {
      return NextResponse.json(
        { error: "Server name is required" },
        { status: 400 }
      );
    }
    //* require filetype for validation
    if (!fileType) {
      return NextResponse.json(
        { error: "File type is required" },
        { status: 400 }
      );
    }
    const key = `${serverName}-${uuidv4()}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    return NextResponse.json({
      signedUrl,
      key,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
    });
  } catch (err) {
    console.error("error generating signed url: ", err);
    return NextResponse.json({ error: "Failed to generate signed URL" });
  }
}

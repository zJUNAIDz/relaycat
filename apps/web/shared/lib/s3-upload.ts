import axiosClient from "@/shared/lib/axios-client";
import axios from "axios";

export type UploadType =
  | "server-icon"
  | "profile-picture"
  | "profile-banner"
  | "message-image";

/**
 * Upload a file to S3 through a presigned URL and return the stored object
 * *key*. The public host is prepended server-side at read time, so a host is
 * never persisted here.
 *
 * Plain and framework-free on purpose: both the React hook
 * ({@link import("@/features/server/hooks/use-s3-uploads").useS3Uploads}) and
 * the onboarding machine drive it, and the latter lives outside component
 * lifecycle.
 */
export async function uploadToS3(
  file: File,
  uploadType: UploadType,
  name?: string,
): Promise<string> {
  const query = new URLSearchParams({ fileType: file.type });
  if (name) query.set("serverName", name);

  const {
    data: { signedUrl, key },
  } = await axiosClient.get(`/s3/uploads/${uploadType}?${query.toString()}`);
  if (!signedUrl || !key) {
    throw new Error("Failed to get signed URL for S3 upload.");
  }

  await axios.put(signedUrl, file, {
    headers: { "Content-Type": file.type },
  });
  return key;
}

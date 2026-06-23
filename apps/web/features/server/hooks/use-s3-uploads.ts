import axiosClient from "@/shared/lib/axios-client";
import axios from "axios";
import { useState } from "react";

/**
 * Uploads a file to S3 via a presigned URL and returns the stored object
 * *path* (key). The public host is appended server-side at response time, so
 * we never persist a host here.
 */
export const useS3Uploads = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: File,
    uploadType: string,
    name?: string,
  ): Promise<string> => {
    try {
      setIsUploading(true);
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
    } finally {
      setIsUploading(false);
    }
  };

  const uploadServerIcon = (imageFile: File, serverName: string) =>
    uploadFile(imageFile, "server-icon", serverName);

  return {
    uploadFile,
    uploadServerIcon,
    isUploading,
  };
};

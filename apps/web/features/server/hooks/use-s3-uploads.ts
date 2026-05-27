import axiosClient from "@/shared/lib/axios-client";
import { CONFIG } from "@/shared/lib/config";
import { useState } from "react";

export const useS3Uploads = () => {
  const [isUploading, setIsUploading] = useState(false);
  const uploadServerIcon = async (imageFile: File, serverName: string) => {
    try {
      setIsUploading(true);
      const {
        data: { signedUrl, key, bucketName },
        status,
      } = await axiosClient.get(
        `/s3/uploads/server-icon?serverName=${encodeURIComponent(serverName)}&fileType=${imageFile.type}`,
      );
      if (status !== 200) {
        throw new Error("Failed to get signed URL for S3 upload.");
      }
      const uploadResponse = await axiosClient.put(signedUrl, imageFile, {
        headers: { "Content-Type": imageFile.type },
      });
      if (uploadResponse.status !== 200) {
        throw new Error("Failed to upload image to S3.");
      }
      return `${CONFIG.S3_URL}/${bucketName}/${key}`;
    } finally {
      setIsUploading(false);
    }
  };
  return {
    uploadServerIcon,
    isUploading,
  };
};

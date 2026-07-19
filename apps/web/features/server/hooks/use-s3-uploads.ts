import { uploadToS3, type UploadType } from "@/shared/lib/s3-upload";
import { useState } from "react";

/**
 * React binding over {@link uploadToS3} that tracks an `isUploading` flag for
 * form busy states. The upload itself lives in the plain module so non-React
 * callers (the onboarding machine) can share it.
 */
export const useS3Uploads = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: File,
    uploadType: UploadType,
    name?: string,
  ): Promise<string> => {
    try {
      setIsUploading(true);
      return await uploadToS3(file, uploadType, name);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadServerIcon = (imageFile: File, serverName: string) =>
    uploadFile(imageFile, "server-icon", serverName);

  const uploadProfileAvatar = (imageFile: File, name?: string) =>
    uploadFile(imageFile, "profile-picture", name ?? "avatar");

  const uploadProfileBanner = (imageFile: File, name?: string) =>
    uploadFile(imageFile, "profile-banner", name ?? "banner");

  return {
    uploadFile,
    uploadServerIcon,
    uploadProfileAvatar,
    uploadProfileBanner,
    isUploading,
  };
};

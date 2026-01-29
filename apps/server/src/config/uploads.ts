export interface UploadPolicy {
  pathPrefix: string;
  allowedFileTypes: string[];
  maxFileSizeInBytes: number;
  signedUrlExpirationSeconds: number;
}

export const USER_PROFILE_POLICY: UploadPolicy = {
  pathPrefix: "user-profiles/",
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif", "image/jpg", "image/webp"],
  maxFileSizeInBytes: 5 * 1024 * 1024, // 5 MB
  signedUrlExpirationSeconds: 1 * 60 * 60, // 1 hour
};

export const SERVER_ICON_POLICY: UploadPolicy = {
  pathPrefix: "server-icons/",
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif", "image/jpg", "image/webp"],
  maxFileSizeInBytes: 2 * 1024 * 1024, // 2 MB
  signedUrlExpirationSeconds: 30 * 60, // 30 minutes
};
export const MESSAGE_IMAGE_POLICY: UploadPolicy = {
  pathPrefix: "message-images/",
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif", "image/jpg", "image/webp"],
  maxFileSizeInBytes: 10 * 1024 * 1024, // 10 MB
  signedUrlExpirationSeconds: 2 * 60 * 60, // 2 hours
};

export const MESSAGE_DOCUMENT_POLICY: UploadPolicy = {
  pathPrefix: "message-files/",
  allowedFileTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  maxFileSizeInBytes: 5 * 1024 * 1024, // 5 MB
  signedUrlExpirationSeconds: 1 * 60 * 60, // 1 hour
};
export const MESSAGE_VIDEO_POLICY: UploadPolicy = {
  pathPrefix: "message-videos/",
  allowedFileTypes: ["video/mp4", "video/x-m4v", "video/*"],
  maxFileSizeInBytes: 100 * 1024 * 1024, // 100 MB
  signedUrlExpirationSeconds: 2 * 60 * 60, // 2 hours
};
export const MESSAGE_AUDIO_POLICY: UploadPolicy = {
  pathPrefix: "message-audios/",
  allowedFileTypes: ["audio/mpeg", "audio/wav", "audio/*"],
  maxFileSizeInBytes: 20 * 1024 * 1024, // 20 MB
  signedUrlExpirationSeconds: 1 * 60 * 60, // 1 hour
};

export const MESSAGE_FILE_POLICY: UploadPolicy = {
  pathPrefix: "message-files/",
  allowedFileTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  maxFileSizeInBytes: 5 * 1024 * 1024, // 5 MB
  signedUrlExpirationSeconds: 1 * 60 * 60, // 1 hour
};

export const policyMap: Record<string, UploadPolicy> = {
  'server-icon': SERVER_ICON_POLICY,
  'profile-picture': USER_PROFILE_POLICY,
  'message-image': MESSAGE_IMAGE_POLICY,
  'message-document': MESSAGE_DOCUMENT_POLICY,
  'message-video': MESSAGE_VIDEO_POLICY,
  'message-audio': MESSAGE_AUDIO_POLICY,
  'message-file': MESSAGE_FILE_POLICY,
};
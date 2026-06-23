export const PAGE_ROUTES = {
  LANDING: "/",
  HOME: "/channels/me",
  AUTH: "/auth",
  VERIFY_EMAIL: "/auth/verify-email",
  SETTINGS: "/settings",
  PROFILE_EDIT: "/settings/profile/edit",
  CHANNEL: (channelId: string) => `channels/${channelId}`,
};

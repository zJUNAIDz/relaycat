export const PAGE_ROUTES = {
  LANDING: "/",
  HOME: "/channels/me",
  AUTH: "/auth",
  VERIFY_EMAIL: "/auth/verify-email",
  SETTINGS: "/settings",
  CHANNEL: (channelId: string) => `channels/${channelId}`,
};

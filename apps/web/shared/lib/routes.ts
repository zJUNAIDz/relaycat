export const PAGE_ROUTES = {
  LANDING: "/",
  HOME: "/channels/me",
  AUTH: "/auth",
  SETTINGS: "/settings",
  CHANNEL: (channelId: string) => `channels/${channelId}`,
};

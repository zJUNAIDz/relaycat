import axiosClient from "@/shared/lib/axios-client";
import type { Notification } from "@/shared/types";

type ListResponse = {
  notifications: Notification[];
  nextCursor: string | null;
};

/** A page of notifications, newest first. Pass `before` (a notification id) to page back. */
export async function fetchNotifications(before?: string): Promise<ListResponse> {
  const { data } = await axiosClient.get<ListResponse>("/notifications", {
    params: before ? { before } : undefined,
  });
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await axiosClient.get<{ unread: number }>(
    "/notifications/unread-count",
  );
  return data.unread;
}

export async function markNotificationRead(id: string): Promise<number> {
  const { data } = await axiosClient.post<{ unread: number }>(
    `/notifications/${id}/read`,
  );
  return data.unread;
}

export async function markAllNotificationsRead(): Promise<void> {
  await axiosClient.post("/notifications/read-all");
}

import axiosClient from "@/shared/lib/axios-client";
import type { Notification } from "@/shared/types";

type ListResponse = {
  notifications: Notification[];
  nextCursor: string | null;
};

/** Thin wrapper over the `/notifications` API. */
class NotificationService {
  /** A page of notifications, newest first. Pass `before` (a notification id) to page back. */
  async list(before?: string): Promise<ListResponse> {
    const { data } = await axiosClient.get<ListResponse>("/notifications", {
      params: before ? { before } : undefined,
    });
    return data;
  }

  /** Current unread count. */
  async unreadCount(): Promise<number> {
    const { data } = await axiosClient.get<{ unread: number }>(
      "/notifications/unread-count",
    );
    return data.unread;
  }

  /** Mark a single notification read; returns the new unread count. */
  async markRead(id: string): Promise<number> {
    const { data } = await axiosClient.post<{ unread: number }>(
      `/notifications/${id}/read`,
    );
    return data.unread;
  }

  /** Mark every notification read. */
  async markAllRead(): Promise<void> {
    await axiosClient.post("/notifications/read-all");
  }
}

export const notificationService = new NotificationService();

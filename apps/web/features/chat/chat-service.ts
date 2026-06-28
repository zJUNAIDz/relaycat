import axiosClient from "@/shared/lib/axios-client";

/**
 * Message API calls for the chat feature. Endpoints are dynamic (`apiUrl`
 * differs between server channels and DMs, and edit/delete target a specific
 * message resource), so the caller passes the resolved URL rather than having
 * it hard-coded here.
 */
class ChatService {
  /** Send a text message. */
  async sendMessage(apiUrl: string, content: string): Promise<void> {
    await axiosClient.post(apiUrl, { content });
  }

  /** Post an uploaded attachment (S3 object key) as a message. */
  async sendAttachment(apiUrl: string, imageKey: string): Promise<void> {
    await axiosClient.post(apiUrl, { image: imageKey });
  }

  /** Edit a message's text content. `apiUrl` is the message resource URL. */
  async editMessage(apiUrl: string, content: string): Promise<void> {
    await axiosClient.patch(apiUrl, { content });
  }

  /** Delete a message. `apiUrl` is the message resource URL. */
  async deleteMessage(apiUrl: string): Promise<void> {
    await axiosClient.delete(apiUrl);
  }
}

export const chatService = new ChatService();

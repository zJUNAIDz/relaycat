import axiosClient from "@/shared/lib/axios-client";

/**
 * Message API calls for the chat feature. The send endpoint is dynamic
 * (`apiUrl` differs between server channels and DMs), so it is passed in by the
 * caller rather than hard-coded here.
 */
class ChatService {
  /** Post an uploaded attachment (S3 object key) as a message. */
  async sendAttachment(apiUrl: string, imageKey: string): Promise<void> {
    await axiosClient.post(apiUrl, { image: imageKey });
  }
}

export const chatService = new ChatService();

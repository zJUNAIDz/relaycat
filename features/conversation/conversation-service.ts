import { getAuthTokenOnServer } from "@/shared/utils/server"
import axios from "axios"

class ConversationService {
  API_URL = process.env.NEXT_PUBLIC_API_URL
  async getConversations(userId: string) {
    try {
      const { data: { conversations, error } } = await axios.get(`${this.API_URL}/conversations/${userId}`, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { error }
      }
      return { conversations }
    } catch (error) {
      console.log("[getConversations] ", error)
      return { error }
    }
  }
  async getOrCreatConversation(memberOneId: string, memberTwoId: string) {
    try {
      const { data: { conversation, error } } = await axios.put(`${this.API_URL}/conversations`, { memberOneId, memberTwoId }, {
        headers: {
          "Authorization": `Bearer ${await getAuthTokenOnServer()}`
        }
      })
      if (error) {
        return { error }
      }
      return { conversation }
    } catch (error) {
      console.log("[getOrCreatConversation] ", error)
      return { error }
    }

  }
}
export const conversationService = new ConversationService();
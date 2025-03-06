import { useSocket } from "@/shared/providers/socket-provider";
import { getAuthTokenOnClient } from "@/shared/utils/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import qs from "query-string";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string
  paramKey: "channelId" | "conversationId"
  paramValue: string
}
export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue
}: ChatQueryProps) => {
  const { isConnected } = useSocket();
  const fetchMessages = async ({ pageParam = undefined }) => {
    const authToken = await getAuthTokenOnClient();
    const url = qs.stringifyUrl({
      url: apiUrl,
      query: {
        cursor: pageParam,
        [paramKey]: paramValue
      }
    }, { skipNull: true });
    const { data } = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    })
    console.log({ data })
    return data;
  }
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: isConnected ? false : 1000,
  })
  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  }
}
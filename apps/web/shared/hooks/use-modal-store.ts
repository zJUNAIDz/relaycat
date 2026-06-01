import { Channel, ChannelType, Server, ServerWithMembersAndUser, User } from "@/shared/types";
import { create } from "zustand";
export type ModalType =
  | "createServer"
  | "editServer"
  | "createChannel"
  | "editChannel"
  | "deleteChannel"
  | "invite"
  | "members"
  | "leaveServer"
  | "deleteServer"
  | "messageFile"
  | "deleteMessage"
  | "profile";

interface ModalData {
  server?: ServerWithMembersAndUser | Server;
  profile?: User;
  channel?: Channel;
  channelType?: ChannelType;
  apiUrl?: string;
  query?: Record<string, unknown>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>()((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => {
    return set({ isOpen: true, type, data })
  },
  onClose: () =>
    set({ isOpen: false, type: null, data: {} }),
}));

import { ServerWithMembersAndUser } from "@/shared/types";
import { Channel, ChannelType, Server } from "@prisma/client";
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
  | "messageFile";

interface ModalData {
  server?: ServerWithMembersAndUser | Server;
  channel?: Channel;
  channelType?: ChannelType;
  apiUrl?: string;
  query?: Record<string, any>
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
    console.log(`opening modal of type: ${type}`);
    return set({ isOpen: true, type, data })
  },
  onClose: () =>
    set({ isOpen: false, type: null, data: {} }),
}));

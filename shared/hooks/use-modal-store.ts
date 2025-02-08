import { ServerWithMembersWithUserProfiles } from "@/shared/types";
import { ChannelType, Server } from "@prisma/client";
import { create } from "zustand";
export type ModalType =
  | "createServer"
  | "editServer"
  | "createChannel"
  | "invite"
  | "members"
  | "leaveServer"
  | "deleteServer";

interface ModalData {
  server?: ServerWithMembersWithUserProfiles | Server;
  channelType?: ChannelType
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
  onOpen: (type, data = {}) =>
    set({ isOpen: true, type, data }),
  onClose: () =>
    set({ isOpen: false, type: null, data: {} }),
}));

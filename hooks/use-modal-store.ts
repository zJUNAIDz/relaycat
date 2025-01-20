import { ServerWithMembersWithUserProfiles } from "@/types";
import { create } from "zustand";

export type ModalType =
  | "createServer"
  | "editServer"
  | "createChannel"
  | "invite"
  | "members"
  | "leaveServer";

interface ModalData {
  server?: ServerWithMembersWithUserProfiles;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false }),
}));

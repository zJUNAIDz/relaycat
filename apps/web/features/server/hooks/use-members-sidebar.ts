import { create } from "zustand";

/**
 * Visibility of the right-hand server members panel. Shared between the
 * {@link MembersToggle} in the chat header and the {@link ServerMembersSidebar}
 * that renders in the channel layout. Defaults to open (Discord-like).
 */
interface MembersSidebarStore {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useMembersSidebar = create<MembersSidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

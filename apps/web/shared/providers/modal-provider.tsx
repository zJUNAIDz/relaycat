"use client";

import "client-only";
import CreateChannelModal from "@/features/channel/components/modals/create-channel-modal";
import DeleteChannelModal from "@/features/channel/components/modals/delete-channel-modal";
import EditChannelModal from "@/features/channel/components/modals/edit-channel-modal";
import DeleteMessageModal from "@/features/chat/components/delete-message-modal";
import MessageFileModal from "@/features/chat/components/message-file-modal";
import CreateServerModal from "@/features/server/components/modals/create-server-modal";
import DeleteServerModal from "@/features/server/components/modals/delete-server-modal";
import EditServerModal from "@/features/server/components/modals/edit-server-modal";
import InviteModal from "@/features/server/components/modals/invite-modal";
import LeaveServerModal from "@/features/server/components/modals/leave-server-modal";
import ManageRolesModal from "@/features/server/components/modals/manage-roles-modal";
import MembersModal from "@/features/server/components/modals/members-modal";

export const ModalProvider = () => {
  //* workaround to make it render on client-side only
  // if (typeof window === "undefined") return null;  

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <ManageRolesModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
    </>
  );
};

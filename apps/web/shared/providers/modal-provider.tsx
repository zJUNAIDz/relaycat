"use client";

import CreateChannelModal from "@/features/channel/components/modals/create-channel-modal";
import DeleteChannelModal from "@/features/channel/components/modals/delete-channel-model";
import EditChannelModal from "@/features/channel/components/modals/edit-channel-modal";
import DeleteMessageModal from "@/features/chat/components/delete-message-modal";
import MessageFileModal from "@/features/chat/components/message-file-modal";
import CreateServerModal from "@/features/server/components/modals/create-server-modal";
import DeleteServerModal from "@/features/server/components/modals/delete-server-modal";
import EditServerModal from "@/features/server/components/modals/edit-server-modal";
import InviteModal from "@/features/server/components/modals/invite-modal";
import LeaveServerModal from "@/features/server/components/modals/leave-server-modal";
import MembersModal from "@/features/server/components/modals/members-modal";
import React from "react";

export const ModalProvider = () => {
  //* workaround to make it render on client-side only
  const [isMounted, setIsMounted] = React.useState<boolean>(false);
  React.useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
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

"use client";

import CreateServerModal from "@/components/modals/create-server-modal";
import EditServerModal from "@/components/modals/edit-server-modal";
import InviteModal from "@/components/modals/invite-modal";
import MembersModal from "@/components/modals/members-modal";
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
    </>
  );
};

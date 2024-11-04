"use client";

import CreateServerModal from "@/components/modals/create-server-modal";
import React from "react";
import InviteModal from "@/components/modals/invite-modal";
import EditServerModal from "../modals/edit-server-modal";

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
    </>
  );
};

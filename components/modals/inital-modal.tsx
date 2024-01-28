"use client";

import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

const InitialModal = () => {
  return <Dialog open>
    <DialogTrigger>Create</DialogTrigger>
    <DialogContent  className="bg-white text-black overflow-hidden">YOOO</DialogContent>
  </Dialog>;
};

export default InitialModal;

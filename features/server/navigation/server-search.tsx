"use client"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Dialog, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Router, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface ServerSearchProps {
  data: {
    label: string;
    type: "member" | "channel";
    data: {
      icon: React.ReactNode;
      name: string;
      id: string;
    }[] | undefined
  }[]
}
const cmdKey = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0 ? "&#8984;" : "CTRL";
export const ServerSearch: React.FC<ServerSearchProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", onKeyPress);
    return () => document.removeEventListener("keydown", onKeyPress);
  }, [])

  const [open, setOpen] = React.useState(false)

  const onClick = ({ id, type }: { id: string; type: "channel" | "member" }) => {
    setOpen(false)
    if (type === "member") {
      router.push(`/servers/${params.serverId}/conversations/${id}`)
      return
    }
    if (type === "channel") {
      router.push(`/servers/${params.serverId}/channels/${id}`)
      return
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition">
        <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <p
          className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 trnsition"
        >
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted  px-1.5  font-mono text-[10px] font-medium  text-muted-foreground ml-auto">
          <span className="text-xs">{cmdKey}</span> S
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle className="text-center sr-only">
            Search all channels and members
          </DialogTitle>
          <CommandInput placeholder="search all channels and members" />
        </DialogHeader>
        <CommandList>
          <CommandEmpty>
            No Results Found
          </CommandEmpty>
          {
            data.map(({ label, type, data }) => {
              if (!data) return null
              return (
                <CommandGroup key={label} heading={label}>
                  {
                    data?.map(({ id, icon, name }) => (
                      <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                        <div className="flex items-center gap-x-2">
                          {icon}
                          {name}
                        </div>
                      </CommandItem>
                    ))
                  }
                </CommandGroup>
              )
            })
          }
        </CommandList>
      </CommandDialog >
    </>
  )
}
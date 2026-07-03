"use client"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Search } from "lucide-react";
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

// Guarded so it never touches `navigator` during SSR; `⌘` is the literal glyph
// (an `&#8984;` HTML entity would render verbatim inside JSX).
const getCmdKey = () =>
  typeof navigator !== "undefined" &&
    navigator.userAgent.toUpperCase().includes("MAC")
    ? "⌘"
    : "CTRL";

export const ServerSearch: React.FC<ServerSearchProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [open, setOpen] = React.useState(false)

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
      <button onClick={() => setOpen(true)} className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-accent transition">
        <Search className="h-4 w-4 text-muted-foreground" />
        <p
          className="font-semibold text-sm text-muted-foreground group-hover:text-foreground transition"
        >
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted  px-1.5  font-mono text-[10px] font-medium  text-muted-foreground ml-auto">
          <span className="text-xs">{getCmdKey()}</span> S
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
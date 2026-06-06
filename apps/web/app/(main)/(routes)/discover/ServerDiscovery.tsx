"use client"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import axiosClient from "@/shared/lib/axios-client"
import { Server } from "@repo/types"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ServerDiscovery() {
  const { data: servers, isLoading, error } = useDiscoverableServers();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading discoverable servers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-sm">Failed to load servers. Please try again later.</p>
      </div>
    )
  }
  return (
    <div className="flex min-h-screen font-sans antialiased">

      {/* Sidebar - Desktop */}


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header / Hero Search section */}
        <section className="relative w-full h-75 md:h-90 bg-linear-to-br  flex flex-col items-center justify-center px-4 text-center select-none overflow-hidden">
          <div className="relative z-10 max-w-2xl w-full space-y-4">
            <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight">
              Find your community on Relaycat
            </h1>
            {/* Search Input Container */}
            <div className="relative flex max-w-xl mx-auto w-full pt-2">
              <Input
                type="text"
                placeholder="Explore discoverable servers"
                className="w-full h-12 pl-4 pr-12   border-none rounded-md focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0 text-base"
              />
              {/* <Search className=" right-4 h-5 w-5 text-[#949ba4] pointer-events-none" /> */}
            </div>
          </div>
        </section>

        {/* Server Grid Section */}
        <section className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">


          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {servers?.map((server) => (
              <Card
                key={server.id}
                className="bg-blend-darken  overflow-hidden flex flex-col h-full rounded-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
              >
                {/* Visual Header / Banner */}
                <div className={`h-32 bg-linear-to-r bg-transparent relative shrink-0 p-3 flex items-end`}>
                  {/* Pseudo Icon placeholder positioning */}
                  <div className="absolute -bottom-6 left-3 h-12 w-12 flex items-center justify-center font-bold text-white group-hover:rounded-xl transition-all duration-200">
                    <Image
                      src={server.image!}
                      alt={`${server.name} icon`}
                      placeholder="blur"
                      blurDataURL={process.env.NEXT_PUBLIC_DEFAULT_SERVER_IMAGE_URL}
                      width={48}
                      height={48}
                      className="object-cover rounded-full group-hover:rounded-xl transition-all duration-200 fill-inherit"
                    />

                  </div>
                </div>

                {/* Card Specs */}
                <CardHeader className="pt-8 pb-2 px-4 space-y-1">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
                    {server.name}
                  </CardTitle>

                  {/* Member Stats counts */}
                  <div className="flex items-center gap-3 text-xs text-[#949ba4] font-medium pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#23a55a]" />
                      100 Online
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {server.memberCount} Members
                    </span>
                  </div>
                </CardHeader>

                {/* Card Description */}
                <CardContent className="px-4 pb-4 text-sm text-[#b5bac1] flex-1 line-clamp-3">
                  {server.description}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <Link href={`/invite/${server.inviteCode}`} className="w-full">
                      Join Server
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function useDiscoverableServers() {
  const query = useQuery({
    queryKey: ["discoverableServers"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Server[]>("/servers/public");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  })
  return query;
}
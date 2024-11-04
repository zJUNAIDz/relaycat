import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params: { serverId } }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!currentProfile)
      return new NextResponse("Unauthorized", { status: 401 });
    if (!serverId) {
      return new NextResponse("Missing serverId", { status: 400 });
    }
    if (typeof serverId !== "string") {
      return new NextResponse("Invalid serverId", { status: 400 });
    }

    const { name, imageUrl: image } = await req.json();
    if (!name || !image) {
      return new NextResponse("Missing name or image", { status: 400 });
    }
    console.log("Updating server info: ", name, image, serverId);
    //TODO: change it to allow moderators to edit server settings
    //* query server from db
    const server = await db.server.findUnique({
      where: {
        id: serverId,
        userId: profile?.id,
      },
    });
    if (!server) return new NextResponse("Server not found", { status: 404 });

    await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        name,
        image,
      },
    });
    return NextResponse.json(server);
  } catch (err) {
    console.log("Failed to update server info: ", err);
    return new NextResponse("Failed to update server info", { status: 500 });
  }
}

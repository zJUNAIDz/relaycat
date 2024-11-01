import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: NextRequest,
  params: { params: { serverId: string } }
  // { params: { serverId } }: { params: { serverId: string } }
) {
  try {
    console.log(params.params.serverId);
    const profile = await currentProfile();
    if (!profile) return NextResponse.json("Unauthorized", { status: 401 });

    if (!params.params.serverId)
      return NextResponse.json("Missing serverId", { status: 400 });

    const server = await db.server.update({
      where: { id: params.params.serverId, userId: profile.id },
      data: { inviteCode: uuidv4() },
    });
    console.log(server);
    return NextResponse.json(server);
  } catch (err) {
    console.error("[serverId/invite-code] ", err);
    return NextResponse.json("Failed to patch invite code", { status: 500 });
  }
}

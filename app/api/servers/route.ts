import { v4 as uuidv4 } from "uuid";
import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const user = await currentProfile();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    //* everything clear, now create server
    const server = await db.server.create({
      data: {
        userId: user.id,
        name,
        image: imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: "general", userId: user.id }],
        },
        members: {
          create: [{ userId: user.id, role: MemberRole.ADMIN }],
        },
      },
    });

    return NextResponse.json(server);
  } catch (err) {
    console.error("[SERVER_POST] ", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

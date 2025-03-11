import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const session = await auth();
    const token = session?.apiToken;
    if (!token) {
      return NextResponse.json({ error: "No token found", success: false });
    }
    const user = session?.user;
    return NextResponse.json({ token, user, success: true });
  } catch (e) {
    return NextResponse.json({ error: e, success: false });
  }
}
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const token = session?.apiToken;
    if (!token) {
      return NextResponse.json({ error: "No token found", success: false });
    }
    return NextResponse.json({ token, success: true });
  } catch (e) {
    return NextResponse.json({ error: e, success: false });
  }
}
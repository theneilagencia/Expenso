import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_REDIRECT_URI) {
      return NextResponse.json({ error: "config_error" }, { status: 500 });
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", process.env.YOUTUBE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", process.env.YOUTUBE_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/adwords");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

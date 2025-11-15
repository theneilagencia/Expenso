import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_REDIRECT_URI) {
      return NextResponse.json({ error: "config_error" }, { status: 500 });
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", process.env.LINKEDIN_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", process.env.LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", "r_ads rw_ads r_basicprofile");

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

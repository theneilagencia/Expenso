import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    if (!process.env.X_CLIENT_ID || !process.env.X_REDIRECT_URI) {
      return NextResponse.json({ error: "config_error" }, { status: 500 });
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", process.env.X_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", process.env.X_REDIRECT_URI);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", "tweet.read tweet.write users.read offline.access");
    authUrl.searchParams.set("code_challenge", "challenge");
    authUrl.searchParams.set("code_challenge_method", "plain");

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

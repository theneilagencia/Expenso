import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL(`/setup?error=youtube_auth_failed`, url.origin));
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID!,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
        redirect_uri: process.env.YOUTUBE_REDIRECT_URI!,
        grant_type: "authorization_code"
      })
    });

    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
      return NextResponse.json({ error: "token_exchange_failed" }, { status: 400 });
    }

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("integrations").insert({
      tenant_id: user?.id || null,
      platform: "youtube",
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token,
      status: "connected",
      connected_at: new Date().toISOString()
    });

    if (process.env.MANUS_WEBHOOK_URL) {
      await fetch(process.env.MANUS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "integration_completed",
          flow_id: "flow_1_youtube_" + Date.now(),
          data: { platform: "youtube", tenant_id: user?.id || null, status: "connected" }
        })
      });
    }

    return NextResponse.redirect(new URL("/setup?connected=youtube", url.origin));
  } catch (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

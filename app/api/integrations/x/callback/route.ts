import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL(`/setup?error=x_auth_failed`, url.origin));
    }

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: process.env.X_CLIENT_ID!,
        redirect_uri: process.env.X_REDIRECT_URI!,
        code_verifier: "challenge"
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
      platform: "x",
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
          flow_id: "flow_1_x_" + Date.now(),
          data: { platform: "x", tenant_id: user?.id || null, status: "connected" }
        })
      });
    }

    return NextResponse.redirect(new URL("/setup?connected=x", url.origin));
  } catch (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

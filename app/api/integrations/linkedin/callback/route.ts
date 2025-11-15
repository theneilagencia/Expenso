import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL(`/setup?error=linkedin_auth_failed`, url.origin));
    }

    if (!code) {
      return NextResponse.json({ error: "missing_code" }, { status: 400 });
    }

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!
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
      platform: "linkedin",
      access_token: tokenJson.access_token,
      status: "connected",
      connected_at: new Date().toISOString(),
      metadata: { scopes: ["r_ads", "rw_ads", "r_basicprofile"] }
    });

    if (process.env.MANUS_WEBHOOK_URL) {
      await fetch(process.env.MANUS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "integration_completed",
          flow_id: "flow_1_linkedin_" + Date.now(),
          data: { platform: "linkedin", tenant_id: user?.id || null, status: "connected" }
        })
      });
    }

    return NextResponse.redirect(new URL("/setup?connected=linkedin", url.origin));
  } catch (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

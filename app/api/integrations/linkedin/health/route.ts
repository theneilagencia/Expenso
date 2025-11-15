import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const supabase = await supabaseServer();
    
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("platform", "linkedin")
      .single();

    if (!integration) {
      return NextResponse.json({ status: "not_connected", platform: "linkedin" });
    }

    const testRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        "Authorization": `Bearer ${integration.access_token}`
      }
    });

    const status = testRes.ok ? "connected" : (testRes.status === 401 ? "expired" : "invalid");

    await supabase
      .from("integrations")
      .update({
        health_status: status,
        health_last_checked: new Date().toISOString()
      })
      .eq("id", integration.id);

    if (process.env.MANUS_WEBHOOK_URL && status !== "connected") {
      await fetch(process.env.MANUS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "integration_health_check",
          data: { platform: "linkedin", status, timestamp: new Date().toISOString() }
        })
      });
    }

    return NextResponse.json({
      platform: "linkedin",
      status,
      last_check: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ status: "error", platform: "linkedin" }, { status: 500 });
  }
}

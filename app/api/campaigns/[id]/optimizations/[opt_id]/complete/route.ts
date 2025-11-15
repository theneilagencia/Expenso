import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, opt_id: string }> }) {
  const { opt_id } = await params;
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from('campaign_optimizations')
    .update({ status: 'completed' })
    .eq('id', opt_id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("Webhook Manus Recebido:", body);

  // Aqui, futuramente:
  // - Atualizar banco
  // - Notificar UI
  // - Disparar novas ações

  return NextResponse.json({ ok: true });
}

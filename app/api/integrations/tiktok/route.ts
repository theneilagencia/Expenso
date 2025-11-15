import { NextResponse } from "next/server";

/**
 * Rota de OAuth do TikTok Ads
 * 
 * Esta rota inicia o fluxo de OAuth 2.0 do TikTok for Business.
 * O usuário é redirecionado para a página de autorização do TikTok.
 * 
 * Fluxo:
 * 1. Usuário clica em "Conectar TikTok"
 * 2. Esta rota redireciona para o TikTok OAuth
 * 3. Usuário autoriza o app
 * 4. TikTok redireciona para /api/integrations/tiktok/callback
 * 
 * Documentação: https://business-api.tiktok.com/portal/docs?id=1738373164380162
 */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Validar variáveis de ambiente
    if (!process.env.TIKTOK_APP_ID || !process.env.TIKTOK_REDIRECT_URI) {
      console.error("[TikTok OAuth] Variáveis de ambiente não configuradas");
      return NextResponse.json(
        { error: "config_error", message: "Configuração do TikTok incompleta" },
        { status: 500 }
      );
    }

    // Gerar state para segurança (CSRF protection)
    const state = Math.random().toString(36).substring(7);

    // Construir URL de autorização do TikTok
    const authUrl = new URL("https://business-api.tiktok.com/portal/auth");
    authUrl.searchParams.set("app_id", process.env.TIKTOK_APP_ID);
    authUrl.searchParams.set("redirect_uri", process.env.TIKTOK_REDIRECT_URI);
    authUrl.searchParams.set("state", state);
    
    // Escopos necessários para TikTok Ads
    // https://business-api.tiktok.com/portal/docs?id=1738373141733378
    authUrl.searchParams.set("rid", "");

    console.log("[TikTok OAuth] Redirecionando para:", authUrl.toString());

    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    console.error("[TikTok OAuth] Erro inesperado:", error);
    return NextResponse.json(
      { 
        error: "internal_error", 
        message: "Erro ao iniciar OAuth do TikTok",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

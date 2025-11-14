import { NextResponse } from "next/server";

/**
 * Rota de OAuth da Meta Ads
 * 
 * Esta rota inicia o fluxo de autenticação OAuth com a Meta (Facebook/Instagram).
 * O usuário é redirecionado para a página de login da Meta, onde autoriza o app.
 * 
 * Fluxo:
 * 1. Usuário clica em "Conectar Meta Ads"
 * 2. É redirecionado para esta rota
 * 3. Esta rota redireciona para o OAuth da Meta
 * 4. Usuário faz login e autoriza
 * 5. Meta redireciona para o callback com o código
 */

export async function GET() {
  // Validar variáveis de ambiente
  if (!process.env.META_CLIENT_ID) {
    return NextResponse.json(
      { error: "META_CLIENT_ID não configurado" },
      { status: 500 }
    );
  }

  if (!process.env.META_REDIRECT_URI) {
    return NextResponse.json(
      { error: "META_REDIRECT_URI não configurado" },
      { status: 500 }
    );
  }

  // Parâmetros do OAuth
  const params = new URLSearchParams({
    client_id: process.env.META_CLIENT_ID,
    redirect_uri: process.env.META_REDIRECT_URI,
    state: "loquia-" + Date.now(), // Estado único para segurança
    scope: [
      "ads_management",      // Gerenciar campanhas
      "ads_read",           // Ler dados de anúncios
      "business_management", // Gerenciar Business Manager
      "pages_show_list",    // Listar páginas
      "read_insights"       // Ler métricas e insights
    ].join(",")
  });

  // URL de autorização da Meta (Facebook Graph API v19.0)
  const authUrl = "https://www.facebook.com/v19.0/dialog/oauth?" + params.toString();

  console.log("[Meta OAuth] Redirecionando para:", authUrl);

  // Redirecionar para a página de autorização da Meta
  return NextResponse.redirect(authUrl);
}

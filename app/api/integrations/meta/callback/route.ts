import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Callback do OAuth da Meta Ads
 * 
 * Esta rota recebe o código de autorização da Meta após o usuário
 * fazer login e autorizar o app. O código é trocado por um access token
 * que é salvo no banco de dados.
 * 
 * Fluxo:
 * 1. Meta redireciona para esta rota com o código
 * 2. Código é trocado por access token
 * 3. Token é salvo no Supabase
 * 4. Evento é enviado para o webhook Manus
 * 5. Usuário é redirecionado de volta para o app
 */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Verificar se houve erro na autorização
    if (error) {
      console.error("[Meta Callback] Erro na autorização:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/integrations?error=meta_auth_failed&message=${encodeURIComponent(errorDescription || error)}`, url.origin)
      );
    }

    // Validar código
    if (!code) {
      console.error("[Meta Callback] Código de autorização não fornecido");
      return NextResponse.json(
        { error: "missing_code", message: "Código de autorização não fornecido" },
        { status: 400 }
      );
    }


    // Validar variáveis de ambiente
    if (!process.env.META_CLIENT_ID || !process.env.META_CLIENT_SECRET || !process.env.META_REDIRECT_URI) {
      console.error("[Meta Callback] Variáveis de ambiente não configuradas");
      return NextResponse.json(
        { error: "config_error", message: "Configuração da Meta incompleta" },
        { status: 500 }
      );
    }

    // Trocar código por access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.META_CLIENT_ID,
        client_secret: process.env.META_CLIENT_SECRET,
        redirect_uri: process.env.META_REDIRECT_URI,
        code
      });

    const tokenRes = await fetch(tokenUrl);
    const tokenJson = await tokenRes.json();

    // Verificar erro na troca de token
    if (tokenJson.error) {
      console.error("[Meta Callback] Erro ao trocar código por token:", tokenJson.error);
      return NextResponse.json(
        { 
          error: "token_exchange_failed", 
          message: tokenJson.error.message || "Falha ao trocar código por token",
          details: tokenJson.error
        },
        { status: 400 }
      );
    }

    const accessToken = tokenJson.access_token;

    if (!accessToken) {
      console.error("[Meta Callback] Token não retornado pela Meta");
      return NextResponse.json(
        { error: "no_token", message: "Token não retornado pela Meta" },
        { status: 500 }
      );
    }


    // Obter informações do usuário autenticado
    const supabase = supabaseServer();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn("[Meta Callback] Usuário não autenticado, salvando token sem tenant_id");
    }

    // Salvar token no Supabase
    
    const { data: integration, error: dbError } = await supabase
      .from("integrations")
      .insert({
        tenant_id: user?.id || null,
        platform: "meta",
        access_token: accessToken,
        status: "connected",
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("[Meta Callback] Erro ao salvar no banco:", dbError);
      return NextResponse.json(
        { 
          error: "database_error", 
          message: "Erro ao salvar integração",
          details: dbError
        },
        { status: 500 }
      );
    }


    // Notificar webhook Manus (se configurado)
    if (process.env.MANUS_WEBHOOK_URL) {
      try {
        
        const webhookRes = await fetch(process.env.MANUS_WEBHOOK_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            event_type: "integration_completed",
            flow_id: "flow_1_meta_" + Date.now(),
            data: {
              platform: "meta",
              tenant_id: user?.id || null,
              integration_id: integration?.id,
              status: "connected"
            },
            timestamp: new Date().toISOString(),
            status: "success"
          })
        });

        if (webhookRes.ok) {
        } else {
          console.warn("[Meta Callback] Falha ao notificar webhook:", await webhookRes.text());
        }
      } catch (webhookError) {
        console.error("[Meta Callback] Erro ao notificar webhook:", webhookError);
        // Não falhar a integração se o webhook falhar
      }
    } else {
      console.warn("[Meta Callback] MANUS_WEBHOOK_URL não configurado, pulando notificação");
    }

    // Redirecionar usuário de volta para o app
    const redirectUrl = new URL("/integrations?connected=meta", url.origin);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("[Meta Callback] Erro inesperado:", error);
    return NextResponse.json(
      { 
        error: "internal_error", 
        message: "Erro interno ao processar callback",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

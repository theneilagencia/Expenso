import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Callback do OAuth do TikTok Ads
 * 
 * Esta rota recebe o código de autorização do TikTok após o usuário
 * fazer login e autorizar o app. O código é trocado por um access token
 * que é salvo no banco de dados.
 * 
 * Fluxo:
 * 1. TikTok redireciona para esta rota com o código
 * 2. Código é trocado por access token
 * 3. Token é salvo no Supabase
 * 4. Evento é enviado para o webhook Manus
 * 5. Usuário é redirecionado de volta para o app
 * 
 * Documentação: https://business-api.tiktok.com/portal/docs?id=1738373164380162
 */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const authCode = url.searchParams.get("auth_code");
    const error = url.searchParams.get("error");

    // Verificar se houve erro na autorização
    if (error) {
      console.error("[TikTok Callback] Erro na autorização:", error);
      return NextResponse.redirect(
        new URL(`/setup?error=tiktok_auth_failed&message=${encodeURIComponent(error)}`, url.origin)
      );
    }

    // Validar código
    if (!authCode) {
      console.error("[TikTok Callback] Código de autorização não fornecido");
      return NextResponse.json(
        { error: "missing_code", message: "Código de autorização não fornecido" },
        { status: 400 }
      );
    }

    console.log("[TikTok Callback] Código recebido, trocando por token...");

    // Validar variáveis de ambiente
    if (!process.env.TIKTOK_APP_ID || !process.env.TIKTOK_SECRET) {
      console.error("[TikTok Callback] Variáveis de ambiente não configuradas");
      return NextResponse.json(
        { error: "config_error", message: "Configuração do TikTok incompleta" },
        { status: 500 }
      );
    }

    // Trocar código por access token
    const tokenRes = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: process.env.TIKTOK_APP_ID,
          secret: process.env.TIKTOK_SECRET,
          auth_code: authCode
        })
      }
    );

    const tokenJson = await tokenRes.json();

    // Verificar erro na troca de token
    if (tokenJson.code !== 0) {
      console.error("[TikTok Callback] Erro ao trocar código por token:", tokenJson);
      return NextResponse.json(
        { 
          error: "token_exchange_failed", 
          message: tokenJson.message || "Falha ao trocar código por token",
          details: tokenJson
        },
        { status: 400 }
      );
    }

    const accessToken = tokenJson.data?.access_token;
    const advertiserIds = tokenJson.data?.advertiser_ids || [];

    if (!accessToken) {
      console.error("[TikTok Callback] Access token não retornado pelo TikTok");
      return NextResponse.json(
        { error: "no_token", message: "Access token não retornado pelo TikTok" },
        { status: 500 }
      );
    }

    console.log("[TikTok Callback] Token obtido com sucesso");
    console.log("[TikTok Callback] Advertiser IDs:", advertiserIds);

    // Obter informações do usuário autenticado
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn("[TikTok Callback] Usuário não autenticado, salvando token sem tenant_id");
    }

    // Salvar token no Supabase
    console.log("[TikTok Callback] Salvando token no banco de dados...");
    
    const { data: integration, error: dbError } = await supabase
      .from("integrations")
      .insert({
        tenant_id: user?.id || null,
        platform: "tiktok",
        access_token: accessToken,
        status: "connected",
        connected_at: new Date().toISOString(),
        metadata: {
          advertiser_ids: advertiserIds
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error("[TikTok Callback] Erro ao salvar no banco:", dbError);
      return NextResponse.json(
        { 
          error: "database_error", 
          message: "Erro ao salvar integração",
          details: dbError
        },
        { status: 500 }
      );
    }

    console.log("[TikTok Callback] Integração salva com sucesso:", integration?.id);

    // Notificar webhook Manus (se configurado)
    if (process.env.MANUS_WEBHOOK_URL) {
      try {
        console.log("[TikTok Callback] Notificando webhook Manus...");
        
        const webhookRes = await fetch(process.env.MANUS_WEBHOOK_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            event_type: "integration_completed",
            flow_id: "flow_1_tiktok_" + Date.now(),
            data: {
              platform: "tiktok",
              tenant_id: user?.id || null,
              integration_id: integration?.id,
              status: "connected",
              advertiser_count: advertiserIds.length
            },
            timestamp: new Date().toISOString(),
            status: "success"
          })
        });

        if (webhookRes.ok) {
          console.log("[TikTok Callback] Webhook notificado com sucesso");
        } else {
          console.warn("[TikTok Callback] Falha ao notificar webhook:", await webhookRes.text());
        }
      } catch (webhookError) {
        console.error("[TikTok Callback] Erro ao notificar webhook:", webhookError);
        // Não falhar a integração se o webhook falhar
      }
    } else {
      console.warn("[TikTok Callback] MANUS_WEBHOOK_URL não configurado, pulando notificação");
    }

    // Redirecionar usuário de volta para o app
    const redirectUrl = new URL("/setup?connected=tiktok", url.origin);
    console.log("[TikTok Callback] Redirecionando para:", redirectUrl.toString());

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("[TikTok Callback] Erro inesperado:", error);
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

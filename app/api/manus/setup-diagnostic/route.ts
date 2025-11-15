import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const PLATFORMS = ['google', 'meta', 'tiktok', 'linkedin', 'x', 'youtube'];

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({
        error: "not_authenticated",
        message: "Usuário não autenticado"
      }, { status: 401 });
    }

    // 2. Verificar profile e tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, tenant:tenants(*)')
      .eq('user_id', user.id)
      .single();

    // 3. Buscar integrações
    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', profile?.tenant_id || user.id);

    // 4. Executar health-checks para cada integração
    const healthResults = await Promise.all(
      PLATFORMS.map(async (platform) => {
        const integration = integrations?.find(i => i.platform === platform);
        if (!integration) {
          return { platform, status: 'not_connected' };
        }

        try {
          const healthRes = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/${platform}/health`,
            { method: 'GET' }
          );
          const healthData = await healthRes.json();
          return { platform, status: healthData.status };
        } catch (error) {
          return { platform, status: 'error' };
        }
      })
    );

    // 5. Identificar problemas
    const missingIntegrations = PLATFORMS.filter(
      p => !integrations?.find(i => i.platform === p)
    );

    const expiredIntegrations = healthResults.filter(
      r => r.status === 'expired'
    ).map(r => r.platform);

    const invalidIntegrations = healthResults.filter(
      r => r.status === 'invalid'
    ).map(r => r.platform);

    const connectedIntegrations = healthResults.filter(
      r => r.status === 'connected'
    ).map(r => r.platform);

    // 6. Gerar warnings e errors
    const warnings = [];
    const errors = [];

    if (missingIntegrations.length > 0) {
      warnings.push({
        type: 'missing_integrations',
        message: `${missingIntegrations.length} plataforma(s) não conectada(s)`,
        platforms: missingIntegrations
      });
    }

    if (expiredIntegrations.length > 0) {
      errors.push({
        type: 'expired_tokens',
        message: `${expiredIntegrations.length} token(s) expirado(s)`,
        platforms: expiredIntegrations
      });
    }

    if (invalidIntegrations.length > 0) {
      errors.push({
        type: 'invalid_tokens',
        message: `${invalidIntegrations.length} token(s) inválido(s)`,
        platforms: invalidIntegrations
      });
    }

    // 7. Gerar ações recomendadas
    const requiredActions = [];

    if (missingIntegrations.length > 0) {
      requiredActions.push({
        action: 'connect_platforms',
        message: `Conectar ${missingIntegrations.length} plataforma(s)`,
        platforms: missingIntegrations
      });
    }

    if (expiredIntegrations.length > 0) {
      requiredActions.push({
        action: 'refresh_tokens',
        message: `Revalidar ${expiredIntegrations.length} integração(ões)`,
        platforms: expiredIntegrations
      });
    }

    // 8. Checklist de sucesso
    const successChecklist = {
      auth: !!user,
      tenant: !!profile?.tenant_id,
      profile: !!profile,
      integrations: integrations && integrations.length > 0,
      health_checks: connectedIntegrations.length === PLATFORMS.length,
      all_connected: connectedIntegrations.length === PLATFORMS.length
    };

    // 9. Montar diagnóstico completo
    const diagnostic = {
      timestamp: new Date().toISOString(),
      user_id: user.id,
      tenant_id: profile?.tenant_id || null,
      health_map: healthResults,
      missing_integrations: missingIntegrations,
      expired_integrations: expiredIntegrations,
      invalid_integrations: invalidIntegrations,
      connected_integrations: connectedIntegrations,
      warnings,
      errors,
      required_actions: requiredActions,
      success_checklist: successChecklist,
      overall_status: errors.length === 0 ? 'healthy' : 'needs_attention'
    };

    // 10. Notificar Manus
    if (process.env.MANUS_WEBHOOK_URL) {
      try {
        await fetch(process.env.MANUS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'setup_diagnostic_completed',
            flow_id: 'diagnostic_' + Date.now(),
            data: diagnostic,
            timestamp: new Date().toISOString(),
            status: 'success'
          })
        });
      } catch (webhookError) {
        console.error('[Diagnostic] Erro ao notificar webhook:', webhookError);
      }
    }

    return NextResponse.json(diagnostic);

  } catch (error) {
    console.error('[Diagnostic] Erro inesperado:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Erro ao executar diagnóstico',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

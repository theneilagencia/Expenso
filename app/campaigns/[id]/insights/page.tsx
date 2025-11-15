"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GlowInsightCard, GlowEmptyState } from '@/components/ai';
import { PageHeader } from '@/components/layout/page-header';
import { GlowButton } from '@/components/glow';

export default function InsightsPage() {
  const params = useParams();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}/insights`)
      .then(res => res.json())
      .then(data => {
        setInsights(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleReprocess = async () => {
    setLoading(true);
    await fetch('/api/manus/flow2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: params.id, tenant_id: 'demo', reprocess: true })
    });
    window.location.reload();
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <PageHeader title="Insights IA" />
      <div className="mb-4">
        <GlowButton onClick={handleReprocess}>Reprocessar Insights</GlowButton>
      </div>
      {insights.length === 0 ? (
        <GlowEmptyState message="Nenhum insight disponível" />
      ) : (
        <div className="grid gap-4">
          {insights.map((insight: any) => (
            <GlowInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

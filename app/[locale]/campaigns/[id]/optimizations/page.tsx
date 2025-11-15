'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { GlowOptimizationCard, GlowEmptyState } from '@/components/ai';
import { PageHeader } from '@/components/layout/page-header';
import { GlowButton } from '@/components/glow';

export default function OptimizationsPage() {
  const t = useTranslations('optimizations');
  const tCommon = useTranslations('common');
  const params = useParams();
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}/optimizations`)
      .then(res => res.json())
      .then(data => {
        setOptimizations(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleReprocess = async () => {
    setLoading(true);
    await fetch('/api/manus/flow3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: params.id, tenant_id: 'demo', reprocess: true })
    });
    window.location.reload();
  };

  if (loading) return <div className="text-white">{tCommon('loading')}</div>;

  return (
    <div>
      <PageHeader title={t('title')} />
      <div className="mb-4">
        <GlowButton onClick={handleReprocess}>{t('reprocess')}</GlowButton>
      </div>
      {optimizations.length === 0 ? (
        <GlowEmptyState message={t('noOptimizations')} />
      ) : (
        <div className="grid gap-4">
          {optimizations.map((opt: any) => (
            <GlowOptimizationCard key={opt.id} optimization={opt} />
          ))}
        </div>
      )}
    </div>
  );
}

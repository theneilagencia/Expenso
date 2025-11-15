"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GlowOptimizationCard, GlowEmptyState } from '@/components/ai';
import { PageHeader } from '@/components/layout/page-header';

export default function OptimizationsPage() {
  const params = useParams();
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptimizations();
  }, [params.id]);

  const loadOptimizations = () => {
    fetch(`/api/campaigns/${params.id}/optimizations`)
      .then(res => res.json())
      .then(data => {
        setOptimizations(data);
        setLoading(false);
      });
  };

  const handleAccept = async (optId: string) => {
    await fetch(`/api/campaigns/${params.id}/optimizations/${optId}/accept`, { method: 'POST' });
    loadOptimizations();
  };

  const handleReject = async (optId: string) => {
    await fetch(`/api/campaigns/${params.id}/optimizations/${optId}/reject`, { method: 'POST' });
    loadOptimizations();
  };

  const handleComplete = async (optId: string) => {
    await fetch(`/api/campaigns/${params.id}/optimizations/${optId}/complete`, { method: 'POST' });
    loadOptimizations();
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <PageHeader title="Otimizações IA" />
      {optimizations.length === 0 ? (
        <GlowEmptyState message="Nenhuma otimização disponível" />
      ) : (
        <div className="grid gap-4">
          {optimizations.map((opt: any) => (
            <GlowOptimizationCard
              key={opt.id}
              optimization={opt}
              onAccept={() => handleAccept(opt.id)}
              onReject={() => handleReject(opt.id)}
              onComplete={() => handleComplete(opt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

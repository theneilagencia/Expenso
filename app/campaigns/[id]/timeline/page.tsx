"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GlowTimelineItem, GlowEmptyState } from '@/components/ai';
import { PageHeader } from '@/components/layout/page-header';

export default function TimelinePage() {
  const params = useParams();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}/timeline`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <PageHeader title="Timeline da Campanha" />
      {events.length === 0 ? (
        <GlowEmptyState message="Nenhum evento registrado" />
      ) : (
        <div className="mt-6">
          {events.map((event: any) => (
            <GlowTimelineItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

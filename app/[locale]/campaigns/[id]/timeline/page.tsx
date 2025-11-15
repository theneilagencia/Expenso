'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';

export default function TimelinePage() {
  const t = useTranslations('campaigns');
  const tCommon = useTranslations('common');
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

  if (loading) return <div className="text-white">{tCommon('loading')}</div>;

  return (
    <div>
      <PageHeader title={t('timeline')} />
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-400">{t('noEvents')}</p>
        ) : (
          events.map((event: any, i: number) => (
            <div key={i} className="border-l-2 border-blue-500 pl-4 py-2">
              <p className="text-white font-medium">{event.title}</p>
              <p className="text-gray-400 text-sm">{event.description}</p>
              <p className="text-gray-500 text-xs">{new Date(event.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

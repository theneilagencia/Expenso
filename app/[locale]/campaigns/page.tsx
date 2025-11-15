'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { Navbar } from '@/components/layout/navbar';
import { GlowButton, GlowCard } from '@/components/glow';
import { Plus, TrendingUp, DollarSign, Eye } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export default function CampaignsPage() {
  const t = useTranslations('campaigns');
  const tCommon = useTranslations('common');
  const { locale } = useParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCampaigns(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
          <Link href={`/${locale}/campaigns/new`}>
            <GlowButton className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>{t('newCampaign')}</span>
            </GlowButton>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">{t('noCampaigns')}</p>
            <Link href={`/${locale}/campaigns/new`}>
              <GlowButton>{t('createFirst')}</GlowButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} href={`/${locale}/campaigns/${campaign.id}/insights`}>
                <GlowCard glow className="h-full cursor-pointer hover:scale-105 transition-transform">
                  <h3 className="text-xl font-semibold text-white mb-2">{campaign.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{campaign.platform}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{t('budget')}</span>
                      <span className="text-white font-medium">${campaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{t('spent')}</span>
                      <span className="text-white font-medium">${campaign.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{t('impressions')}</span>
                      <span className="text-white font-medium">{campaign.impressions.toLocaleString()}</span>
                    </div>
                  </div>
                </GlowCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

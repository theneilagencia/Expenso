import { GlowCard } from '@/components/glow';

interface GlowInsightCardProps {
  insight: {
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
  };
}

export function GlowInsightCard({ insight }: GlowInsightCardProps) {
  const impactColors = {
    high: 'green',
    medium: 'orange',
    low: 'blue'
  } as const;

  return (
    <GlowCard glowColor={impactColors[insight.impact]} className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{insight.title}</h3>
        <span className="text-sm text-gray-400">{Math.round(insight.confidence * 100)}%</span>
      </div>
      <p className="text-gray-300">{insight.description}</p>
      <div className="mt-4 flex gap-2">
        <span className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">{insight.type}</span>
        <span className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">Impact: {insight.impact}</span>
      </div>
    </GlowCard>
  );
}

import { GlowCard, GlowButton } from '@/components/glow';

interface GlowOptimizationCardProps {
  optimization: {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    status: string;
  };
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  readOnly?: boolean;
}

export function GlowOptimizationCard({ optimization, onAccept, onReject, onComplete, readOnly }: GlowOptimizationCardProps) {
  const statusColors = {
    pending: 'orange',
    accepted: 'green',
    rejected: 'pink',
    completed: 'blue'
  } as const;

  return (
    <GlowCard glowColor={statusColors[optimization.status as keyof typeof statusColors] || 'blue'} className="p-6">
      <h3 className="text-xl font-bold text-white mb-2">{optimization.title}</h3>
      <p className="text-gray-300 mb-4">{optimization.description}</p>
      <div className="flex gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-800 rounded text-sm">Impact: {optimization.impact}</span>
        <span className="px-3 py-1 bg-gray-800 rounded text-sm">Difficulty: {optimization.difficulty}</span>
        <span className="px-3 py-1 bg-gray-800 rounded text-sm">Status: {optimization.status}</span>
      </div>
      {!readOnly && optimization.status === 'pending' && (
        <div className="flex gap-2">
          <GlowButton onClick={onAccept} variant="primary" size="sm">Accept</GlowButton>
          <GlowButton onClick={onReject} variant="secondary" size="sm">Reject</GlowButton>
        </div>
      )}
      {!readOnly && optimization.status === 'accepted' && (
        <GlowButton onClick={onComplete} variant="primary" size="sm">Mark as Complete</GlowButton>
      )}
    </GlowCard>
  );
}

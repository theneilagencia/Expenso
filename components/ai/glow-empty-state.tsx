export function GlowEmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
}

export function GlowTimelineItem({ event }: { event: any }) {
  return (
    <div className="flex gap-4 pb-6 border-l-2 border-gray-700 pl-6 relative">
      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500"></div>
      <div>
        <p className="text-white font-semibold">{event.event_type}</p>
        <p className="text-gray-400 text-sm">{new Date(event.created_at).toLocaleString()}</p>
        {event.metadata && <p className="text-gray-300 text-sm mt-2">{JSON.stringify(event.metadata)}</p>}
      </div>
    </div>
  );
}

export default function StatPill({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-zinc-950/80 px-3 py-1.5 text-sm text-zinc-200">
      <Icon className="h-4 w-4" />
      <span>{value}</span>
    </div>
  );
}
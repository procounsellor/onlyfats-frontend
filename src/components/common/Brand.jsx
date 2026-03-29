import { DollarSign } from "lucide-react";

export default function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-glow">
        <DollarSign className="h-5 w-5" />
      </div>
      <div>
        <div className="text-lg font-bold tracking-tight text-white">OnlyFats</div>
        <div className="text-xs text-zinc-400">Premium creator platform</div>
      </div>
    </div>
  );
}
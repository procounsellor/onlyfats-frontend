const creators = [
  {
    name: "Ava Monroe",
    price: "$14.99/mo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Luna Blake",
    price: "$19.99/mo",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Nina Ray",
    price: "$9.99/mo",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
];

export default function RightRail() {
  return (
    <div className="hidden w-[340px] shrink-0 space-y-6 border-l border-zinc-900 bg-black/50 p-6 xl:block">
      <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-5">
        <div className="text-lg font-semibold text-white">Suggested creators</div>
        <div className="mt-5 space-y-4">
          {creators.map((creator) => (
            <div key={creator.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={creator.avatar} alt={creator.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-white">{creator.name}</div>
                  <div className="text-sm text-zinc-400">{creator.price}</div>
                </div>
              </div>
              <button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black">Follow</button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-zinc-900 bg-gradient-to-br from-sky-500/20 to-fuchsia-500/10 p-5">
        <div className="text-lg font-semibold text-white">Creator earnings</div>
        <div className="mt-2 text-sm text-zinc-300">
          Build subscriptions, sell premium content and offer direct messages.
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/40 p-4">
            <div className="text-xs text-zinc-400">This month</div>
            <div className="mt-1 text-xl font-bold text-white">$12,480</div>
          </div>
          <div className="rounded-2xl bg-black/40 p-4">
            <div className="text-xs text-zinc-400">Subscribers</div>
            <div className="mt-1 text-xl font-bold text-white">1,284</div>
          </div>
        </div>
      </div>
    </div>
  );
}
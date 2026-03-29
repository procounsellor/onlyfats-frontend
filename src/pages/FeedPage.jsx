import FeedCard from "../components/feed/FeedCard";
import RightRail from "../components/layout/RightRail";
import { mockPosts } from "../data/mockPosts";

export default function FeedPage({ currentUser }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-zinc-900 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-zinc-400">Logged in as</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {currentUser?.full_name || currentUser?.email || "User"}
              </div>
              <div className="mt-1 text-sm text-zinc-400">
                @{currentUser?.username || "creatorfan"} • Premium fan dashboard
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-black">Subscribe to creators</button>
              <button className="rounded-2xl border border-zinc-800 px-4 py-3 font-semibold text-white">Upgrade plan</button>
            </div>
          </div>
        </div>

        {mockPosts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>

      <RightRail />
    </div>
  );
}
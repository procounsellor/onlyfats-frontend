import { Menu, Search } from "lucide-react";

export default function Topbar({ title = "Home Feed", subtitle = "Browse creators, premium posts and subscriptions", onMenu }) {
  return (
    <div className="sticky top-0 z-30 border-b border-zinc-900 bg-black/70 px-4 py-4 backdrop-blur lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className="rounded-xl border border-zinc-800 p-2 text-zinc-300 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="text-lg font-semibold text-white">{title}</div>
            <div className="text-sm text-zinc-400">{subtitle}</div>
          </div>
        </div>

        <div className="hidden min-w-[280px] items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 md:flex">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            placeholder="Search creators, posts, tags"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </div>
      </div>
    </div>
  );
}
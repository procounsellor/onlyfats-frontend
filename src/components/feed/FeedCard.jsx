import { motion } from "framer-motion";
import { Eye, Heart, Image as ImageIcon, Lock } from "lucide-react";
import StatPill from "./StatPill";

export default function FeedCard({ post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[28px] border border-zinc-900 bg-zinc-950 shadow-2xl shadow-black/20"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <img src={post.avatar} alt={post.creator} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <div className="font-semibold text-white">{post.creator}</div>
            <div className="text-sm text-zinc-400">{post.handle}</div>
          </div>
        </div>
        {post.locked ? (
          <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            Premium • ${post.price}
          </div>
        ) : (
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Public post
          </div>
        )}
      </div>

      <div className="relative">
        <img src={post.image} alt={post.caption} className="h-[420px] w-full object-cover" />
        {post.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
            <div className="rounded-full bg-white/10 p-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div className="mt-4 text-xl font-semibold text-white">Unlock this premium post</div>
            <div className="mt-1 text-sm text-zinc-300">Subscribe or purchase individually to view full content.</div>
            <button className="mt-5 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-sky-400">
              Unlock for ${post.price}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap gap-2">
          <StatPill icon={Heart} value={post.likes.toLocaleString()} />
          <StatPill icon={Eye} value={post.views} />
          <StatPill icon={ImageIcon} value={post.locked ? "Premium" : "Photo set"} />
        </div>
        <p className="text-sm leading-6 text-zinc-300">{post.caption}</p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl bg-white px-4 py-2.5 font-medium text-black transition hover:scale-[1.02]">
            Subscribe
          </button>
          <button className="rounded-2xl border border-zinc-800 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-900">
            Send message
          </button>
        </div>
      </div>
    </motion.div>
  );
}
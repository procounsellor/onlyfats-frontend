import { Image as ImageIcon } from "lucide-react";

export default function CreatePostCard() {
  return (
    <div className="rounded-[30px] border border-zinc-900 bg-zinc-950 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Create new post</h2>
          <p className="mt-2 text-zinc-400">Starter UI for media upload, captioning and premium pricing.</p>
        </div>
        <button className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-white">Publish</button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-dashed border-zinc-700 bg-black/40 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="mt-4 text-lg font-semibold text-white">Drop photos or videos here</div>
          <div className="mt-2 text-sm text-zinc-400">Wire this box to your uploads API next.</div>
          <div className="mt-5 flex justify-center gap-3">
            <button className="rounded-2xl border border-zinc-800 px-4 py-3 text-white">Upload photo</button>
            <button className="rounded-2xl border border-zinc-800 px-4 py-3 text-white">Upload video</button>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            rows={6}
            placeholder="Write your caption..."
            className="w-full rounded-[24px] border border-zinc-800 bg-black px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-sky-500"
          />
          <input
            placeholder="Price for locked content (optional)"
            className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-sky-500"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 px-4 py-3 text-white">
            <input type="checkbox" className="h-4 w-4" />
            Mark as premium content
          </label>
        </div>
      </div>
    </div>
  );
}
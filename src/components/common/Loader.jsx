export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 px-6 py-4">{label}</div>
    </div>
  );
}
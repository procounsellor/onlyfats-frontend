export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <div className="rounded-[30px] border border-zinc-900 bg-zinc-950 p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-3xl font-bold text-white">{title}</h2>
        <p className="mt-3 max-w-2xl text-zinc-400">{description}</p>
      </div>
    </div>
  );
}
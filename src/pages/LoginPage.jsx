import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Brand from "../components/common/Brand";

export default function LoginPage({ mode, setMode, onLogin, onSignup, onGuest }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    display_name: "",
    role: "visitor",
    guest_name: "Guest User",
  });

  const title = useMemo(() => {
    if (mode === "signup") return "Create your account";
    if (mode === "guest") return "Continue as guest";
    return "Welcome back";
  }, [mode]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        await onSignup({
          email: form.email,
          password: form.password,
          display_name: form.display_name,
          role: form.role,
        });
      } else if (mode === "guest") {
        await onGuest({
          guest_name: form.guest_name,
        });
      } else {
        await onLogin({
          email: form.email,
          password: form.password,
        });
      }
    } catch (err) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-[32px] border border-zinc-900 bg-zinc-950 p-8 shadow-2xl shadow-black/30"
          >
            <Brand />
            <div className="mt-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Premium dark creator UI connected to your FastAPI auth APIs.
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <>
                  <input
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-sky-500"
                    placeholder="Display name"
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  />
                  <select
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-sky-500"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="visitor">Visitor</option>
                    <option value="creator">Creator</option>
                  </select>
                </>
              )}

              {mode === "guest" ? (
                <input
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-sky-500"
                  placeholder="Guest name"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                />
              ) : (
                <>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-sky-500"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 pr-11 outline-none placeholder:text-zinc-500 focus:border-sky-500"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              )}

              {error ? <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Please wait..." : mode === "signup" ? "Sign up" : mode === "guest" ? "Continue as guest" : "Login"}
              </button>
            </form>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-black p-2">
              {[
                ["login", "Login"],
                ["signup", "Signup"],
                ["guest", "Guest"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    mode === key ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop"
            alt="premium creator platform"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/70 to-black" />
          <div className="absolute inset-0 flex items-end p-12">
            <div className="max-w-xl">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
                Modern creator subscription experience
              </div>
              <h2 className="mt-6 text-5xl font-bold leading-tight text-white">
                Build a premium content platform with a polished dark UI.
              </h2>
              <p className="mt-4 text-lg leading-8 text-zinc-300">
                This starter is designed for your FastAPI auth endpoints and can be extended into posts,
                subscriptions, chat, earnings and media uploads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Lock,
  Users,
  PlayCircle,
  Sparkles,
  MessageCircle,
  DollarSign,
  Image as ImageIcon,
  Menu,
} from "lucide-react";

const creatorCards = [
  {
    name: "Ava Monroe",
    handle: "@avamonroe",
    earnings: "$12.4K/mo",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Luna Blake",
    handle: "@lunablake",
    earnings: "$8.1K/mo",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Nina Ray",
    handle: "@ninaray",
    earnings: "$15.9K/mo",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
  },
];

const audienceCards = [
  {
    icon: DollarSign,
    title: "Monetize your audience",
    description:
      "Launch subscriptions, premium posts and direct offers with a polished creator-first dashboard.",
  },
  {
    icon: MessageCircle,
    title: "Build stronger fan relationships",
    description:
      "Give guests a premium experience with exclusive content, direct messages and priority access.",
  },
  {
    icon: Shield,
    title: "Private and secure",
    description:
      "Protected account flows, gated content and fast checkout-style upgrades for premium access.",
  },
];

const stats = [
  { value: "250K+", label: "premium members" },
  { value: "$4.8M", label: "creator payouts" },
  { value: "99.9%", label: "uptime experience" },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <div className="text-lg font-bold tracking-tight text-white">OnlyFats</div>
        <div className="text-xs text-zinc-400">Premium creator platform</div>
      </div>
    </div>
  );
}

function Navbar({ onLogin, onSignup }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-zinc-300 transition hover:text-white">
            Features
          </a>
          <a href="#creators" className="text-sm text-zinc-300 transition hover:text-white">
            Creators
          </a>
          <a href="#guests" className="text-sm text-zinc-300 transition hover:text-white">
            For Guests
          </a>
          <a href="#pricing" className="text-sm text-zinc-300 transition hover:text-white">
            Plans
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={onLogin}
            className="rounded-2xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-900"
          >
            Log in
          </button>
          <button
            onClick={onSignup}
            className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Get started
          </button>
        </div>

        <button className="rounded-xl border border-zinc-800 p-2 text-zinc-300 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

function Hero({ onSignup, onLogin }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_left,rgba(244,114,182,0.12),transparent_24%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur">
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
            Built for creators and premium members
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Grow your creator business with a bold, premium landing experience.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            Designed for creators who want subscriptions, premium media, direct messaging and a fan-first experience,
            all wrapped in a modern dark UI inspired by top subscription platforms.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onSignup}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 font-semibold text-white transition hover:bg-sky-400"
            >
              Start as creator
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onLogin}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-zinc-900"
            >
              Join as guest
              <PlayCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="text-2xl font-bold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-zinc-400">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-sky-500/20 blur-3xl lg:block" />
          <div className="absolute -right-8 bottom-4 hidden h-36 w-36 rounded-full bg-fuchsia-500/10 blur-3xl lg:block" />

          <div className="rounded-[32px] border border-white/10 bg-zinc-950/90 p-4 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="rounded-[28px] border border-white/10 bg-black/70 p-4">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop"
                alt="creator hero"
                className="h-[440px] w-full rounded-[24px] object-cover"
              />

              <div className="-mt-20 px-4 pb-2">
                <div className="rounded-[28px] border border-white/10 bg-black/75 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
                        alt="creator"
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-white">Ava Monroe</div>
                        <div className="text-sm text-zinc-400">2.4M followers • premium creator</div>
                      </div>
                    </div>
                    <button className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black">
                      Subscribe
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="text-xs text-zinc-400">Monthly</div>
                      <div className="mt-1 text-lg font-bold text-white">$14.99</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="text-xs text-zinc-400">Premium drops</div>
                      <div className="mt-1 text-lg font-bold text-white">48</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="text-xs text-zinc-400">Messages</div>
                      <div className="mt-1 text-lg font-bold text-white">Open</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-400">Why it works</div>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          A clean premium experience for both creators and guests.
        </h2>
        <p className="mt-4 text-zinc-400">
          Use one landing page to speak to both sides of your platform: creators who want to earn and guests who want
          exclusive access.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {audienceCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[28px] border border-white/10 bg-zinc-950 p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{card.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function CreatorSection({ onSignup }) {
  return (
    <section id="creators" className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-6 lg:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-400">For creators</div>
          <h2 className="mt-3 text-3xl font-bold text-white">Turn content into recurring revenue.</h2>
          <p className="mt-4 text-zinc-400">
            Showcase premium content, chat with fans, sell exclusive drops and grow a predictable subscription business.
          </p>

          <div className="mt-6 space-y-4">
            {[
              "Subscription plans and premium unlocks",
              "Direct fan messaging and content bundles",
              "Media-first profile pages with strong conversion UI",
              "Private member area and creator analytics",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-sky-400" />
                <div className="text-zinc-300">{item}</div>
              </div>
            ))}
          </div>

          <button
            onClick={onSignup}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400"
          >
            Become a creator
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {creatorCards.map((creator) => (
            <motion.div
              key={creator.handle}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950"
            >
              <img src={creator.image} alt={creator.name} className="h-72 w-full object-cover" />
              <div className="p-5">
                <div className="font-semibold text-white">{creator.name}</div>
                <div className="text-sm text-zinc-400">{creator.handle}</div>
                <div className="mt-4 rounded-2xl bg-white/5 p-3">
                  <div className="text-xs text-zinc-400">Estimated earnings</div>
                  <div className="mt-1 text-lg font-bold text-white">{creator.earnings}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuestSection({ onLogin }) {
  return (
    <section id="guests" className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="order-2 rounded-[32px] border border-white/10 bg-zinc-950 p-6 lg:order-1 lg:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-400">For guests</div>
          <h2 className="mt-3 text-3xl font-bold text-white">Discover creators and unlock exclusive access.</h2>
          <p className="mt-4 text-zinc-400">
            Guests get a polished feed, private member experience and a simple path from discovery to subscription.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/40 p-5">
              <Lock className="h-5 w-5 text-sky-400" />
              <div className="mt-4 font-semibold text-white">Premium unlocks</div>
              <div className="mt-2 text-sm leading-7 text-zinc-400">
                Preview premium content and unlock posts or subscribe in one flow.
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/40 p-5">
              <Users className="h-5 w-5 text-sky-400" />
              <div className="mt-4 font-semibold text-white">Personalized discovery</div>
              <div className="mt-2 text-sm leading-7 text-zinc-400">
                Find trending creators, categories and exclusive releases in seconds.
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/40 p-5">
              <ImageIcon className="h-5 w-5 text-sky-400" />
              <div className="mt-4 font-semibold text-white">Exclusive media</div>
              <div className="mt-2 text-sm leading-7 text-zinc-400">
                Access premium photosets, gated drops and member-only previews.
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/40 p-5">
              <PlayCircle className="h-5 w-5 text-sky-400" />
              <div className="mt-4 font-semibold text-white">Smooth experience</div>
              <div className="mt-2 text-sm leading-7 text-zinc-400">
                Fast onboarding, clean UI and simple member journeys across every device.
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-950 to-zinc-900 p-5">
            <div className="rounded-[28px] border border-white/10 bg-black/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">Guest preview</div>
                  <div className="text-sm text-zinc-400">Premium content discovery flow</div>
                </div>
                <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  Locked Preview
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
                    alt="premium preview"
                    className="h-[360px] w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="rounded-full bg-white/10 p-4">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <div className="mt-4 text-xl font-semibold text-white">Unlock creator access</div>
                    <div className="mt-2 text-sm text-zinc-300">Subscribe to view the full premium drop.</div>
                    <button className="mt-5 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400">
                      Subscribe for $14.99
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogin}
                className="mt-5 flex w-full items-center justify-between rounded-[22px] bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div>
                  <div className="font-medium text-white">Join as guest</div>
                  <div className="text-sm text-zinc-400">Create an account and follow your favorite creators.</div>
                </div>
                <ArrowRight className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection({ onSignup, onLogin }) {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-16">
      <div className="rounded-[36px] border border-white/10 bg-zinc-950 p-6 lg:p-8">
        <div className="text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-400">Launch faster</div>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Choose your path</h2>
          <p className="mt-4 text-zinc-400">Clear entry points for creators and guests right from the landing page.</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-black/40 p-6">
            <div className="inline-flex rounded-full bg-sky-500/15 px-3 py-1 text-sm font-semibold text-sky-300">
              Creator
            </div>
            <h3 className="mt-4 text-2xl font-bold text-white">Start monetizing</h3>
            <p className="mt-3 text-zinc-400">
              Set up your profile, publish premium content and begin earning through subscriptions and direct offers.
            </p>
            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-400" />Premium profile</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-400" />Locked media</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-400" />Direct messages</div>
            </div>
            <button
              onClick={onSignup}
              className="mt-8 w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400"
            >
              Join as creator
            </button>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/40 p-6">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
              Guest
            </div>
            <h3 className="mt-4 text-2xl font-bold text-white">Explore premium creators</h3>
            <p className="mt-3 text-zinc-400">
              Browse public previews, follow creators and unlock subscriber-only experiences whenever you're ready.
            </p>
            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-400" />Fast signup</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-400" />Premium previews</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-400" />Simple subscriptions</div>
            </div>
            <button
              onClick={onLogin}
              className="mt-8 w-full rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:bg-zinc-900"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-zinc-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <span className="font-semibold text-white">OnlyFats</span> © 2026. Premium creator platform UI.
        </div>
        <div className="flex flex-wrap gap-5">
          <a href="#" className="transition hover:text-white">Privacy</a>
          <a href="#" className="transition hover:text-white">Terms</a>
          <a href="#" className="transition hover:text-white">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <Hero onSignup={onSignup} onLogin={onLogin} />
      <AudienceSection />
      <CreatorSection onSignup={onSignup} />
      <GuestSection onLogin={onLogin} />
      <PricingSection onSignup={onSignup} onLogin={onLogin} />
      <Footer />
    </div>
  );
}

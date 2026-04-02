import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Home, Bell, MessageCircle, Bookmark, CreditCard, User, Search,
  Lock, Heart, Eye, EyeOff, Menu, X, ImagePlus, Wallet, TrendingUp, Settings,
  LogOut, Send, Play, Grid3X3, Radio, MessageSquare, ChevronRight,
  Check, Compass, PlusCircle, MoreHorizontal, Trash2, Edit3,
} from "lucide-react";
import { api } from "../api/client";
import { getFeed } from "../api/posts";
import {
  getCreatorPosts, createCreatorPost, addPostMedia, publishCreatorPost,
  getMyPosts, updateCreatorPost, deleteCreatorPost,
} from "../api/creators";
import {
  getCreatorSubscriptionPlans, subscribeToCreator, getMySubscriptions,
  cancelSubscription, changeSubscriptionPlan, upsertMySubscriptionPlans,
} from "../api/subscriptions";

const API = (path, opts) => api(path, opts);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://onlyfats-backend-177204163721.asia-south1.run.app/api/v1";
const BASE = API_BASE_URL.replace("/api/v1", "");

function mediaUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!url.startsWith("/") && !url.includes("/")) return null;
  if (url.startsWith("/uploads/")) return `${BASE}${url}`;
  return `${BASE}/api/v1/media/${url}`;
}

// Reusable avatar — shows image if it loads, otherwise shows an initial-letter gradient circle
function Avatar({ src, name, size = "h-10 w-10", textSize = "text-sm", className = "" }) {
  const [broken, setBroken] = useState(false);
  const resolved = src ? mediaUrl(src) : null;
  useEffect(() => { setBroken(false); }, [src]);
  const initial = (name || "?")[0].toUpperCase();
  if (resolved && !broken) {
    return (
      <img
        src={resolved}
        alt={name || ""}
        className={`${size} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0 ${textSize} ${className}`}>
      {initial}
    </div>
  );
}

// ─── Media Carousel ───────────────────────────────────────────────────────────
function MediaCarousel({ items, locked = false, aspectClass = "aspect-[4/5]", onSubscribe, creatorId, creatorName }) {
  const [idx, setIdx] = useState(0);
  const [mediaBroken, setMediaBroken] = useState(false);
  const total = items?.length || 0;

  useEffect(() => { setIdx(0); }, [items]);
  useEffect(() => { setMediaBroken(false); }, [idx, items]);

  if (!total) return (
    <div className={`relative bg-zinc-950 flex items-center justify-center ${aspectClass}`}>
      <ImagePlus className="h-16 w-16 text-zinc-700" />
    </div>
  );

  const cur = items[idx];
  const url = cur?.url ? mediaUrl(cur.url) : cur?.object_path ? mediaUrl(cur.object_path) : null;
  const isVideo = cur?.media_kind === "video" || cur?.type?.startsWith("video");

  function prev(e) { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total); }
  function next(e) { e.stopPropagation(); setIdx((i) => (i + 1) % total); }

  return (
    <div className={`relative bg-zinc-950 overflow-hidden select-none ${aspectClass}`}>
      {/* Media */}
      {url && !mediaBroken ? (
        isVideo ? (
          <video
            src={url}
            className="absolute inset-0 h-full w-full object-contain"
            controls
            autoPlay
            muted
            loop
            playsInline
            onError={() => setMediaBroken(true)}
          />
        ) : (
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-contain" onError={() => setMediaBroken(true)} />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
          <ImagePlus className="h-12 w-12" />
        </div>
      )}

      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm z-10">
          <div className="rounded-full bg-white/10 p-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <div className="mt-4 text-xl font-semibold text-white">Subscribe to unlock</div>
          <p className="mt-2 max-w-xs text-center text-sm leading-6 text-zinc-300">
            This content is available to subscribers only.
          </p>
          {onSubscribe && (
            <button
              onClick={() => onSubscribe(creatorId, creatorName)}
              className="mt-5 rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-400 transition"
            >
              Subscribe
            </button>
          )}
        </div>
      )}

      {/* Arrows — only if unlocked and multiple items */}
      {!locked && total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/75 transition"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/75 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`rounded-full transition-all ${i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}

      {/* Counter badge (top-right) */}
      {!locked && total > 1 && (
        <div className="absolute top-3 right-3 z-20 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
          {idx + 1}/{total}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Stat Pill ───────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, value, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-sm transition ${
        active
          ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{value}</span>
    </button>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, role, onLike, onComment, onBookmark, onCreatorClick, onSubscribe }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [saved, setSaved] = useState(false);

  async function handleLike() {
    try {
      const res = await API(`/posts/${post.post_id}/like`, { method: "POST" });
      setLiked(res.liked);
      setLikeCount(res.like_count);
    } catch {}
  }

  async function handleBookmark() {
    try {
      const res = await API(`/posts/${post.post_id}/bookmark`, { method: "POST" });
      setSaved(res.saved);
    } catch {}
  }

  async function loadComments() {
    try {
      const data = await API(`/posts/${post.post_id}/comments`);
      setComments(data);
    } catch {}
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await API(`/posts/${post.post_id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: newComment }),
      });
      setNewComment("");
      loadComments();
    } catch {}
  }

  function toggleComments() {
    if (!showComments) loadComments();
    setShowComments((v) => !v);
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-zinc-900 bg-zinc-950 shadow-2xl shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          className="flex items-center gap-3 text-left hover:opacity-80"
          onClick={() => onCreatorClick?.(post.creator_id)}
        >
          <Avatar src={post.creator_avatar} name={post.creator_display_name} size="h-11 w-11" textSize="text-base" />
          <div>
            <div className="font-semibold text-white">{post.creator_display_name || "Creator"}</div>
            <div className="text-sm text-zinc-500">{post.creator_handle || ""} · {timeAgo(post.created_at)}</div>
          </div>
        </button>
        {post.locked ? (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            {post.access_tier === "VIP" ? "VIP" : "Exclusive"}
          </span>
        ) : (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Public
          </span>
        )}
      </div>

      {/* Media */}
      <MediaCarousel
        items={post.media || []}
        locked={post.locked}
        onSubscribe={onSubscribe}
        creatorId={post.creator_id}
        creatorName={post.creator_display_name}
      />

      {/* Body */}
      <div className="space-y-4 px-5 py-5">
        {post.caption && (
          <p className="text-sm leading-6 text-zinc-300">{post.caption}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <StatPill icon={Heart} value={likeCount.toLocaleString()} active={liked} onClick={handleLike} />
          <StatPill icon={MessageSquare} value={post.comment_count || 0} onClick={toggleComments} />
          {role !== "creator" && <StatPill icon={Bookmark} value={saved ? "Saved" : "Save"} active={saved} onClick={handleBookmark} />}
          <StatPill icon={Radio} value={post.locked ? (post.access_tier || "Locked") : "Free"} />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          {post.locked ? (
            <button
              onClick={() => onSubscribe?.(post.creator_id, post.creator_display_name)}
              className="rounded-2xl bg-sky-500 px-4 py-2.5 font-medium text-white transition hover:bg-sky-400"
            >
              Subscribe
            </button>
          ) : null}
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-3 border-t border-zinc-800 pt-4">
            {comments.length === 0 && (
              <p className="text-sm text-zinc-600">No comments yet. Be the first!</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                  {(c.display_name || "?")[0]}
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-300">{c.display_name} </span>
                  <span className="text-sm text-zinc-400">{c.body}</span>
                </div>
              </div>
            ))}
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500"
              />
              <button type="submit" className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400">
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subscribe Modal ──────────────────────────────────────────────────────────
function SubscribeModal({ creatorId, creatorName, onClose, onSuccess }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    getCreatorSubscriptionPlans(creatorId)
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [creatorId]);

  async function handleSubscribe(planCode) {
    setSubscribing(planCode);
    try {
      await subscribeToCreator(creatorId, { plan_code: planCode });
      onSuccess?.();
      onClose();
    } catch (e) {
      alert(e.message || "Failed to subscribe");
    } finally {
      setSubscribing(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Subscribe to</h2>
            <p className="text-sky-400 font-semibold">{creatorName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        {loading ? (
          <div className="text-center text-zinc-500 py-6">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <Lock className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-300 font-medium">No plans configured yet</p>
            <p className="text-sm text-zinc-500 mt-1">This creator hasn't set up subscription plans.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const TIER = {
                FREE:      { emoji: "🎁", accent: "border-emerald-700/50 bg-emerald-900/20", btn: "bg-emerald-600 hover:bg-emerald-500" },
                EXCLUSIVE: { emoji: "⭐", accent: "border-sky-700/50 bg-sky-900/20",     btn: "bg-sky-500 hover:bg-sky-400" },
                VIP:       { emoji: "💎", accent: "border-purple-700/50 bg-purple-900/20", btn: "bg-purple-600 hover:bg-purple-500" },
              }[plan.code] || { emoji: "📦", accent: "border-zinc-700 bg-zinc-900", btn: "bg-sky-500 hover:bg-sky-400" };
              return (
                <div key={plan.id} className={`rounded-2xl border ${TIER.accent} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{TIER.emoji}</span> {plan.name}
                      </div>
                      {plan.description && <div className="text-sm text-zinc-400 mt-1">{plan.description}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {plan.price_in_paise === 0 ? "Free" : `₹${(plan.price_in_paise / 100).toFixed(0)}`}
                      </div>
                      <div className="text-xs text-zinc-500">/{plan.duration_days}d</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSubscribe(plan.code)}
                    disabled={subscribing === plan.code}
                    className={`mt-3 w-full rounded-2xl ${TIER.btn} py-2.5 font-semibold text-white transition disabled:opacity-50`}
                  >
                    {subscribing === plan.code ? "Subscribing..." : `Subscribe — ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Creator Profile Modal ────────────────────────────────────────────────────
const TIER_CONFIG = {
  FREE:      { label: "Free",      emoji: "🆓", color: "text-zinc-300",  border: "border-zinc-700",  bg: "bg-zinc-800/60",  upgrade: null },
  EXCLUSIVE: { label: "Exclusive", emoji: "⭐", color: "text-sky-300",   border: "border-sky-500/40", bg: "bg-sky-500/10",  upgrade: "EXCLUSIVE" },
  VIP:       { label: "VIP",       emoji: "💎", color: "text-amber-300", border: "border-amber-500/40", bg: "bg-amber-500/10", upgrade: "VIP" },
};

function PostThumb({ post, onSubscribeClick }) {
  const isLocked = post.locked;
  const cfg = TIER_CONFIG[post.access_tier] || TIER_CONFIG.FREE;

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-900 group">
      {post.cover_url ? (
        <img
          src={mediaUrl(post.cover_url)}
          alt=""
          className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${isLocked ? "blur-sm brightness-50" : ""}`}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-zinc-700">
          <ImagePlus className="h-8 w-8" />
        </div>
      )}

      {/* Tier badge top-left */}
      <span className={`absolute top-1.5 left-1.5 rounded-full border px-1.5 py-px text-[9px] font-bold backdrop-blur-sm ${cfg.border} ${cfg.bg} ${cfg.color}`}>
        {cfg.emoji}
      </span>

      {isLocked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          onClick={onSubscribeClick}
        >
          <div className="rounded-full bg-black/40 p-2 backdrop-blur-sm">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <span className="mt-1.5 text-[10px] font-semibold text-white/80">
            {cfg.upgrade === "VIP" ? "VIP only" : "Subscribe"}
          </span>
        </div>
      )}

      {!isLocked && (
        <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">❤️ {post.like_count}</span>
        </div>
      )}
    </div>
  );
}

function CreatorProfileModal({ creatorId, onClose, onSubscribe, onMessage }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("FREE");

  useEffect(() => {
    setLoading(true);
    setActiveTab("FREE");
    API(`/creators/${creatorId}/profile`)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [creatorId]);

  if (loading || !profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="h-8 w-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const plan = profile.subscription_plan;
  const posts = profile.posts || [];
  const byTier = {
    FREE:      posts.filter(p => p.access_tier === "FREE"),
    EXCLUSIVE: posts.filter(p => p.access_tier === "EXCLUSIVE"),
    VIP:       posts.filter(p => p.access_tier === "VIP"),
  };

  // Which tiers are fully locked for the viewer?
  const tierLocked = {
    FREE:      false,
    EXCLUSIVE: !plan || plan === "FREE",  // FREE sub can still preview 1
    VIP:       plan !== "VIP",
  };

  function handleSubscribe() {
    onSubscribe(creatorId, profile.display_name);
    onClose();
  }

  const planCfg = plan ? TIER_CONFIG[plan] : null;
  const tabPosts = byTier[activeTab] || [];
  const tabLocked = tierLocked[activeTab];
  const tabCfg = TIER_CONFIG[activeTab];

  // Upgrade CTA text for the active locked tab
  let ctaText = null;
  let ctaNote = null;
  if (activeTab === "EXCLUSIVE" && (!plan || plan === "FREE")) {
    ctaText = plan === "FREE" ? "⭐ Upgrade to Exclusive" : "⭐ Subscribe — Exclusive";
    ctaNote = plan === "FREE"
      ? `${profile.exclusive_preview_remaining ?? 0} free preview${profile.exclusive_preview_remaining !== 1 ? "s" : ""} remaining this month`
      : `Subscribe to unlock all ${tabPosts.length} exclusive posts`;
  }
  if (activeTab === "VIP" && plan !== "VIP") {
    ctaText = plan === "EXCLUSIVE" ? "💎 Upgrade to VIP" : plan === "FREE" ? "💎 Upgrade to VIP" : "💎 Subscribe — VIP";
    ctaNote = plan === "EXCLUSIVE"
      ? `${profile.vip_preview_remaining ?? 0} VIP preview${profile.vip_preview_remaining !== 1 ? "s" : ""} remaining this month`
      : `VIP membership required for these ${tabPosts.length} posts`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center p-4">
      <div className="w-full max-w-3xl h-[88vh] flex flex-col rounded-2xl border border-zinc-800/60 bg-[#0f0f0f] shadow-2xl overflow-hidden">

        {/* ── Banner + profile header ── */}
        <div className="flex-shrink-0">
          {/* Banner — own overflow-hidden so rounded corners don't clip content outside */}
          <div className="relative h-40 overflow-hidden rounded-t-2xl">
            {profile.header_image_url ? (
              <img src={mediaUrl(profile.header_image_url)} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #0c1a4a 25%, #0f2460 50%, #1a1040 75%, #0a0a1e 100%)" }}>
                <div className="absolute top-3 right-16 h-24 w-24 rounded-full opacity-20"
                  style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />
                <div className="absolute -top-3 left-1/3 h-32 w-32 rounded-full opacity-15"
                  style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
                <div className="absolute bottom-1 left-8 h-16 w-16 rounded-full opacity-25"
                  style={{ background: "radial-gradient(circle, #0ea5e9, transparent 70%)" }} />
              </div>
            )}
            <button onClick={onClose} className="absolute top-3 right-3 z-20 rounded-full bg-black/40 p-1.5 text-white/70 hover:text-white hover:bg-black/70 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Avatar + action row — avatar uses negative margin to overlap banner; relative+z-10 so it paints above the relative banner */}
          <div className="relative z-10 px-5 -mt-8 flex items-end justify-between mb-3">
            <Avatar src={profile.profile_image_url} name={profile.display_name} size="h-16 w-16" textSize="text-xl" className="border-[3px] border-[#0f0f0f] shadow-lg" />
            {!profile.is_own_profile && (
              <div className="flex items-center gap-2 pb-1">
                {planCfg && (
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TIER_STYLE[plan]}`}>
                    {planCfg.emoji} {planCfg.label}
                  </span>
                )}
                {onMessage && (
                  <button
                    onClick={() => onMessage(creatorId)}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Message
                  </button>
                )}
                <button
                  onClick={handleSubscribe}
                  className={`rounded-xl px-4 py-1.5 font-semibold text-xs transition ${
                    plan === "VIP"
                      ? "border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                      : plan === "EXCLUSIVE"
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-sky-500 text-white hover:bg-sky-400"
                  }`}
                >
                  {plan === "VIP" ? "✓ VIP" : plan === "EXCLUSIVE" ? "💎 Go VIP" : plan === "FREE" ? "⭐ Upgrade" : "Subscribe"}
                </button>
              </div>
            )}
          </div>

          {/* Name / bio / stats */}
          <div className="px-5 pb-4">
            <h2 className="text-lg font-bold text-white leading-tight">{profile.display_name}</h2>
            {profile.bio && <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{profile.bio}</p>}
            <div className="mt-2.5 flex gap-5 text-xs text-zinc-500">
              <span><span className="font-semibold text-zinc-300">{profile.post_count}</span> Posts</span>
              <span><span className="font-semibold text-zinc-300">{profile.subscriber_count}</span> Subscribers</span>
              {profile.total_likes > 0 && (
                <span><span className="font-semibold text-zinc-300">{profile.total_likes}</span> Likes</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex-shrink-0 border-t border-zinc-800/50 grid grid-cols-3">
          {["FREE", "EXCLUSIVE", "VIP"].map((tier) => {
            const cfg = TIER_CONFIG[tier];
            const count = byTier[tier]?.length || 0;
            const locked = tierLocked[tier];
            const isActive = activeTab === tier;
            const activeUnderline = tier === "EXCLUSIVE" ? "border-sky-500" : tier === "VIP" ? "border-amber-500" : "border-zinc-500";
            return (
              <button
                key={tier}
                onClick={() => setActiveTab(tier)}
                className={`relative flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  isActive ? `${cfg.color} ${activeUnderline}` : "text-zinc-600 border-transparent hover:text-zinc-400"
                }`}
              >
                <span>{cfg.emoji}</span>
                <span>{cfg.label}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-px ${isActive ? "bg-zinc-800 text-zinc-300" : "bg-zinc-900 text-zinc-600"}`}>
                  {count}
                </span>
                {locked && <Lock className="h-2.5 w-2.5 text-zinc-700 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Upgrade nudge */}
          {ctaText && (
            <div className={`mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 ${
              activeTab === "VIP" ? "bg-amber-500/8 border border-amber-500/15" : "bg-sky-500/8 border border-sky-500/15"
            }`}>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white">{activeTab === "VIP" ? "💎 VIP Content" : "⭐ Exclusive Content"}</p>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">{ctaNote}</p>
              </div>
              <button
                onClick={handleSubscribe}
                className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "VIP" ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-sky-500 text-white hover:bg-sky-400"
                }`}
              >
                {ctaText}
              </button>
            </div>
          )}

          {tabPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-700">
              <ImagePlus className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">No {tabCfg.label.toLowerCase()} posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-px p-3">
              {tabPosts.map((p) => (
                <PostThumb key={p.post_id} post={p} onSubscribeClick={handleSubscribe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Post Editor Modal ────────────────────────────────────────────────────────
function PostEditorModal({ editPost, onClose, onSaved }) {
  const isEdit = !!editPost;
  const [caption, setCaption] = useState(editPost?.caption || "");
  const [visibility, setVisibility] = useState(editPost?.visibility || "public");
  const [accessTier, setAccessTier] = useState(editPost?.access_tier || "FREE");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState("");

  function inferMediaType(fileList) {
    const hasVideo = fileList.some((f) => f.type.startsWith("video"));
    const hasImage = fileList.some((f) => f.type.startsWith("image"));
    if (hasVideo && hasImage) return "mixed";
    if (hasVideo) return "video";
    return "image";
  }

  function onFilesChange(e) {
    const chosen = Array.from(e.target.files);
    setFiles(chosen);
    setPreviews(chosen.map((f) => ({ url: URL.createObjectURL(f), type: f.type })));
  }

  async function uploadFilesToPost(postId, fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fd = new FormData();
      fd.append("purpose", "post_media");
      fd.append("post_id", postId);
      fd.append("files", file);
      const uploaded = await api("/uploads", { method: "POST", body: fd });
      const u = uploaded?.data?.[0] || uploaded;
      if (u) {
        await addPostMedia(postId, {
          media_kind: file.type.startsWith("video") ? "video" : "photo",
          bucket_name: u.bucket_name || "local",
          object_path: u.object_path || u.url || "",
          thumbnail_object_path: u.thumbnail_object_path || u.object_path || u.url || "",
          mime_type: file.type,
          file_size_bytes: file.size,
          sort_order: i,
          processing_status: "ready",
        });
      }
    }
  }

  async function handleSaveDraft() {
    setSaving(true); setMsg("");
    try {
      if (isEdit) {
        await updateCreatorPost(editPost.post_id, { caption, visibility, access_tier: accessTier });
        if (files.length > 0) await uploadFilesToPost(editPost.post_id, files);
      } else {
        if (!caption.trim() && files.length === 0) { setMsg("Add a caption or media."); setSaving(false); return; }
        const mediaType = files.length > 0 ? inferMediaType(files) : "image";
        const res = await createCreatorPost({ caption, visibility, media_type: mediaType, access_tier: accessTier });
        const postId = res?.data?.post_id;
        if (files.length > 0 && postId) await uploadFilesToPost(postId, files);
      }
      setMsg("Draft saved ✓");
      onSaved?.();
    } catch (e) { setMsg(e?.detail || e?.message || "Save failed."); }
    finally { setSaving(false); }
  }

  async function handlePublish() {
    setPublishing(true); setMsg("");
    try {
      let postId = isEdit ? editPost.post_id : null;
      if (!isEdit) {
        if (files.length === 0 && !caption.trim()) { setMsg("Add a caption or media."); setPublishing(false); return; }
        const mediaType = files.length > 0 ? inferMediaType(files) : "image";
        const res = await createCreatorPost({ caption, visibility, media_type: mediaType, access_tier: accessTier });
        postId = res?.data?.post_id;
        if (files.length > 0 && postId) await uploadFilesToPost(postId, files);
      } else {
        await updateCreatorPost(postId, { caption, visibility, access_tier: accessTier });
        if (files.length > 0) await uploadFilesToPost(postId, files);
      }
      if (postId && (!isEdit || editPost.status === "draft")) {
        await publishCreatorPost(postId);
      }
      onSaved?.();
      onClose();
    } catch (e) { setMsg(e?.detail || e?.message || "Publish failed."); }
    finally { setPublishing(false); }
  }

  const TIER_OPTIONS = [
    { value: "FREE",      emoji: "🎁", label: "Free",      desc: "Visible to all subscribers",     color: "border-emerald-700/50 bg-emerald-900/20 text-emerald-300" },
    { value: "EXCLUSIVE", emoji: "🔓", label: "Exclusive", desc: "Exclusive & VIP subscribers",    color: "border-sky-700/50 bg-sky-900/20 text-sky-300" },
    { value: "VIP",       emoji: "💎", label: "VIP",       desc: "VIP subscribers only",           color: "border-purple-700/50 bg-purple-900/20 text-purple-300" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 md:items-center">
      <div className="w-full max-w-lg rounded-[28px] border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Edit post" : "New post"}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition rounded-full p-1 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Caption */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something for your fans..."
              rows={3}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 resize-none transition"
            />
          </div>

          {/* Tier selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Access tier</label>
            <div className="grid grid-cols-3 gap-2">
              {TIER_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setAccessTier(t.value)}
                  className={`relative rounded-2xl border p-3 text-center transition ${
                    accessTier === t.value ? t.color : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {accessTier === t.value && <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-white/60" />}
                  <div className="text-xl mb-1">{t.emoji}</div>
                  <div className="text-xs font-bold">{t.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5 leading-tight">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Visibility</label>
            <div className="flex gap-2">
              {[{ value: "public", label: "🌍 Public" }, { value: "subscribers_only", label: "🔒 Subscribers only" }].map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVisibility(v.value)}
                  className={`flex-1 rounded-2xl border py-2.5 text-sm font-medium transition ${
                    visibility === v.value
                      ? "border-sky-600/60 bg-sky-900/20 text-sky-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Existing media (edit) */}
          {isEdit && editPost.media?.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current media</label>
              <div className="flex gap-2 flex-wrap">
                {editPost.media.map((m) => (
                  <div key={m.id} className="h-20 w-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 relative">
                    {m.media_kind === "video" ? (
                      <div className="h-full w-full flex items-center justify-center text-zinc-500">
                        <Play className="h-6 w-6" />
                      </div>
                    ) : (
                      <img src={mediaUrl(m.object_path)} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File picker */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {isEdit ? "Add more media" : "Media (photos & videos)"}
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-800 p-8 hover:border-sky-500/50 hover:bg-sky-500/5 transition">
              <ImagePlus className="h-7 w-7 text-sky-500/70" />
              <span className="text-sm text-zinc-400 font-medium">
                {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Tap to choose photos or videos"}
              </span>
              <span className="text-xs text-zinc-600">All photo & video formats supported</span>
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={onFilesChange} />
            </label>
          </div>

          {/* New file previews — carousel */}
          {previews.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-zinc-800">
              <MediaCarousel
                items={previews.map((p) => ({ url: p.url, media_kind: p.type.startsWith("video") ? "video" : "photo", type: p.type }))}
              />
              {/* Thumbnail strip */}
              <div className="flex gap-1.5 p-2 bg-zinc-900 overflow-x-auto">
                {previews.map((p, i) => (
                  <div key={i} className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 group">
                    {p.type.startsWith("video") ? (
                      <div className="h-full w-full flex items-center justify-center text-zinc-500">
                        <Play className="h-4 w-4" />
                      </div>
                    ) : (
                      <img src={p.url} alt="" className="h-full w-full object-cover" />
                    )}
                    <button
                      onClick={() => {
                        setFiles((prev) => prev.filter((_, idx) => idx !== i));
                        setPreviews((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-2.5 w-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {msg && (
            <p className={`text-sm font-medium ${msg.includes("✓") ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-zinc-800 flex-shrink-0">
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="flex-1 rounded-2xl border border-zinc-700 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 transition"
          >
            {saving ? "Saving..." : "Save draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            className="flex-1 rounded-2xl bg-sky-500 py-3 text-sm font-bold text-white hover:bg-sky-400 disabled:opacity-40 transition"
          >
            {publishing ? "Publishing..." : isEdit && editPost.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Posts Page (Creator) ─────────────────────────────────────────────────────
const STATUS_BADGE = {
  draft:     "border-zinc-600/50 bg-zinc-800/50 text-zinc-400",
  published: "border-emerald-600/40 bg-emerald-900/20 text-emerald-300",
};

function PostsPage({ onPostPublished }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorPost, setEditorPost] = useState(undefined);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterTab, setFilterTab] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    getMyPosts()
      .then((res) => setPosts(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(postId) {
    setDeletingId(postId);
    try {
      await deleteCreatorPost(postId);
      setConfirmDelete(null);
      load();
    } catch (e) { alert(e?.detail || "Delete failed"); }
    finally { setDeletingId(null); }
  }

  const visible = posts.filter((p) =>
    filterTab === "all" ? true : p.status === filterTab
  );

  const draftCount = posts.filter((p) => p.status === "draft").length;
  const pubCount   = posts.filter((p) => p.status === "published").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">My Posts</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{pubCount} published · {draftCount} draft</p>
        </div>
        <button
          onClick={() => setEditorPost(null)}
          className="flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-400 transition flex-shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> New post
        </button>
      </div>

      {/* Filter tabs */}
      {posts.length > 0 && (
        <div className="flex gap-2">
          {[
            { key: "all",       label: "All",       count: posts.length },
            { key: "published", label: "Published", count: pubCount },
            { key: "draft",     label: "Drafts",    count: draftCount },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                filterTab === t.key
                  ? "border-sky-600/50 bg-sky-900/20 text-sky-300"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${filterTab === t.key ? "bg-white/10" : "bg-zinc-800"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading && <div className="py-16 text-center text-zinc-500">Loading posts...</div>}

      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-zinc-900 bg-zinc-950 py-24">
          <div className="h-16 w-16 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-4">
            <ImagePlus className="h-8 w-8 text-zinc-600" />
          </div>
          <p className="font-semibold text-zinc-400">No posts yet</p>
          <p className="text-sm text-zinc-600 mt-1 mb-6">Create your first post to reach your fans.</p>
          <button
            onClick={() => setEditorPost(null)}
            className="rounded-2xl bg-sky-500 px-6 py-3 text-sm font-bold text-white hover:bg-sky-400 transition"
          >
            Create first post
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && visible.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((post) => {
            const m = post.media?.[0];
            const cover = m ? mediaUrl(m.object_path || m.thumbnail_object_path || "") : null;
            const tierCfg = TIER_CONFIG[post.access_tier] || TIER_CONFIG.FREE;

            return (
              <div key={post.post_id} className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                {/* Thumbnail */}
                <div className="aspect-square relative bg-zinc-800">
                  {cover ? (
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-zinc-700" />
                    </div>
                  )}
                  {post.media_type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-black/50 flex items-center justify-center">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Multi-image badge */}
                  {post.media?.length > 1 && (
                    <div className="absolute top-2 right-2 rounded-lg bg-black/60 px-1.5 py-0.5 flex items-center gap-1">
                      <Grid3X3 className="h-3 w-3 text-white" />
                      <span className="text-[10px] font-bold text-white">{post.media.length}</span>
                    </div>
                  )}
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button
                      onClick={() => setEditorPost(post)}
                      className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(post)}
                      className="h-9 w-9 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/35 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[post.status] || STATUS_BADGE.draft}`}>
                      {post.status}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tierCfg.border} ${tierCfg.bg} ${tierCfg.color}`}>
                      {tierCfg.emoji} {tierCfg.label}
                    </span>
                  </div>
                  {post.caption && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight">{post.caption}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.like_count || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.comment_count || 0}</span>
                    <span className="ml-auto">{timeAgo(post.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor modal */}
      {editorPost !== undefined && (
        <PostEditorModal
          editPost={editorPost}
          onClose={() => setEditorPost(undefined)}
          onSaved={() => { load(); onPostPublished?.(); if (editorPost === null) setEditorPost(undefined); }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 text-center shadow-2xl">
            <div className="h-14 w-14 rounded-2xl bg-red-950/40 border border-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Delete post?</h3>
            <p className="text-sm text-zinc-400 mb-6">
              {confirmDelete.status === "published"
                ? "This post will be removed from your profile and the feed."
                : "This draft will be permanently deleted."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-2xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition">
                Keep it
              </button>
              <button onClick={() => handleDelete(confirmDelete.post_id)} disabled={!!deletingId}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50 transition">
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feed ─────────────────────────────────────────────────────────────────────
function Feed({ role, profileVersion, feedVersion, isActive, onMessage }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribeTarget, setSubscribeTarget] = useState(null); // {id, name}
  const [profileTarget, setProfileTarget] = useState(null);
  const [editorPost, setEditorPost] = useState(undefined);
  const initialMount = useRef(true);

  const loadFeed = useCallback(() => {
    getFeed()
      .then((data) => {
        const raw = Array.isArray(data) ? data : [];
        setPosts(raw);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  // Re-fetch when profile is updated so new avatar shows immediately
  useEffect(() => { if (profileVersion > 0) loadFeed(); }, [profileVersion]);
  // Re-fetch when a new post is published from another tab
  useEffect(() => { if (feedVersion > 0) loadFeed(); }, [feedVersion]);
  // Re-fetch whenever the home tab becomes active (catches posts published from any tab)
  useEffect(() => {
    if (initialMount.current) { initialMount.current = false; return; }
    if (isActive) loadFeed();
  }, [isActive]);

  return (
    <>
      <div className="space-y-6">
        {role === "creator" && <UploadDropzone onClick={() => setEditorPost(null)} />}
        {loading && (
          <div className="flex items-center justify-center py-16 text-zinc-500">Loading feed...</div>
        )}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
            <ImagePlus className="h-12 w-12 opacity-30" />
            <p>No posts yet. Follow some creators!</p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.post_id}
            post={post}
            role={role}
            onCreatorClick={(id) => setProfileTarget(id)}
            onSubscribe={(id, name) => setSubscribeTarget({ id, name })}
          />
        ))}
      </div>
      {subscribeTarget && (
        <SubscribeModal
          creatorId={subscribeTarget.id}
          creatorName={subscribeTarget.name}
          onClose={() => setSubscribeTarget(null)}
          onSuccess={loadFeed}
        />
      )}
      {profileTarget && (
        <CreatorProfileModal
          creatorId={profileTarget}
          onClose={() => setProfileTarget(null)}
          onSubscribe={(id, name) => { setProfileTarget(null); setSubscribeTarget({ id, name }); }}
          onMessage={onMessage ? (id) => { setProfileTarget(null); onMessage(id); } : undefined}
        />
      )}
      {editorPost !== undefined && (
        <PostEditorModal
          editPost={editorPost}
          onClose={() => setEditorPost(undefined)}
          onSaved={() => { loadFeed(); setEditorPost(undefined); }}
        />
      )}
    </>
  );
}

// ─── Upload Dropzone (for creators) ──────────────────────────────────────────
function UploadDropzone({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[28px] border border-dashed border-zinc-700 bg-zinc-950/80 p-5 text-left hover:border-sky-500/50 hover:bg-sky-500/5 transition"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
        <PlusCircle className="h-6 w-6" />
      </div>
      <div>
        <div className="font-semibold text-white">New post</div>
        <div className="text-sm text-zinc-500">Share photos or videos with your subscribers</div>
      </div>
    </button>
  );
}

// ─── Notifications Page ───────────────────────────────────────────────────────
function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API("/notifications")
      .then(setNotifs)
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await API("/notifications/mark-all-read", { method: "POST" });
    setNotifs((n) => n.map((x) => ({ ...x, is_read: true })));
  }

  const icons = { new_post: "🆕", new_like: "❤️", new_comment: "💬", new_message: "✉️", new_subscriber: "⭐", subscription_expired: "⏰" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Notifications</h2>
        <button onClick={markAllRead} className="rounded-2xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900">
          Mark all read
        </button>
      </div>
      {loading && <div className="py-12 text-center text-zinc-500">Loading...</div>}
      {!loading && notifs.length === 0 && (
        <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-12 text-center text-zinc-500">
          No notifications yet
        </div>
      )}
      <div className="space-y-2">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 rounded-2xl border px-5 py-4 transition ${
              n.is_read ? "border-zinc-900 bg-zinc-950" : "border-sky-500/20 bg-sky-500/5"
            }`}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{icons[n.type] || "🔔"}</span>
            <div className="flex-1">
              <div className="font-medium text-white">{n.title}</div>
              {n.body && <div className="mt-0.5 text-sm text-zinc-400">{n.body}</div>}
              <div className="mt-1 text-xs text-zinc-600">{timeAgo(n.created_at)}</div>
            </div>
            {!n.is_read && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-sky-500 mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Messages Page ────────────────────────────────────────────────────────────
function MessagesPage({ currentUser, pendingCreatorId, onPendingHandled }) {
  const role = currentUser?.role === "creator" ? "creator" : "visitor";
  const [fbReady, setFbReady] = useState(false);
  const [convs, setConvs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingSelectId, setPendingSelectId] = useState(null);
  const messagesEndRef = useRef(null);

  // ── Firebase auth ──────────────────────────────────────────────────────────
  useEffect(() => {
    import("../firebase").then(({ firebaseAuth }) => {
      import("firebase/auth").then(({ onAuthStateChanged, signInWithCustomToken }) => {
        const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
          if (user) {
            setFbReady(true);
          } else {
            // exchange JWT for Firebase custom token
            try {
              const data = await API("/auth/firebase-token");
              await signInWithCustomToken(firebaseAuth, data.firebase_token);
            } catch (e) {
              console.error("Firebase auth failed", e);
            }
          }
        });
        return unsub;
      });
    });
  }, []);

  // ── Load conversation list via REST API (works for both fan and creator) ──
  const fetchConvs = useRef(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await API("/messages/conversations");
        if (cancelled || !Array.isArray(data)) return;
        setConvs(data.map(c => ({
          id: c.conv_id,
          otherName: c.other_name,
          otherAvatar: c.other_avatar,
          lastMessage: c.last_message,
          lastMessageAt: c.last_message_at,
          unreadCount: c.unread_count,
        })));
      } catch (e) {
        console.error("Failed to load conversations:", e);
      }
    }
    fetchConvs.current = load;
    load();
    const iv = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // ── Load messages: REST API polling + Firestore real-time if available ────
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    let firestoreWorking = false;
    let unsub = null;

    // REST API loader — used as primary or fallback
    async function loadMessages() {
      try {
        const data = await API(`/messages/conversations/${selected.id}/messages`);
        if (cancelled || firestoreWorking || !Array.isArray(data)) return;
        setMessages(data);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (e) {
        console.error("REST messages error:", e);
      }
    }

    // Load immediately via REST
    loadMessages();
    // Poll every 3s while no Firestore
    const iv = setInterval(() => { if (!firestoreWorking) loadMessages(); }, 3000);

    // Also try Firestore real-time (if Firebase auth completed)
    if (fbReady) {
      import("../firebase").then(({ db }) => {
        import("firebase/firestore").then(({ collection, query, orderBy, onSnapshot }) => {
          const q = query(
            collection(db, "conversations", selected.id, "messages"),
            orderBy("createdAt", "asc")
          );
          unsub = onSnapshot(q, (snap) => {
            if (cancelled) return;
            firestoreWorking = true; // Firestore is working — stop polling
            setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, (err) => {
            console.error("Firestore messages error (using REST fallback):", err);
            firestoreWorking = false;
          });
        });
      });
    }

    // Mark as read
    API(`/messages/conversations/${selected.id}/read`, { method: "POST" }).catch(() => {});
    return () => {
      cancelled = true;
      clearInterval(iv);
      unsub?.();
    };
  }, [fbReady, selected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function selectConv(conv) {
    setSelected(conv);
    setMessages([]);
  }

  // Search creators for compose modal
  useEffect(() => {
    if (!showSearch) { setSearchQ(""); setSearchResults([]); return; }
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      API(`/search/creators?q=${encodeURIComponent(searchQ)}`)
        .then(setSearchResults)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, showSearch]);

  // When pendingCreatorId arrives (from creator profile "Message" button), start conv immediately
  // Don't wait for fbReady — the backend API works independently of Firestore auth
  useEffect(() => {
    if (!pendingCreatorId) return;
    onPendingHandled?.();   // clear parent state right away
    startConvWithCreator(pendingCreatorId);
  }, [pendingCreatorId]);

  // Auto-select a conversation once it appears in the list
  useEffect(() => {
    if (!pendingSelectId) return;
    const match = convs.find((c) => c.id === pendingSelectId);
    if (match) { setSelected(match); setPendingSelectId(null); }
  }, [pendingSelectId, convs]);

  async function startConvWithCreator(creatorId) {
    if (role === "creator") return;
    setStarting(true);
    setShowSearch(false);
    try {
      const data = await API("/messages/conversations", {
        method: "POST",
        body: JSON.stringify({ creator_id: creatorId }),
      });
      if (data?.conv_id) {
        // Trigger immediate conversation list refresh
        fetchConvs.current?.();
        const existing = convs.find((c) => c.id === data.conv_id);
        if (existing) {
          setSelected(existing);
        } else {
          setPendingSelectId(data.conv_id);
        }
      }
    } catch (e) {
      console.error("Failed to start conversation", e);
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    try {
      await API("/messages/send", {
        method: "POST",
        body: JSON.stringify({ conv_id: selected.id, body: input.trim() }),
      });
      setInput("");
    } catch (e) {
      console.error("Send failed", e);
    } finally {
      setSending(false);
    }
  }

  // helpers for display (REST API shape: otherName/otherAvatar; Firestore shape: fanDisplayName etc.)
  function convName(conv) {
    return conv.otherName || (role === "creator" ? conv.fanDisplayName : conv.creatorDisplayName) || "Unknown";
  }
  function convAvatar(conv) {
    return conv.otherAvatar || (role === "creator" ? conv.fanAvatarUrl : conv.creatorAvatarUrl) || "";
  }
  function convUnread(conv) {
    return conv.unreadCount ?? (role === "creator" ? conv.unreadByCreator : conv.unreadByFan) ?? 0;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4 max-h-[820px]">

      {/* ── Conversation list ─────────────────────────────────────────────── */}
      <div className={`flex flex-col ${selected ? "hidden md:flex" : "flex"} w-full md:w-[300px] flex-shrink-0 rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-sm shadow-xl shadow-black/40 overflow-hidden`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-sky-400" />
            </div>
            <h2 className="text-base font-bold text-white">Messages</h2>
          </div>
          {role !== "creator" && (
            <button
              onClick={() => setShowSearch(true)}
              title="New message"
              className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 hover:bg-sky-500/20 hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {convs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 px-4 text-center">
              <div className="h-14 w-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">No messages yet</p>
                <p className="text-xs text-zinc-600 mt-1">Start a conversation with a creator</p>
              </div>
              {role !== "creator" && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-1 flex items-center gap-2 rounded-xl bg-sky-500/10 border border-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition-all"
                >
                  <Edit3 className="h-3 w-3" /> New message
                </button>
              )}
            </div>
          )}
          {convs.map((c) => {
            const unread = convUnread(c);
            const isActive = selected?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => selectConv(c)}
                className={`group w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                  isActive
                    ? "bg-sky-500/10 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.2)]"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={convAvatar(c)} name={convName(c)} size="h-10 w-10" className="ring-2 ring-black" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-sky-500/40 animate-pulse">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold truncate ${isActive ? "text-sky-300" : "text-white"}`}>
                    {convName(c)}
                  </div>
                  <div className={`truncate text-xs mt-0.5 ${unread > 0 ? "text-zinc-300 font-medium" : "text-zinc-500"}`}>
                    {c.lastMessage || "No messages yet"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat window ───────────────────────────────────────────────────── */}
      {selected ? (
        <div className="flex flex-1 flex-col rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-sm shadow-xl shadow-black/40 overflow-hidden">

          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3.5 bg-zinc-900/80">
            <button className="md:hidden text-zinc-500 hover:text-white transition mr-1" onClick={() => setSelected(null)}>
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div className="relative">
              <Avatar src={convAvatar(selected)} name={convName(selected)} size="h-9 w-9" className="ring-2 ring-sky-500/30" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900 shadow-lg shadow-emerald-500/50" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{convName(selected)}</div>
              <div className="text-xs text-emerald-400 font-medium">Online</div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
            style={{ background: "radial-gradient(ellipse at top, rgba(14,165,233,0.03) 0%, transparent 60%)" }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                <div className="h-16 w-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center shadow-xl shadow-black/40">
                  <MessageCircle className="h-7 w-7 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400">Say hello!</p>
                  <p className="text-xs text-zinc-600 mt-1">Be the first to send a message</p>
                </div>
              </div>
            )}
            {messages.map((m, i) => {
              const isMine = m.senderId === currentUser?.id;
              const prevMine = i > 0 && messages[i - 1].senderId === currentUser?.id;
              const isGrouped = isMine === prevMine && i > 0;
              return (
                <div key={m.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-3"}`}>
                  {!isMine && !isGrouped && (
                    <Avatar src={convAvatar(selected)} name={convName(selected)} size="h-6 w-6" textSize="text-xs" className="mb-0.5" />
                  )}
                  {!isMine && isGrouped && <div className="w-6 flex-shrink-0" />}
                  <div
                    className={`max-w-[68%] px-4 py-2.5 text-sm leading-relaxed shadow-lg transition-all ${
                      isMine
                        ? "bg-sky-500 text-white rounded-2xl rounded-br-sm shadow-sky-500/20"
                        : "bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm shadow-black/30"
                    } ${isGrouped ? (isMine ? "rounded-tr-lg" : "rounded-tl-lg") : ""}`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-3 border-t border-white/5 bg-zinc-900/80">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-2xl border border-white/10 bg-zinc-800/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-sky-500/50 focus:bg-zinc-800 focus:shadow-[0_0_0_3px_rgba(14,165,233,0.08)] transition-all"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="h-10 w-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 hover:shadow-sky-400/40 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:shadow-none transition-all duration-150"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm"
          style={{ background: "radial-gradient(ellipse at center, rgba(14,165,233,0.04) 0%, transparent 70%)" }}>
          <div className="text-center">
            <div className="h-20 w-20 rounded-3xl bg-zinc-800/80 border border-white/5 shadow-2xl shadow-black/60 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-9 w-9 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">Select a conversation</p>
            <p className="text-zinc-600 text-sm mt-1">or start a new one</p>
            {role !== "creator" && (
              <button
                onClick={() => setShowSearch(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 hover:shadow-sky-400/40 hover:scale-105 active:scale-95 transition-all duration-150"
              >
                <Edit3 className="h-4 w-4" />
                New Message
              </button>
            )}
          </div>
        </div>
      )}

      {/* Creator search modal for new conversations */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h3 className="font-bold text-white">New message</h3>
              <button onClick={() => setShowSearch(false)} className="text-zinc-500 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 mb-3">
                <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search creators..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                />
              </div>
              {searchQ.trim() === "" && (
                <p className="text-center text-xs text-zinc-600 py-4">Type a name to search creators</p>
              )}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => startConvWithCreator(c.id)}
                    disabled={starting}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-800 transition text-left disabled:opacity-50"
                  >
                    <Avatar src={c.profile_image_url} name={c.display_name} size="h-9 w-9" />
                    <div className="min-w-0">
                      <div className="font-medium text-white text-sm truncate">{c.display_name}</div>
                      {c.bio && <div className="text-xs text-zinc-500 truncate">{c.bio}</div>}
                    </div>
                  </button>
                ))}
                {searchQ.trim() && searchResults.length === 0 && (
                  <p className="text-center text-xs text-zinc-600 py-4">No creators found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Collections / Bookmarks ──────────────────────────────────────────────────
function CollectionsPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API("/bookmarks")
      .then(setBookmarks)
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Saved Posts</h2>
      {loading && <div className="py-12 text-center text-zinc-500">Loading...</div>}
      {!loading && bookmarks.length === 0 && (
        <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-12 text-center text-zinc-500">
          <Bookmark className="h-12 w-12 mx-auto opacity-20 mb-3" />
          <p>No saved posts yet. Tap the bookmark icon on any post.</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {bookmarks.map((b) => (
          <div key={b.post_id} className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">
            {b.cover_url ? (
              <img src={mediaUrl(b.cover_url)} alt="" className="aspect-square w-full object-cover" />
            ) : (
              <div className="aspect-square w-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                <ImagePlus className="h-8 w-8" />
              </div>
            )}
            <div className="p-3">
              <div className="text-xs font-medium text-sky-400">{b.creator_display_name}</div>
              <div className="mt-0.5 truncate text-sm text-zinc-300">{b.caption}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Plan tier badge colours ──────────────────────────────────────────────────
const TIER_STYLE = {
  FREE:      "border-zinc-600/40 bg-zinc-600/10 text-zinc-300",
  EXCLUSIVE: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  VIP:       "border-amber-500/40 bg-amber-500/10 text-amber-300",
};
const TIER_ICON = { FREE: "🆓", EXCLUSIVE: "⭐", VIP: "💎" };

// ─── Subscriptions Page ───────────────────────────────────────────────────────
function SubscriptionsPage({ role, onCreatorClick, onSubscribe, setActive }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [managing, setManaging] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [pendingPlan, setPendingPlan] = useState(null); // { subscriptionId, planCode, currentPlan, isUpgrade, name, price }
  const [actionLoading, setActionLoading] = useState(false);

  const TIER_ORDER = { FREE: 0, EXCLUSIVE: 1, VIP: 2 };
  const PLAN_META = {
    FREE:      { emoji: "🎁", label: "Free",      price: "₹0/mo",    priceNote: "No payment needed" },
    EXCLUSIVE: { emoji: "🔓", label: "Exclusive", price: "₹499/mo",  priceNote: "Billed monthly" },
    VIP:       { emoji: "💎", label: "VIP",       price: "₹999/mo",  priceNote: "Billed monthly" },
  };

  const load = useCallback(() => {
    getMySubscriptions()
      .then((data) => setSubs(Array.isArray(data) ? data : []))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(subId) {
    setActionLoading(true);
    try {
      await cancelSubscription(subId);
      setConfirmCancel(null);
      setManaging(null);
      load();
    } catch (e) {
      alert(e?.detail || "Failed to cancel subscription");
    } finally {
      setActionLoading(false);
    }
  }

  function requestPlanChange(sub, newPlanCode) {
    const isUpgrade = TIER_ORDER[newPlanCode] > TIER_ORDER[sub.plan_code];
    setPendingPlan({
      subscriptionId: sub.subscription_id,
      planCode: newPlanCode,
      currentPlan: sub.plan_code,
      creatorName: sub.creator_display_name,
      isUpgrade,
      ...PLAN_META[newPlanCode],
    });
  }

  async function handleChangePlan() {
    if (!pendingPlan) return;
    setActionLoading(true);
    try {
      await changeSubscriptionPlan(pendingPlan.subscriptionId, pendingPlan.planCode);
      setPendingPlan(null);
      setManaging(null);
      load();
    } catch (e) {
      alert(e?.detail || "Failed to change plan");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => { load(); }, [load]);

  const SUB_TABS = [
    { key: "ALL",       label: "All",       emoji: "⭐", color: "text-zinc-300",    border: "border-zinc-700",      bg: "bg-zinc-800" },
    { key: "FREE",      label: "Free",      emoji: "🎁", color: "text-emerald-300", border: "border-emerald-700/60", bg: "bg-emerald-900/30" },
    { key: "EXCLUSIVE", label: "Exclusive", emoji: "🔓", color: "text-sky-300",     border: "border-sky-700/60",     bg: "bg-sky-900/30" },
    { key: "VIP",       label: "VIP",       emoji: "💎", color: "text-purple-300",  border: "border-purple-700/60",  bg: "bg-purple-900/30" },
  ];

  const visibleSubs = activeTab === "ALL" ? subs : subs.filter(s => s.plan_code === activeTab);

  if (role === "creator") {
    return (
      <div className="space-y-5 max-w-lg">
        <h2 className="text-xl font-bold text-white">Subscriptions</h2>
        <div className="rounded-[28px] border border-sky-800/30 bg-sky-900/10 p-6 flex items-start gap-4">
          <div className="rounded-2xl bg-sky-500/20 p-3 flex-shrink-0">
            <CreditCard className="h-6 w-6 text-sky-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Set up your subscription plans</p>
            <p className="text-sm text-zinc-400 mt-1">Configure what fans pay for FREE, Exclusive, and VIP access to your content.</p>
            <button
              onClick={() => setActive?.("settings")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition"
            >
              <Settings className="h-4 w-4" /> Go to Plans &amp; Pricing
            </button>
          </div>
        </div>
        <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-12 text-center text-zinc-500">
          <TrendingUp className="h-10 w-10 mx-auto text-zinc-700 mb-3" />
          <p className="text-sm font-medium">Subscriber analytics coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">My Subscriptions</h2>
        <span className="text-sm text-zinc-500">{subs.length} active</span>
      </div>

      {/* Tier legend */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            code: "FREE", label: "Free", emoji: "🎁",
            perks: ["All public posts", "1 exclusive preview / mo"],
            from: "from-emerald-950/70", border: "border-emerald-800/40",
            glow: "shadow-emerald-950/60", dot: "bg-emerald-400", text: "text-emerald-300",
          },
          {
            code: "EXCLUSIVE", label: "Exclusive", emoji: "🔓",
            perks: ["All exclusive content", "3 VIP previews / mo"],
            from: "from-sky-950/70", border: "border-sky-800/40",
            glow: "shadow-sky-950/60", dot: "bg-sky-400", text: "text-sky-300",
          },
          {
            code: "VIP", label: "VIP", emoji: "💎",
            perks: ["Everything unlocked", "No limits, ever"],
            from: "from-purple-950/70", border: "border-purple-800/40",
            glow: "shadow-purple-950/60", dot: "bg-purple-400", text: "text-purple-300",
          },
        ].map(({ code, label, emoji, perks, from, border, glow, dot, text }) => (
          <div key={code} className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-b ${from} to-zinc-950 p-4 shadow-lg ${glow}`}>
            {/* Glow orb */}
            <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full ${dot} opacity-10 blur-xl`} />
            <div className="text-2xl mb-2">{emoji}</div>
            <div className={`font-bold text-sm ${text}`}>{label}</div>
            <div className="mt-2 space-y-1">
              {perks.map((p) => (
                <div key={p} className="flex items-center gap-1.5">
                  <div className={`h-1 w-1 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="text-[11px] text-zinc-400 leading-tight">{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      {!loading && subs.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {SUB_TABS.map((t) => {
            const count = t.key === "ALL" ? subs.length : subs.filter(s => s.plan_code === t.key).length;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  active ? `${t.border} ${t.bg} ${t.color}` : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-white/10" : "bg-zinc-800 text-zinc-600"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && <div className="py-12 text-center text-zinc-500">Loading...</div>}
      {!loading && subs.length === 0 && (
        <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-12 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">No active subscriptions</p>
          <p className="text-sm text-zinc-600 mt-1">Discover creators and subscribe to unlock content</p>
          <button
            onClick={() => setActive?.("discover")}
            className="mt-4 rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"
          >
            Browse Creators
          </button>
        </div>
      )}

      {!loading && subs.length > 0 && visibleSubs.length === 0 && (
        <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-10 text-center">
          <p className="text-zinc-500 text-sm">No {activeTab.toLowerCase()} subscriptions yet.</p>
        </div>
      )}

      <div className="space-y-5">
        {visibleSubs.map((s) => {
          const tierAccent = {
            FREE:      { border: "border-emerald-800/30", shadow: "shadow-emerald-950/40", glow: "from-emerald-950/40", bar: "bg-emerald-500",  dot: "bg-emerald-400", badge: "text-emerald-300" },
            EXCLUSIVE: { border: "border-sky-800/40",     shadow: "shadow-sky-950/50",     glow: "from-sky-950/40",     bar: "bg-sky-500",      dot: "bg-sky-400",     badge: "text-sky-300"     },
            VIP:       { border: "border-purple-800/40",  shadow: "shadow-purple-950/50",  glow: "from-purple-950/40",  bar: "bg-purple-500",   dot: "bg-purple-400",  badge: "text-purple-300"  },
          }[s.plan_code] || { border: "border-zinc-800", shadow: "shadow-black/30", glow: "from-zinc-900/40", bar: "bg-zinc-500", dot: "bg-zinc-400", badge: "text-zinc-300" };

          return (
            <div key={s.subscription_id}
              className={`relative overflow-hidden rounded-[28px] border ${tierAccent.border} bg-zinc-950 shadow-xl ${tierAccent.shadow} transition-transform hover:-translate-y-0.5`}>

              {/* Tier-coloured top glow strip */}
              <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r ${
                s.plan_code === "FREE"      ? "from-transparent via-emerald-500/50 to-transparent" :
                s.plan_code === "EXCLUSIVE" ? "from-transparent via-sky-500/60 to-transparent" :
                                              "from-transparent via-purple-500/60 to-transparent"
              }`} />

              {/* Banner */}
              <div className="relative h-28 overflow-hidden">
                {s.creator_header_image_url ? (
                  <>
                    <img src={mediaUrl(s.creator_header_image_url)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                  </>
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${tierAccent.glow} to-zinc-950 relative overflow-hidden`}>
                    <div className={`absolute top-2 right-8 h-20 w-20 rounded-full ${tierAccent.dot} opacity-10 blur-2xl`} />
                    <div className={`absolute -bottom-2 left-6 h-14 w-14 rounded-full ${tierAccent.dot} opacity-15 blur-xl`} />
                  </div>
                )}
                {/* Tier badge floating on banner */}
                <div className="absolute top-3 right-4">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold backdrop-blur-sm bg-black/40 ${TIER_STYLE[s.plan_code] || TIER_STYLE.FREE}`}>
                    {TIER_ICON[s.plan_code]} {s.plan_name}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5">
                {/* Avatar + name row — relative z-10 so it paints above the relative banner */}
                <div className="relative z-10 flex items-end gap-4 -mt-8 mb-4">
                  <Avatar src={s.creator_profile_image_url} name={s.creator_display_name} size="h-16 w-16" textSize="text-xl"
                    className={`border-[3px] border-zinc-950 shadow-lg ring-2 ring-offset-2 ring-offset-zinc-950 ${s.plan_code === "FREE" ? "ring-emerald-700/50" : s.plan_code === "EXCLUSIVE" ? "ring-sky-700/50" : "ring-purple-700/50"}`} />
                  <div className="flex-1 min-w-0 pb-1">
                    <h3 className="font-bold text-white text-base truncate">{s.creator_display_name}</h3>
                    <div className="flex gap-3 text-xs text-zinc-500 mt-0.5">
                      <span>{s.creator_subscriber_count} subscribers</span>
                      <span>{s.creator_post_count} posts</span>
                    </div>
                  </div>
                </div>

                {s.creator_bio && (
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{s.creator_bio}</p>
                )}

                {/* Perks */}
                <div className={`rounded-2xl border ${tierAccent.border} bg-zinc-900/60 p-4`}>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">Plan perks</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {(s.perks || []).map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${tierAccent.dot}`} />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quota meters */}
                  {s.exclusive_preview_remaining !== null && s.exclusive_preview_remaining !== undefined && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-500">Exclusive previews</span>
                        <span className="text-sky-400 font-semibold">{s.exclusive_preview_remaining} left this month</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-500"
                          style={{ width: `${s.exclusive_preview_remaining >= 1 ? 100 : 0}%` }} />
                      </div>
                    </div>
                  )}
                  {s.vip_preview_remaining !== null && s.vip_preview_remaining !== undefined && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-500">VIP previews</span>
                        <span className="text-purple-400 font-semibold">{s.vip_preview_remaining} / 3 left</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500"
                          style={{ width: `${Math.round((s.vip_preview_remaining / 3) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Manage panel — plan switcher */}
                {managing === s.subscription_id && confirmCancel !== s.subscription_id && (
                  <div className={`mt-4 rounded-2xl border ${tierAccent.border} bg-zinc-900 p-4`}>
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Switch Plan</div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { code: "FREE",      emoji: "🎁", label: "Free",      sub: "₹0/mo",   activeColor: "border-emerald-700/50 bg-emerald-900/20 text-emerald-300" },
                        { code: "EXCLUSIVE", emoji: "🔓", label: "Exclusive", sub: "₹499/mo", activeColor: "border-sky-700/50 bg-sky-900/20 text-sky-300" },
                        { code: "VIP",       emoji: "💎", label: "VIP",       sub: "₹999/mo", activeColor: "border-purple-700/50 bg-purple-900/20 text-purple-300" },
                      ].map((p) => {
                        const isCurrent = s.plan_code === p.code;
                        const isUpgrade = TIER_ORDER[p.code] > TIER_ORDER[s.plan_code];
                        return (
                          <button
                            key={p.code}
                            disabled={isCurrent || actionLoading}
                            onClick={() => requestPlanChange(s, p.code)}
                            className={`relative rounded-xl border p-3 text-center transition ${
                              isCurrent
                                ? `${p.activeColor} opacity-60 cursor-default`
                                : "border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
                            }`}
                          >
                            {isCurrent && <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white/50" />}
                            <div className="text-lg">{p.emoji}</div>
                            <div className="text-xs font-semibold mt-1">{p.label}</div>
                            <div className="text-[10px] opacity-60 mt-0.5">{p.sub}</div>
                            {isCurrent ? (
                              <div className="text-[9px] mt-1 opacity-50">Current</div>
                            ) : (
                              <div className={`text-[9px] mt-1 font-medium ${isUpgrade ? "text-emerald-400/70" : "text-amber-400/70"}`}>
                                {isUpgrade ? "↑ Upgrade" : "↓ Downgrade"}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setConfirmCancel(s.subscription_id)}
                      className="w-full rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/60 transition"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                )}

                {/* Cancel confirmation */}
                {confirmCancel === s.subscription_id && (
                  <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/20 p-4">
                    <p className="text-sm font-semibold text-red-300 mb-1">Cancel subscription?</p>
                    <p className="text-xs text-zinc-500 mb-4">You'll lose access when the current period ends on{" "}
                      <span className="text-zinc-400">
                        {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setConfirmCancel(null); setManaging(null); }}
                        className="flex-1 rounded-xl border border-zinc-700 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
                      >
                        Keep it
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleCancel(s.subscription_id)}
                        className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
                      >
                        {actionLoading ? "Cancelling..." : "Yes, cancel"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-600">
                    🗓 Renews {s.current_period_end
                      ? new Date(s.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onCreatorClick?.(s.creator_id)}
                      className="rounded-2xl border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 transition">
                      View Profile
                    </button>
                    <button
                      onClick={() => { setManaging(managing === s.subscription_id ? null : s.subscription_id); setConfirmCancel(null); }}
                      className={`rounded-2xl border px-4 py-2 text-xs font-semibold transition ${
                        managing === s.subscription_id
                          ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                          : "border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      {managing === s.subscription_id ? "✕ Close" : "⚙ Manage"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Plan change modal (upgrade = payment, downgrade = confirm) ── */}
      {pendingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[28px] border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">

            {pendingPlan.isUpgrade ? (
              <>
                {/* Payment header */}
                <div className="relative h-28 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #0c1a4a 40%, #1a1040 100%)" }}>
                  <div className="absolute top-4 right-6 h-20 w-20 rounded-full opacity-20 blur-2xl"
                    style={{ background: pendingPlan.planCode === "VIP" ? "#a855f7" : "#38bdf8" }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div className="text-4xl">{pendingPlan.emoji}</div>
                    <div className="text-lg font-bold text-white">{pendingPlan.label} Plan</div>
                    <div className="text-2xl font-black text-white mt-1">{pendingPlan.price}</div>
                    <div className="text-xs text-zinc-400">{pendingPlan.priceNote}</div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-zinc-300 text-center mb-1">
                    Upgrading <span className="text-white font-semibold">{pendingPlan.creatorName}</span>'s subscription
                  </p>
                  <p className="text-xs text-zinc-500 text-center mb-5">
                    From <span className="font-medium">{PLAN_META[pendingPlan.currentPlan]?.label}</span> → <span className="font-medium">{pendingPlan.label}</span>
                  </p>

                  {/* Mock payment details */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 mb-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-zinc-400">{pendingPlan.label} Plan</span>
                      <span className="font-semibold text-white">{pendingPlan.price}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5">
                      <div className="h-8 w-12 rounded-md bg-gradient-to-br from-sky-700 to-blue-800 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200">•••• •••• •••• 4242</div>
                        <div className="text-[10px] text-zinc-500">Visa · Expires 12/27</div>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={actionLoading}
                    onClick={handleChangePlan}
                    className={`w-full rounded-2xl py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
                      pendingPlan.planCode === "VIP"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                        : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500"
                    }`}
                  >
                    {actionLoading ? "Processing..." : `Pay & Upgrade to ${pendingPlan.label}`}
                  </button>
                  <button
                    onClick={() => setPendingPlan(null)}
                    className="w-full mt-2 rounded-2xl py-2.5 text-sm text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Downgrade confirm */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">⚠️</div>
                    <h3 className="text-lg font-bold text-white">Downgrade Plan?</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Switch <span className="text-white font-semibold">{pendingPlan.creatorName}</span> from{" "}
                      <span className="font-semibold">{PLAN_META[pendingPlan.currentPlan]?.label}</span> to{" "}
                      <span className="font-semibold">{pendingPlan.label}</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-800/30 bg-amber-950/20 p-3 mb-5 text-xs text-amber-300/80 text-center">
                    You'll lose access to{" "}
                    {pendingPlan.planCode === "FREE"
                      ? "all Exclusive and VIP content"
                      : "all VIP content"}{" "}
                    immediately.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingPlan(null)}
                      className="flex-1 rounded-2xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition"
                    >
                      Keep current
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={handleChangePlan}
                      className="flex-1 rounded-2xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 transition disabled:opacity-50"
                    >
                      {actionLoading ? "Switching..." : "Yes, downgrade"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Discover Page ────────────────────────────────────────────────────────────
function DiscoverPage({ onCreatorClick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search(q) {
    setLoading(true);
    try {
      const data = await API(`/search/creators?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { search(""); }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Discover Creators</h2>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators..."
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500"
        />
      </div>
      {loading && <div className="py-6 text-center text-zinc-500">Searching...</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map((c) => (
          <button
            key={c.id}
            onClick={() => onCreatorClick?.(c.id)}
            className="flex items-center gap-4 rounded-2xl border border-zinc-900 bg-zinc-950 p-4 text-left hover:border-zinc-700 hover:bg-zinc-900 transition"
          >
            <Avatar src={c.profile_image_url} name={c.display_name} size="h-14 w-14" textSize="text-xl" />
            <div className="min-w-0">
              <div className="font-semibold text-white truncate">{c.display_name}</div>
              <div className="text-sm text-zinc-500 truncate">{c.bio || "Creator"}</div>
              <div className="mt-1 text-xs text-sky-400">{c.subscriber_count} subscribers · {c.post_count} posts</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage({ currentUser, onProfileUpdate }) {
  const [form, setForm] = useState({ display_name: "", bio: "" });
  const [avatarUrl, setAvatarUrl] = useState(null);   // current saved avatar
  const [avatarFile, setAvatarFile] = useState(null); // pending local file
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);   // current saved banner
  const [bannerFile, setBannerFile] = useState(null); // pending local file
  const [bannerPreview, setBannerPreview] = useState(null);
  const role = currentUser?.role === "creator" ? "creator" : "visitor";
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [tab, setTab] = useState("profile");
  const [creatorId, setCreatorId] = useState(null);
  const [planForm, setPlanForm] = useState({
    FREE:      { name: "Free",      description: "", exclusive_preview_quota: 1 },
    EXCLUSIVE: { name: "Exclusive", description: "", price_in_paise: 49900, vip_preview_quota: 3 },
    VIP:       { name: "VIP",       description: "", price_in_paise: 99900 },
  });
  const [plansSaving, setPlansSaving] = useState(false);
  const [plansMsg, setPlansMsg] = useState("");

  useEffect(() => {
    API("/users/me")
      .then((data) => {
        setForm({
          display_name: data.display_name || "",
          bio: data.bio || data.creator?.bio || "",
        });
        const img = data.profile_image_url || data.creator?.profile_image_url || null;
        setAvatarUrl(img);
        setBannerUrl(data.creator?.header_image_url || null);
        if (data.creator?.id) {
          setCreatorId(data.creator.id);
          // Load existing plans to pre-fill the form
          getCreatorSubscriptionPlans(data.creator.id)
            .then((plans) => {
              if (!Array.isArray(plans) || plans.length === 0) return;
              const updates = {};
              plans.forEach((p) => {
                if (p.code === "FREE") updates.FREE = {
                  name: p.name || "Free",
                  description: p.description || "",
                  exclusive_preview_quota: p.exclusive_preview_quota ?? 1,
                };
                if (p.code === "EXCLUSIVE") updates.EXCLUSIVE = {
                  name: p.name || "Exclusive",
                  description: p.description || "",
                  price_in_paise: p.price_in_paise ?? 49900,
                  vip_preview_quota: p.vip_preview_quota ?? 3,
                };
                if (p.code === "VIP") updates.VIP = {
                  name: p.name || "VIP",
                  description: p.description || "",
                  price_in_paise: p.price_in_paise ?? 99900,
                };
              });
              if (Object.keys(updates).length > 0) {
                setPlanForm((prev) => ({ ...prev, ...updates }));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onBannerChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  async function saveProfile() {
    setSaving(true); setMsg("");
    try {
      let profile_image_url = avatarUrl;
      let header_image_url = bannerUrl;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("purpose", "user_profile");
        fd.append("files", avatarFile);
        const up = await api("/uploads", { method: "POST", body: fd });
        profile_image_url = up?.data?.[0]?.object_path || up?.data?.[0]?.url || avatarUrl;
        setAvatarUrl(profile_image_url);
        setAvatarFile(null);
        if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); }
      }

      if (bannerFile) {
        const fd = new FormData();
        fd.append("purpose", "creator_profile");
        fd.append("files", bannerFile);
        const up = await api("/uploads", { method: "POST", body: fd });
        header_image_url = up?.data?.[0]?.object_path || up?.data?.[0]?.url || bannerUrl;
        setBannerUrl(header_image_url);
        setBannerFile(null);
        if (bannerPreview) { URL.revokeObjectURL(bannerPreview); setBannerPreview(null); }
      }

      await API("/users/me", {
        method: "PUT",
        body: JSON.stringify({ ...form, profile_image_url, header_image_url }),
      });
      setMsg("Profile saved ✓");
      onProfileUpdate?.();
    } catch (e) {
      setMsg(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function savePlans() {
    setPlansSaving(true); setPlansMsg("");
    try {
      const plans = [
        {
          code: "FREE",
          name: planForm.FREE.name || "Free",
          description: planForm.FREE.description,
          price_in_paise: 0,
          duration_days: 30,
          currency: "INR",
          active: true,
          unlimited_free_content: true,
          unlimited_exclusive_content: false,
          unlimited_vip_content: false,
          exclusive_preview_quota: Number(planForm.FREE.exclusive_preview_quota) || 1,
          vip_preview_quota: 0,
        },
        {
          code: "EXCLUSIVE",
          name: planForm.EXCLUSIVE.name || "Exclusive",
          description: planForm.EXCLUSIVE.description,
          price_in_paise: Number(planForm.EXCLUSIVE.price_in_paise) || 0,
          duration_days: 30,
          currency: "INR",
          active: true,
          unlimited_free_content: true,
          unlimited_exclusive_content: true,
          unlimited_vip_content: false,
          exclusive_preview_quota: 0,
          vip_preview_quota: Number(planForm.EXCLUSIVE.vip_preview_quota) || 3,
        },
        {
          code: "VIP",
          name: planForm.VIP.name || "VIP",
          description: planForm.VIP.description,
          price_in_paise: Number(planForm.VIP.price_in_paise) || 0,
          duration_days: 30,
          currency: "INR",
          active: true,
          unlimited_free_content: true,
          unlimited_exclusive_content: true,
          unlimited_vip_content: true,
          exclusive_preview_quota: 0,
          vip_preview_quota: 0,
        },
      ];
      await upsertMySubscriptionPlans({ plans });
      setPlansMsg("Plans saved ✓");
    } catch (e) {
      setPlansMsg(e.message || "Failed to save plans");
    } finally {
      setPlansSaving(false);
    }
  }

  async function changePassword() {
    setPwMsg("");
    if (!pwForm.current_password || !pwForm.new_password) {
      setPwMsg("Both fields are required"); return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg("New passwords don't match"); return;
    }
    if (pwForm.new_password.length < 6) {
      setPwMsg("Password must be at least 6 characters"); return;
    }
    setPwSaving(true);
    try {
      await API("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
      });
      setPwMsg("Password changed ✓");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (e) {
      // parse the error detail from the response
      try { setPwMsg(JSON.parse(e.message)?.detail || e.message); }
      catch { setPwMsg(e.message || "Failed"); }
    } finally {
      setPwSaving(false);
    }
  }

  const displayAvatar = avatarPreview || (avatarUrl ? mediaUrl(avatarUrl) : null);

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-xl font-bold text-white">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-0">
        {[
          ["profile", "Profile"],
          ["security", "Password"],
          ...(role === "creator" ? [["plans", "Plans & Pricing"]] : []),
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition -mb-px ${
              tab === key ? "border-sky-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-5">
          {/* Banner upload — creators only */}
          {role === "creator" && (
            <div>
              <p className="text-sm font-medium text-white mb-2">Banner image</p>
              <label className="relative cursor-pointer group block">
                <div className="h-28 w-full rounded-2xl overflow-hidden border-2 border-zinc-700 group-hover:border-sky-500 transition bg-zinc-900">
                  {(bannerPreview || (bannerUrl ? mediaUrl(bannerUrl) : null)) ? (
                    <img src={bannerPreview || mediaUrl(bannerUrl)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-1 text-zinc-600">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Click to upload banner</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <ImagePlus className="h-6 w-6 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={onBannerChange} />
              </label>
              {bannerFile && <p className="text-xs text-sky-400 mt-1">📎 {bannerFile.name} — will upload on save</p>}
            </div>
          )}

          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer group flex-shrink-0">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-sky-500 transition">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-2xl font-bold text-white">
                    {(form.display_name || currentUser?.display_name || "?")[0]}
                  </div>
                )}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <ImagePlus className="h-5 w-5 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
            <div>
              <p className="text-sm font-medium text-white">Profile photo</p>
              <p className="text-xs text-zinc-500 mt-0.5">Click the circle to upload from your device</p>
              {avatarFile && <p className="text-xs text-sky-400 mt-1">📎 {avatarFile.name} — will upload on save</p>}
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Display name</label>
            <input
              value={form.display_name}
              onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
              placeholder="Your name"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell people a little about yourself..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 resize-none transition"
            />
          </div>

          {msg && (
            <p className={`text-sm font-medium ${msg.includes("✓") ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
          )}
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white hover:bg-sky-400 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">Change your account password. You'll need your current password to confirm.</p>

          {[
            { key: "current", label: "Current password", field: "current_password", placeholder: "Enter current password" },
            { key: "new",     label: "New password",     field: "new_password",     placeholder: "At least 6 characters" },
            { key: "confirm", label: "Confirm new password", field: "confirm_password", placeholder: "Repeat new password" },
          ].map(({ key, label, field, placeholder }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">{label}</label>
              <div className="relative">
                <input
                  type={showPw[key] ? "text" : "password"}
                  value={pwForm[field]}
                  onChange={(e) => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-11 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwMsg && (
            <p className={`text-sm font-medium ${pwMsg.includes("✓") ? "text-emerald-400" : "text-red-400"}`}>{pwMsg}</p>
          )}
          <button
            onClick={changePassword}
            disabled={pwSaving}
            className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white hover:bg-sky-400 disabled:opacity-50 transition"
          >
            {pwSaving ? "Updating..." : "Change password"}
          </button>
        </div>
      )}

      {tab === "plans" && role === "creator" && (
        <div className="space-y-5">
          <p className="text-sm text-zinc-400">Configure the subscription tiers fans can choose from. Changes apply immediately.</p>

          {/* FREE tier */}
          {[
            {
              code: "FREE",
              emoji: "🎁",
              label: "Free",
              color: "text-emerald-300",
              border: "border-emerald-700/40",
              bg: "bg-emerald-900/10",
              priceFixed: true,
              fields: [
                { key: "description", label: "Description", placeholder: "What fans get for free…", type: "text" },
                { key: "exclusive_preview_quota", label: "Exclusive previews / month", placeholder: "1", type: "number", min: 0 },
              ],
            },
            {
              code: "EXCLUSIVE",
              emoji: "⭐",
              label: "Exclusive",
              color: "text-sky-300",
              border: "border-sky-700/40",
              bg: "bg-sky-900/10",
              priceFixed: false,
              fields: [
                { key: "description", label: "Description", placeholder: "What fans get with Exclusive…", type: "text" },
                { key: "price_in_paise", label: "Price (₹ / month)", placeholder: "499", type: "number", min: 0, isPaise: true },
                { key: "vip_preview_quota", label: "VIP previews / month", placeholder: "3", type: "number", min: 0 },
              ],
            },
            {
              code: "VIP",
              emoji: "💎",
              label: "VIP",
              color: "text-purple-300",
              border: "border-purple-700/40",
              bg: "bg-purple-900/10",
              priceFixed: false,
              fields: [
                { key: "description", label: "Description", placeholder: "What VIP fans get…", type: "text" },
                { key: "price_in_paise", label: "Price (₹ / month)", placeholder: "999", type: "number", min: 0, isPaise: true },
              ],
            },
          ].map(({ code, emoji, label, color, border, bg, priceFixed, fields }) => (
            <div key={code} className={`rounded-2xl border ${border} ${bg} p-5 space-y-3`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{emoji}</span>
                <span className={`font-bold ${color}`}>{label}</span>
                {priceFixed && <span className="ml-auto text-xs text-zinc-500 font-medium">Always Free</span>}
              </div>
              {fields.map(({ key, label: fLabel, placeholder, type, min, isPaise }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">{fLabel}</label>
                  <input
                    type={type}
                    min={min}
                    placeholder={placeholder}
                    value={isPaise
                      ? (planForm[code][key] > 0 ? Math.round(planForm[code][key] / 100) : "")
                      : (planForm[code][key] ?? "")}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const val = isPaise ? Math.round(Number(raw) * 100) : (type === "number" ? Number(raw) : raw);
                      setPlanForm((prev) => ({ ...prev, [code]: { ...prev[code], [key]: val } }));
                    }}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 transition"
                  />
                  {isPaise && <p className="text-xs text-zinc-600 mt-1">Enter amount in rupees (₹)</p>}
                </div>
              ))}
            </div>
          ))}

          {plansMsg && (
            <p className={`text-sm font-medium ${plansMsg.includes("✓") ? "text-emerald-400" : "text-red-400"}`}>{plansMsg}</p>
          )}
          <button
            onClick={savePlans}
            disabled={plansSaving}
            className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white hover:bg-sky-400 disabled:opacity-50 transition"
          >
            {plansSaving ? "Saving…" : "Save Plans"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Profile Panel ────────────────────────────────────────────────────────────
function ProfilePanel({ currentUser, role, setActive }) {
  const [profile, setProfile] = useState(null);
  const [subs, setSubs] = useState([]);
  const [subTab, setSubTab] = useState("ALL");
  const [posts, setPosts] = useState([]);
  const [postTab, setPostTab] = useState("ALL");

  useEffect(() => {
    API("/users/me").then(setProfile).catch(() => {});
    if (role !== "creator") {
      getMySubscriptions().then((d) => setSubs(Array.isArray(d) ? d : [])).catch(() => {});
    } else {
      getMyPosts().then((d) => {
        const published = (Array.isArray(d?.data) ? d.data : []).filter(p => p.status === "published");
        setPosts(published);
      }).catch(() => {});
    }
  }, [role]);

  const creator = profile?.creator;
  const avatarImg = profile?.profile_image_url || creator?.profile_image_url;
  const bio = profile?.bio || creator?.bio;

  const POST_TABS = [
    { key: "ALL",       label: "All",       emoji: "📸", count: posts.length,                                           color: "text-zinc-300",    border: "border-zinc-700",         bg: "bg-zinc-800" },
    { key: "FREE",      label: "Free",      emoji: "🎁", count: posts.filter(p => p.access_tier === "FREE").length,      color: "text-emerald-300", border: "border-emerald-700/60",   bg: "bg-emerald-900/30" },
    { key: "EXCLUSIVE", label: "Exclusive", emoji: "🔓", count: posts.filter(p => p.access_tier === "EXCLUSIVE").length, color: "text-sky-300",     border: "border-sky-700/60",       bg: "bg-sky-900/30" },
    { key: "VIP",       label: "VIP",       emoji: "💎", count: posts.filter(p => p.access_tier === "VIP").length,       color: "text-purple-300",  border: "border-purple-700/60",    bg: "bg-purple-900/30" },
  ];

  const visiblePosts = postTab === "ALL" ? posts : posts.filter(p => p.access_tier === postTab);

  const SUB_TABS = [
    { key: "ALL",       label: "All",       emoji: "⭐", color: "text-zinc-300",  border: "border-zinc-700",  bg: "bg-zinc-800" },
    { key: "FREE",      label: "Free",      emoji: "🎁", color: "text-emerald-300", border: "border-emerald-700/60", bg: "bg-emerald-900/30" },
    { key: "EXCLUSIVE", label: "Exclusive", emoji: "🔓", color: "text-sky-300",   border: "border-sky-700/60",    bg: "bg-sky-900/30" },
    { key: "VIP",       label: "VIP",       emoji: "💎", color: "text-purple-300", border: "border-purple-700/60", bg: "bg-purple-900/30" },
  ];

  const filteredSubs = subTab === "ALL" ? subs : subs.filter(s => s.plan_code === subTab);

  return (
    <div className="max-w-2xl">
      {/* Banner + Avatar — banner has its own overflow-hidden so avatar isn't clipped */}
      <div className="relative">
        {/* Banner */}
        <div className="h-44 rounded-t-[28px] overflow-hidden">
          {creator?.header_image_url ? (
            <img src={mediaUrl(creator.header_image_url)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #0c1a4a 25%, #0f2460 50%, #1a1040 75%, #0a0a1e 100%)" }}>
              {/* Decorative orbs */}
              <div className="absolute top-4 right-12 h-28 w-28 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />
              <div className="absolute -top-4 left-1/3 h-36 w-36 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
              <div className="absolute bottom-2 left-8 h-20 w-20 rounded-full opacity-25"
                style={{ background: "radial-gradient(circle, #0ea5e9, transparent 70%)" }} />
              <div className="absolute top-6 left-1/2 h-16 w-16 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #c084fc, transparent 70%)" }} />
            </div>
          )}
        </div>
        {/* Avatar — lives outside the overflow-hidden banner */}
        <div className="absolute -bottom-10 left-6 z-10">
          <Avatar src={avatarImg} name={currentUser?.display_name} size="h-20 w-20" textSize="text-2xl" className="border-4 border-zinc-950 shadow-xl" />
        </div>
      </div>

      {/* Profile card */}
      <div className="rounded-b-[28px] border border-t-0 border-zinc-800 bg-zinc-950 px-6 pb-6 pt-12">
        {/* Name row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">{currentUser?.display_name}</h2>
            <p className="text-sm text-zinc-500">{currentUser?.email}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${role === "creator" ? "border-sky-500/40 bg-sky-500/10 text-sky-300" : "border-zinc-700 bg-zinc-900 text-zinc-400"}`}>
              {role === "creator" ? "Creator" : "Fan"}
            </span>
            <button
              onClick={() => setActive("settings")}
              className="rounded-2xl border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900 transition flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />Edit
            </button>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{bio}</p>
        )}

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {role === "creator" ? (
            <>
              {[
                { label: "Posts",       value: creator?.post_count       ?? posts.length, icon: "📸" },
                { label: "Subscribers", value: creator?.subscriber_count ?? 0,            icon: "👥" },
                { label: "Likes",       value: creator?.total_likes      ?? 0,            icon: "❤️" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                  <div className="text-base mb-1">{icon}</div>
                  <div className="text-2xl font-bold text-white">{Number(value).toLocaleString()}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { label: "Subscriptions", value: subs.length, icon: "⭐" },
                { label: "Exclusive",     value: subs.filter(s => s.plan_code === "EXCLUSIVE").length, icon: "🔓" },
                { label: "VIP",           value: subs.filter(s => s.plan_code === "VIP").length,       icon: "💎" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                  <div className="text-base mb-1">{icon}</div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Creator: tier tabs + post grid */}
        {role === "creator" && (
          <div className="mt-6">
            {/* Tier tab buttons — each shows count */}
            <div className="flex gap-2 flex-wrap mb-4">
              {POST_TABS.map((t) => {
                const active = postTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setPostTab(t.key)}
                    className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
                      active ? `${t.border} ${t.bg} ${t.color}` : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/15" : "bg-zinc-800"}`}>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Post grid */}
            {visiblePosts.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-10 text-center">
                <ImagePlus className="h-7 w-7 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No {postTab === "ALL" ? "" : postTab.toLowerCase() + " "}posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {visiblePosts.map((post) => {
                  const m = post.media?.[0];
                  const cover = m ? mediaUrl(m.object_path || m.thumbnail_object_path || "") : null;
                  const TIER = { FREE: "🎁", EXCLUSIVE: "🔓", VIP: "💎" };
                  return (
                    <div key={post.post_id} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 group">
                      {cover ? (
                        <img src={cover} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-700">
                          <ImagePlus className="h-6 w-6" />
                        </div>
                      )}
                      {/* Tier badge */}
                      <div className="absolute top-1.5 right-1.5 rounded-lg bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {TIER[post.access_tier] || "🎁"}
                      </div>
                      {/* Like count on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white text-sm font-semibold">
                        <Heart className="h-4 w-4" /> {post.like_count || 0}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Visitor: tabbed subscription list */}
        {role !== "creator" && (
          <div className="mt-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {SUB_TABS.map((t) => {
                const count = t.key === "ALL" ? subs.length : subs.filter(s => s.plan_code === t.key).length;
                const active = subTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setSubTab(t.key)}
                    className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
                      active ? `${t.border} ${t.bg} ${t.color}` : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/10" : "bg-zinc-800"}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Creator cards */}
            {filteredSubs.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                <p className="text-sm text-zinc-500">No {subTab === "ALL" ? "" : subTab.toLowerCase()} subscriptions yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredSubs.map((s) => {
                  const tierCfg = TIER_CONFIG[s.plan_code] || TIER_CONFIG.FREE;
                  return (
                    <div key={s.subscription_id} className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                      <Avatar src={s.creator_profile_image_url} name={s.creator_display_name} size="h-11 w-11" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">{s.creator_display_name}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Renews {new Date(s.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold flex-shrink-0 ${tierCfg.border} ${tierCfg.bg} ${tierCfg.color}`}>
                        {tierCfg.emoji} {s.plan_code}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Billing Page ─────────────────────────────────────────────────────────────
function BillingPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Payment Methods</h2>
      <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white">Saved cards</h3>
          <button className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400">+ Add card</button>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4">
          <div className="h-10 w-16 rounded-lg bg-gradient-to-br from-sky-600 to-blue-700 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-white">•••• •••• •••• 4242</div>
            <div className="text-sm text-zinc-500">Expires 12/27</div>
          </div>
          <div className="ml-auto">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">Default</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-600">Payments are processed securely. Card details are never stored on our servers.</p>
      </div>
    </div>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
function RightRail({ role, onCreatorClick, profileVersion }) {
  const [suggestions, setSuggestions] = useState([]);

  function loadSuggestions() {
    API("/search/creators?q=")
      .then((data) => setSuggestions((data || []).slice(0, 5)))
      .catch(() => {});
  }

  useEffect(() => { loadSuggestions(); }, []);
  useEffect(() => { if (profileVersion > 0) loadSuggestions(); }, [profileVersion]);

  return (
    <aside className="hidden xl:block w-80 flex-shrink-0 border-l border-zinc-900 px-4 py-6 space-y-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          readOnly
          placeholder="Search creators..."
          className="w-full cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-zinc-500 outline-none"
        />
      </div>
      {/* Suggested Creators */}
      {suggestions.length > 0 && (
        <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-5">
          <h3 className="mb-4 font-semibold text-white">Suggested Creators</h3>
          <div className="space-y-4">
            {suggestions.map((c) => (
              <button
                key={c.id}
                onClick={() => onCreatorClick?.(c.id)}
                className="flex w-full items-center gap-3 text-left hover:opacity-80 transition"
              >
                <Avatar src={c.profile_image_url} name={c.display_name} size="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{c.display_name}</div>
                  <div className="text-xs text-zinc-500">{c.subscriber_count} subscribers · {c.post_count} posts</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onCreatorClick?.(c.id); }}
                  className="flex-shrink-0 rounded-2xl bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs font-medium text-sky-400 hover:bg-sky-500/20 transition"
                >
                  View
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending topics / quick stats */}
      <div className="rounded-[28px] border border-zinc-900 bg-zinc-950 p-5">
        <h3 className="mb-4 font-semibold text-white">Trending Now</h3>
        <div className="space-y-3">
          {[
            { tag: "Exclusive Content", count: "2.4k posts" },
            { tag: "New Creators", count: "148 this week" },
            { tag: "VIP Access", count: "890 posts" },
            { tag: "Behind the Scenes", count: "1.1k posts" },
          ].map(({ tag, count }) => (
            <div key={tag} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">#{tag.replace(/ /g, "")}</div>
                <div className="text-xs text-zinc-600">{count}</div>
              </div>
              <TrendingUp className="h-4 w-4 text-sky-500/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-zinc-700 space-y-1 pb-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["Terms", "Privacy", "Help", "Cookies"].map((t) => (
            <span key={t} className="cursor-pointer hover:text-zinc-500">{t}</span>
          ))}
        </div>
        <p>© 2026 FansOnly</p>
      </div>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ role, setMobileOpen, currentUser, onLogout, setActive, unreadCount }) {
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-900 bg-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4">
        <button onClick={() => setMobileOpen((v) => !v)} className="mr-3 text-zinc-400 lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
          <span className="text-sky-400">Fans</span>Only
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActive("notifications")}
            className="relative rounded-2xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button onClick={() => setDropOpen((v) => !v)} className="flex items-center gap-2 rounded-2xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900">
              <Avatar src={currentUser?.profile_image_url} name={currentUser?.display_name || "U"} size="h-7 w-7" textSize="text-xs" />
              <span className="hidden sm:block text-zinc-200">{currentUser?.display_name || "User"}</span>
            </button>
            {dropOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl">
                <button onClick={() => { setActive("profile"); setDropOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900">
                  <User className="h-4 w-4" /> Profile
                </button>
                <button onClick={() => { setActive("settings"); setDropOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <div className="my-1 border-t border-zinc-800" />
                <button onClick={onLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-900">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
function LeftSidebar({ role, active, setActive, mobileOpen, setMobileOpen, onLogout }) {
  const items = [
    { key: "home",          label: "Home",        icon: Home },
    { key: "discover",      label: "Discover",    icon: Compass },
    ...(role === "creator" ? [{ key: "posts", label: "My Posts", icon: Grid3X3 }] : []),
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "messages",      label: "Messages",    icon: MessageCircle },
    ...(role !== "creator" ? [{ key: "collections", label: "Collections", icon: Bookmark }] : []),
    { key: "subscriptions", label: "Subscriptions", icon: CreditCard },
    ...(role !== "creator" ? [{ key: "billing", label: "Billing", icon: Wallet }] : []),
    { key: "profile",       label: "My Profile",  icon: User },
    { key: "settings",      label: "Settings",    icon: Settings },
  ];

  function nav(key) { setActive(key); setMobileOpen(false); }

  const sidebar = (
    <div className="flex h-full flex-col py-6 px-3">
      <nav className="flex-1 space-y-1">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => nav(key)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              active === key ? "bg-sky-500/10 text-sky-400" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
        {role === "creator" && (
          <button
            onClick={() => nav("posts")}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-400 transition"
          >
            <PlusCircle className="h-5 w-5" /> New post
          </button>
        )}
      </nav>
      <button
        onClick={onLogout}
        className="mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-500 hover:bg-zinc-900 hover:text-red-400 transition"
      >
        <LogOut className="h-5 w-5" /> Log out
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-zinc-900 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {sidebar}
      </aside>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-zinc-900 bg-zinc-950">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 text-zinc-500">
              <X className="h-6 w-6" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
    </>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function MainContent({ role, active, setActive, currentUser, onProfileUpdate, onCreatorClick, profileVersion, pendingCreatorId, onPendingHandled, onMessageCreator }) {
  const [creatorModal, setCreatorModal] = useState(null);
  const [subscribeModal, setSubscribeModal] = useState(null);
  const [feedVersion, setFeedVersion] = useState(0);
  // Track visited tabs so we keep them mounted (preserving state/data) once loaded
  const [visited, setVisited] = useState(() => new Set(["home"]));
  useEffect(() => {
    setVisited((prev) => { if (prev.has(active)) return prev; const n = new Set(prev); n.add(active); return n; });
  }, [active]);

  function openCreator(id) { setCreatorModal(id); if (onCreatorClick) onCreatorClick(id); }

  function handleMessageCreator(creatorId) {
    setCreatorModal(null);
    onMessageCreator?.(creatorId);
  }

  return (
    <>
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
        <div className={`max-w-xl mx-auto xl:mx-0 xl:max-w-2xl${active !== "home" ? " hidden" : ""}`}>
          <Feed role={role} profileVersion={profileVersion} feedVersion={feedVersion} isActive={active === "home"} onMessage={role !== "creator" ? handleMessageCreator : undefined} />
        </div>
        {visited.has("discover") && <div className={active !== "discover" ? "hidden" : ""}><DiscoverPage onCreatorClick={openCreator} /></div>}
        {role === "creator" && visited.has("posts") && <div className={active !== "posts" ? "hidden" : ""}><PostsPage onPostPublished={() => setFeedVersion((v) => v + 1)} /></div>}
        {visited.has("notifications") && <div className={active !== "notifications" ? "hidden" : ""}><NotificationsPage /></div>}
        {visited.has("messages") && <div className={active !== "messages" ? "hidden" : ""}><MessagesPage currentUser={currentUser} pendingCreatorId={active === "messages" ? pendingCreatorId : null} onPendingHandled={onPendingHandled} /></div>}
        {visited.has("collections") && <div className={active !== "collections" ? "hidden" : ""}><CollectionsPage /></div>}
        {visited.has("subscriptions") && (
          <div className={active !== "subscriptions" ? "hidden" : ""}>
            <SubscriptionsPage
              role={role}
              onCreatorClick={openCreator}
              onSubscribe={(id, name) => setSubscribeModal({ id, name })}
              setActive={setActive}
            />
          </div>
        )}
        {visited.has("billing") && <div className={active !== "billing" ? "hidden" : ""}><BillingPage /></div>}
        {visited.has("profile") && (
          <div className={active !== "profile" ? "hidden" : ""}>
            <ProfilePanel currentUser={currentUser} role={role} setActive={setActive} />
          </div>
        )}
        {visited.has("settings") && (
          <div className={active !== "settings" ? "hidden" : ""}>
            <SettingsPage currentUser={currentUser} onProfileUpdate={onProfileUpdate} />
          </div>
        )}
      </main>
      {creatorModal && (
        <CreatorProfileModal
          creatorId={creatorModal}
          onClose={() => setCreatorModal(null)}
          onSubscribe={(id, name) => { setCreatorModal(null); setSubscribeModal({ id, name }); }}
          onMessage={role !== "creator" ? handleMessageCreator : undefined}
        />
      )}
      {subscribeModal && (
        <SubscribeModal
          creatorId={subscribeModal.id}
          creatorName={subscribeModal.name}
          onClose={() => setSubscribeModal(null)}
        />
      )}
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function UserDashboard({ currentUser, onLogout, onProfileUpdate }) {
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileVersion, setProfileVersion] = useState(0);

  const role = currentUser?.role === "creator" ? "creator" : "visitor";
  const [sharedCreatorModal, setSharedCreatorModal] = useState(null);
  const [sharedSubscribeModal, setSharedSubscribeModal] = useState(null);
  const [pendingMessageCreatorId, setPendingMessageCreatorId] = useState(null);

  function handleMessageCreator(creatorId) {
    setSharedCreatorModal(null);
    setActive("messages");
    setPendingMessageCreatorId(creatorId);
  }

  function handleProfileUpdate() {
    onProfileUpdate?.();
    setProfileVersion((v) => v + 1); // triggers Feed + RightRail to re-fetch
  }

  useEffect(() => {
    API("/notifications/unread-count")
      .then((d) => setUnreadCount(d.count || 0))
      .catch(() => {});
    const t = setInterval(() => {
      API("/notifications/unread-count")
        .then((d) => setUnreadCount(d.count || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar
        role={role}
        setMobileOpen={setMobileOpen}
        currentUser={currentUser}
        onLogout={onLogout}
        setActive={setActive}
        unreadCount={unreadCount}
      />
      <div className="mx-auto flex max-w-[1600px]">
        <LeftSidebar
          role={role}
          active={active}
          setActive={setActive}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onLogout={onLogout}
        />
        <MainContent
          role={role}
          active={active}
          setActive={setActive}
          currentUser={currentUser}
          onProfileUpdate={handleProfileUpdate}
          onCreatorClick={setSharedCreatorModal}
          profileVersion={profileVersion}
          pendingCreatorId={pendingMessageCreatorId}
          onPendingHandled={() => setPendingMessageCreatorId(null)}
          onMessageCreator={role !== "creator" ? handleMessageCreator : undefined}
        />
        <RightRail
          role={role}
          onCreatorClick={setSharedCreatorModal}
          profileVersion={profileVersion}
        />
        {sharedCreatorModal && (
          <CreatorProfileModal
            creatorId={sharedCreatorModal}
            onClose={() => setSharedCreatorModal(null)}
            onSubscribe={(id, name) => { setSharedCreatorModal(null); setSharedSubscribeModal({ id, name }); }}
            onMessage={role !== "creator" ? handleMessageCreator : undefined}
          />
        )}
        {sharedSubscribeModal && (
          <SubscribeModal
            creatorId={sharedSubscribeModal.id}
            creatorName={sharedSubscribeModal.name}
            onClose={() => setSharedSubscribeModal(null)}
          />
        )}
      </div>
    </div>
  );
}

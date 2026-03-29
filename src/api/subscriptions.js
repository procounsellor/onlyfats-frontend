import { api } from "./client";

export const getCreatorSubscriptionPlans = (creatorId) =>
  api(`/creators/${creatorId}/subscription-plans`, { method: "GET" });

export const upsertMySubscriptionPlans = (payload) =>
  api("/creators/me/subscription-plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const subscribeToCreator = (creatorId, payload) =>
  api(`/creators/${creatorId}/subscriptions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMyCreatorSubscription = (creatorId) =>
  api(`/creators/${creatorId}/subscriptions/me`, { method: "GET" });

export const checkPostAccess = (postId) =>
  api(`/posts/${postId}/access`, { method: "GET" });

export const unlockPost = (postId, payload) =>
  api(`/posts/${postId}/unlock`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMySubscriptions = () =>
  api("/subscriptions/me", { method: "GET" });

export const cancelSubscription = (subscriptionId) =>
  api(`/subscriptions/${subscriptionId}/cancel`, { method: "POST" });

export const changeSubscriptionPlan = (subscriptionId, planCode) =>
  api(`/subscriptions/${subscriptionId}/change-plan`, {
    method: "POST",
    body: JSON.stringify({ plan_code: planCode }),
  });

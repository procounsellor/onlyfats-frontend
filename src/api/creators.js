import { api } from "./client";

// Creator Profile
export const getMyCreatorProfile = () =>
  api("/creators/me", { method: "GET" });

export const upsertMyCreatorProfile = (payload) =>
  api("/creators/me", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Creator Posts
export const createCreatorPost = (payload) =>
  api("/creator/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const addPostMedia = (postId, payload) =>
  api(`/creator/posts/${postId}/media`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const publishCreatorPost = (postId) =>
  api(`/creator/posts/${postId}/publish`, { method: "POST" });

export const getCreatorPosts = (creatorId) =>
  api(`/creators/${creatorId}/posts`, { method: "GET" });

export const getMyPosts = () =>
  api("/creator/posts/me", { method: "GET" });

export const updateCreatorPost = (postId, payload) =>
  api(`/creator/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteCreatorPost = (postId) =>
  api(`/creator/posts/${postId}`, { method: "DELETE" });

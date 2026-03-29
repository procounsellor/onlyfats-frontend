import { api } from "./client";

export const getFeed = () =>
  api("/posts/feed", { method: "GET" });

export const getPostDetails = (postId) =>
  api(`/posts/${postId}`, { method: "GET" });

import { api } from "./client";

export const signupApi = (payload) =>
  api("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginApi = (payload) =>
  api("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const guestLoginApi = (payload) =>
  api("/auth/guest", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const refreshApi = (payload) =>
  api("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const logoutApi = (payload) =>
  api("/auth/logout", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const meApi = () =>
  api("/auth/me", {
    method: "GET",
  });
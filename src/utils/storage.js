export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem("access_token");
  },
  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  },
  setTokens(data) {
    if (data?.access_token) localStorage.setItem("access_token", data.access_token);
    if (data?.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  },
  clear() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
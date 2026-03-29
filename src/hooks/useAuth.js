import { useEffect, useState } from "react";
import { loginApi, signupApi, guestLoginApi, logoutApi, meApi } from "../api/auth";
import { tokenStorage } from "../utils/storage";

export default function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const loadMe = async () => {
    try {
      const me = await meApi();
      setCurrentUser(me);
    } catch (error) {
      tokenStorage.clear();
      setCurrentUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = async (payload) => {
    const data = await loginApi(payload);
    tokenStorage.setTokens(data);
    await loadMe();
  };

  const signup = async (payload) => {
    const data = await signupApi(payload);
    tokenStorage.setTokens(data);
    await loadMe();
  };

  const guestLogin = async (payload) => {
    const data = await guestLoginApi(payload);
    tokenStorage.setTokens(data);
    await loadMe();
  };

  const logout = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await logoutApi({ refresh_token: refreshToken });
      }
    } catch (error) {
      // ignore backend logout failures
    } finally {
      tokenStorage.clear();
      setCurrentUser(null);
    }
  };

  return {
    currentUser,
    checkingAuth,
    loadMe,
    login,
    signup,
    guestLogin,
    logout,
  };
}
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const AUTH_STORAGE_KEY = "gm_admin_auth_v1";
const STORAGE_KEY = AUTH_STORAGE_KEY;

/**
 * localStorage'daki en güncel refresh token'ı döner. Refresh rotation'da
 * (her refresh eskisini geçersiz kılar) hangi sekme en son yenilediyse
 * güncel token orada olur; Redux state'i sekmeye özel ve bayat kalabilir.
 */
export function readStoredRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return parsed.refreshToken ?? null;
  } catch {
    return null;
  }
}

export interface AdminProfile {
  id?: string;
  email?: string;
  fullName?: string;
  profileImageUrl?: string | null;
}

export interface AuthState {
  token: string | null;
  tokenExpiration: string | null;
  refreshToken: string | null;
  refreshTokenExpires: string | null;
  admin: AdminProfile | null;
}

function loadInitialState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      token: parsed.token ?? null,
      tokenExpiration: parsed.tokenExpiration ?? null,
      refreshToken: parsed.refreshToken ?? null,
      refreshTokenExpires: parsed.refreshTokenExpires ?? null,
      admin: parsed.admin ?? null,
    };
  } catch {
    return emptyState();
  }
}

function emptyState(): AuthState {
  return {
    token: null,
    tokenExpiration: null,
    refreshToken: null,
    refreshTokenExpires: null,
    admin: null,
  };
}

function persist(state: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — sessizce yut */
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    loggedIn(
      state,
      action: PayloadAction<{
        token: string;
        tokenExpiration: string;
        refreshToken: string;
        refreshTokenExpires: string;
        admin?: AdminProfile | null;
      }>,
    ) {
      state.token = action.payload.token;
      state.tokenExpiration = action.payload.tokenExpiration;
      state.refreshToken = action.payload.refreshToken;
      state.refreshTokenExpires = action.payload.refreshTokenExpires;
      if (action.payload.admin !== undefined) state.admin = action.payload.admin;
      persist(state);
    },
    tokenRefreshed(
      state,
      action: PayloadAction<{
        token: string;
        tokenExpiration: string;
        refreshToken: string;
        refreshTokenExpires: string;
        admin?: AdminProfile | null;
      }>,
    ) {
      state.token = action.payload.token;
      state.tokenExpiration = action.payload.tokenExpiration;
      state.refreshToken = action.payload.refreshToken;
      state.refreshTokenExpires = action.payload.refreshTokenExpires;
      if (action.payload.admin !== undefined) {
        state.admin = action.payload.admin;
      }
      persist(state);
    },
    /**
     * Başka bir sekme localStorage'ı güncellediğinde (refresh/logout) bu
     * sekmenin Redux state'ini senkronlar. Böylece bayat (rotate edilmiş)
     * refresh token kullanılıp gereksiz yere login'e atılması engellenir.
     */
    hydrateFromStorage(state) {
      const next = loadInitialState();
      state.token = next.token;
      state.tokenExpiration = next.tokenExpiration;
      state.refreshToken = next.refreshToken;
      state.refreshTokenExpires = next.refreshTokenExpires;
      state.admin = next.admin;
    },
    setAdminProfile(state, action: PayloadAction<AdminProfile | null>) {
      state.admin = action.payload;
      persist(state);
    },
    logout(state) {
      state.token = null;
      state.tokenExpiration = null;
      state.refreshToken = null;
      state.refreshTokenExpires = null;
      state.admin = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* yut */
      }
    },
  },
});

export const {
  loggedIn,
  tokenRefreshed,
  hydrateFromStorage,
  setAdminProfile,
  logout,
} = authSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.token);
export const selectAdminProfile = (state: { auth: AuthState }) =>
  state.auth.admin;

export default authSlice.reducer;

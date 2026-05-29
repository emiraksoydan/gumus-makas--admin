import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer, {
  AUTH_STORAGE_KEY,
  hydrateFromStorage,
} from "../features/auth/authSlice";
import { baseApi } from "./baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

// Sekmeler arası auth senkronizasyonu: bir sekme refresh token'ı rotate
// ettiğinde veya çıkış yaptığında diğer sekmeler de güncel state'i alır.
// Aksi halde bayat refresh token ile 401 alıp gereksiz login'e atılır.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === AUTH_STORAGE_KEY) {
      store.dispatch(hydrateFromStorage());
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

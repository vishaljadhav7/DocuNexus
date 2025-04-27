'use client'

import { useRef } from "react";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from '@/features/auth/authSlice';
import contractReducer from '@/features/contracts/contractSlice';
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  Provider,
} from "react-redux";
import { authApi } from "@/features/auth/authApi";
import { contractApi } from "@/features/contracts/contractApi";
import { setupListeners } from "@reduxjs/toolkit/query";
import { chatApi } from "@/features/chats/chatApi";


/* REDUX STORE */
export const makeStore = () => {
  return configureStore({
    reducer: {
      user : userReducer,
      contract : contractReducer,
      [contractApi.reducerPath] : contractApi.reducer,
      [authApi.reducerPath] : authApi.reducer,
      [chatApi.reducerPath] : chatApi.reducer
    },
    middleware : (getDefaultMiddleware) => 
      getDefaultMiddleware().concat(authApi.middleware).concat(contractApi.middleware).concat(chatApi.middleware),
})};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  return (
    <Provider store={storeRef.current}>
        {children}
    </Provider>
  );
}
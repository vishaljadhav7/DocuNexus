'use client'

import { useRef } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from '@/features/auth/authSlice';
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  Provider,
} from "react-redux";

import { setupListeners } from "@reduxjs/toolkit/query";

// import {
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from "redux-persist";

// const rootReducer = combineReducers({
//   global: globalReducer,
//   data : dataReducer,
//   [api.reducerPath]: api.reducer,
// });



/* REDUX STORE */
export const makeStore = () => {
  return configureStore({
    reducer: {
      user : userReducer,
    },
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
'use client'

import { useGetCurrentUserQuery } from '../features/auth/authApi';
import { useAppDispatch } from '@/redux/store';
import { addUser } from '@/features/auth/authSlice';
import { useEffect } from 'react';

export const useCurrentUser = () => {
  const dispatch = useAppDispatch();
  
  const {
    data,
    isLoading,
    isError,
  }  =  useGetCurrentUserQuery();

  useEffect(()=>{
    if(!isLoading && !isError){
      dispatch(addUser(data))
    }
  }, [data, dispatch])

  return { isLoading, isError, data};
};
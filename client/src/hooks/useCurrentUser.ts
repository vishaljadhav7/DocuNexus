'use client';

import { useGetCurrentUserQuery} from '../features/auth/authApi';
import { useAppDispatch } from '@/redux/store';
import { addUser, User as AuthSliceUser } from '@/features/auth/authSlice'; 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const URL = "https://plus.unsplash.com/premium_photo-1738677617432-e3bfaad291c1?q=40&w=500"

export const useCurrentUser = () => {
  const dispatch = useAppDispatch();
  const router = useRouter()
  
  const {
    data: apiUser, 
    isLoading,
    isError,
  } = useGetCurrentUserQuery();


  useEffect(() => {
    if (!isLoading && !isError && apiUser) {
    
      const transformedUser: AuthSliceUser = {
        ...apiUser,
        profilePic: apiUser?.profilePic  || URL, 
        userContractReviews: apiUser?.contractReviews, 
      };
      dispatch(addUser(transformedUser));
      router.push("/dashboard")
    }
  }, [apiUser, dispatch, isLoading, isError, router]);

  return { isLoading, isError, data: apiUser };
};
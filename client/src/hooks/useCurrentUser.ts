'use client';

import { useGetCurrentUserQuery} from '../features/auth/authApi';
import { useAppDispatch } from '@/redux/store';
import { addUser, User as AuthSliceUser } from '@/features/auth/authSlice'; // Rename to avoid conflict
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
        profilePic: apiUser?.profilePic  || 'default-profile-pic-url', 
        userContractReviews: apiUser?.contractReviews, 
      };
      dispatch(addUser(transformedUser));
      router.push("/dashboard")
    }
  }, [apiUser, dispatch, isLoading, isError, router]);

  return { isLoading, isError, data: apiUser };
};
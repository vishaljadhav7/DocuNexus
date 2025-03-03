import { useGetCurrentUserQuery } from '../features/auth/authApi';
import { useAppDispatch } from '@/redux/store';
import { addUser } from '@/features/auth/authSlice';

export const useCurrentUser = () => {
  const dispatch = useAppDispatch();
  
  const {
    data,
    isLoading,
    isError,
  } =  useGetCurrentUserQuery();

  console.log("useCurrentUser hook  ->>>> ", data)

  if(!isLoading && !isError){
    dispatch(addUser(data))
  }

  return { isLoading, isError};
};
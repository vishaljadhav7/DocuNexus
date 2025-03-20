'use client';

import { useCurrentUser } from "@/hooks/useCurrentUser";

import UserContracts from "@/components/Dashboard/Contracts";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Dashboard() {

  const {isError, isLoading} = useCurrentUser();

  if(isLoading){
    return <LoadingSpinner/>
  }

  if(isError){
    return <h2>Error</h2>
  }

  return (
    <div>
      <UserContracts/>    
    </div>
  )
}
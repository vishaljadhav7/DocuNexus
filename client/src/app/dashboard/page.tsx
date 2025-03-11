'use client';

import { useCurrentUser } from "@/hooks/useCurrentUser";

import UserContracts from "@/components/Dashboard/Contracts";

export default function Dashboard() {

  const {isError, isLoading} = useCurrentUser();

  if(isLoading){
    return <h2>Loading.....</h2>
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
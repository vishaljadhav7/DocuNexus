'use client';
import { useState} from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {UploadModal} from '@/components/Modals/UploadModal/index'
import UserContracts from "@/components/Dashboard/Contracts";

export default function Dashboard() {

  const {isError, isLoading} = useCurrentUser();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  if(isLoading){
    return <h2>Loading.....</h2>
  }

  if(isError){
    return <h2>Error</h2>
  }

  return (
    <div>
      <UserContracts/>
     <UploadModal 
     isOpen={isUploadModalOpen} 
     onClose={() => setIsUploadModalOpen(false) }
     onOpenModal = {() => setIsUploadModalOpen(true)}
     onUploadComplete = {()=>{}}
     />    
    
    </div>
  )
}
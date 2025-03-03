'use client';
import { useEffect , useState} from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {UploadModal} from '@/components/Modals/UploadModal/index'

export default function Dashboard() {

  const {isError, isLoading} = useCurrentUser();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(true);
  if(isLoading){
    return <h2>Loading.....</h2>
  }

  if(isError){
    return <h2>Error</h2>
  }

  return (
    <div>
     <UploadModal 
     isOpen={isUploadModalOpen} 
     onClose={() => setIsUploadModalOpen(false)}
     onUploadComplete = {()=>{}}
     />
       
    </div>
  )
}
'use client';

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Loader2, LockIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { openModal } from "@/features/modal/modalSlice";

export default function AuthLayout({ children }: { children: React.  ReactNode }){
  
   const { isLoading , isError, data}  = useCurrentUser();

   if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center justify-center">
          <Loader2 className="size-4 mr-2 animate-spin" />
        </div>
      </div>
    );
  }

  if(!data || isError){
    return (
        <div className="flex items-center justify-center h-screen">
          <AuthCard />
        </div>
    );
  }

  return <>{children}</>;
}

export function AuthCard() {
    
 return (
   <>
    <Card className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 bg-primary/10 flex items-center justify-center p-4">
          <LockIcon className="size-16 text-primary" />
        </div>
       
        <div className="sm:w-3/4 p-4">
          <CardHeader className="space-y-1 px-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              Authentication required
             </CardTitle>
             <CardDescription>
              You need to be logged in to access this page.
            </CardDescription>
          </CardHeader> 
          <CardContent className="px-0 py-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => openModal("connectAccountModal")}
                className="flex-1"
                variant={"outline"}
              >
                Continue with Google
              </Button>

              <Link href={"/"} className="flex-1">
                <Button className="w-full">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </div>
      </div> 
    </Card>
   </>
 );
}
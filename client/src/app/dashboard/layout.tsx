import React from "react";
import AuthLayout from "@/components/Dashboard/AuthLayout";
import DashboardLayout from "@/components/Dashboard/SideMenu";

export default function Layout ({children}: {children : React.ReactNode}) {
  
   return (
     <>
     <AuthLayout>
       <DashboardLayout>
         <main className="flex-1 overflow-x-hidden bg-white overflow-y-auto p-6">
           {children}
         </main>
       </DashboardLayout>
      </AuthLayout>
     </>
   ) 
}
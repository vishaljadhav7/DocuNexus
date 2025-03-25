"use client";

import Link from "next/link";

import { Button } from "../ui/button";
import {  useAppSelector } from "@/redux/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


export function Header() {
  const { isAuthenticated } = useAppSelector((store) => store.user);
  const router = useRouter();


  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [router, isAuthenticated]);


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-700 transition-all">
            DocuNexus
          </span>
        </Link>

      
        <div className="flex items-center gap-8">

          {/* Sign In Button */}
          <Link 
          href={"/signin"}
          >          
          <Button
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium px-6 rounded-full transform hover:scale-105 transition-all shadow-md"
          >
            Sign In
          </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
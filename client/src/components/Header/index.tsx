"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {  useAppSelector } from "@/redux/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Pricing", href: "/pricing" },
];

export function Header() {
  const { isAuthenticated } = useAppSelector((store) => store.user);
  const router = useRouter();
  const pathname = usePathname();

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

        {/* Navigation */}
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium relative py-1",
                  "hover:text-indigo-600 transition-colors",
                  pathname === item.href
                    ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-600"
                    : "text-gray-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

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
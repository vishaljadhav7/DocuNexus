"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Loader2, LockIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isError, data } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center justify-center">
          <Loader2 className="size-6 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <AuthCard />
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthCard() {
  return (
    <Card className="w-full max-w-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 bg-teal-50 flex items-center justify-center p-6">
          <LockIcon className="size-12 text-teal-600" />
        </div>

        <div className="sm:w-3/4 p-6">
          <CardHeader className="space-y-1 px-0 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              You need to be logged in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
              
                variant="outline"
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-teal-600"
              >
                Continue with Google
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
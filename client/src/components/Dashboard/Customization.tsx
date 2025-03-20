"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, User, Mail, Crown, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/store";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Customization() {
  const userInfo = useAppSelector((store) => store.user.userInfo);
 
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Account Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your personal info and subscription</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  <User className="h-4 w-4 mr-2 text-teal-600" />
                  Personal Information
                </CardTitle>
                {userInfo?.isPremium && (
                  <Badge className="bg-amber-400 text-gray-800 px-2 py-1 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <CardDescription className="text-gray-600 text-sm">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-medium">
                    {userInfo?.userName?.charAt(0) || "U"}
                  </div>
                  {userInfo?.isPremium && (
                    <Crown className="absolute bottom-0 right-0 h-5 w-5 text-amber-400" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600 flex items-center">
                    <User className="h-4 w-4 mr-1 text-teal-600" />
                    Full Name
                  </Label>
                  <Input
                    value={userInfo?.userName}
                    readOnly
                    className="mt-1 bg-gray-50 border-gray-200 focus:border-teal-600 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-teal-600" />
                    Email Address
                  </Label>
                  <Input
                    value={userInfo?.emailId}
                    readOnly
                    className="mt-1 bg-gray-50 border-gray-200 focus:border-teal-600 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm text-gray-600 flex items-start">
                <Shield className="h-4 w-4 text-teal-600 mr-2 mt-0.5" />
                Update your info via your Google account.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium Card (Non-Premium Users Only) */}
        {!userInfo?.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50 py-4">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  <Crown className="h-4 w-4 mr-2 text-amber-400" />
                  Unlock Premium
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">Upgrade for more features</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">Lifetime Premium</h3>
                    <p className="text-sm text-gray-600">$99.99 - One-time payment</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">Unlimited Contract Analysis</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-teal-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">Priority Processing</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-teal-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">Advanced AI Features</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-5 bg-gray-50 border-t border-gray-100">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10">
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
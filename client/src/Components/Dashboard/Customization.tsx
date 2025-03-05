"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Check, User, Mail, Crown,  Zap, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/redux/store"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export default function Customization() {
  const userInfo = useAppSelector((store) => store.user.userInfo)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-gray-500 mt-2">Manage your personal information and subscription</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-bl-full -z-10"></div>
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </div>
                {userInfo?.isPremium && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-none px-3">
                    <Crown className="h-3.5 w-3.5 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {userInfo?.userName?.charAt(0) || "U"}
                  </div>
                  {userInfo?.isPremium && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1.5 border-2 border-white">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-600" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      value={userInfo?.userName}
                      id="name"
                      readOnly
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-3 w-3 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-purple-600" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      value={userInfo?.emailId}
                      id="email"
                      readOnly
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                        <Mail className="h-3 w-3 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Your account is managed through Google. If you want to change your email or personal information,
                    please update it through your Google account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {!userInfo?.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className="relative overflow-hidden border-none shadow-xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5"></div>

              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 relative z-10">
                <div className="flex items-center">
                  <Crown className="h-6 w-6 mr-2 text-amber-500" />
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                      Unlock Premium Access
                    </CardTitle>
                    <CardDescription>Elevate your experience with premium features</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-lg">Lifetime Premium</h3>
                      <p className="text-sm text-gray-500">One-time payment, forever access</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-none">
                    Best Value
                  </Badge>
                </div>

                <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-indigo-100">
                  <motion.ul
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    <motion.li
                      className="flex items-start gap-3"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                    >
                      <div className="mt-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 shadow-md">
                        <Check size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Unlimited Contract Analysis</p>
                        <p className="text-sm text-gray-600">Analyze as many contracts as you need</p>
                      </div>
                    </motion.li>

                    <motion.li
                      className="flex items-start gap-3"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                    >
                      <div className="mt-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 shadow-md">
                        <Zap size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Priority Processing</p>
                        <p className="text-sm text-gray-600">Get faster results with priority queue</p>
                      </div>
                    </motion.li>

                    <motion.li
                      className="flex items-start gap-3"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                    >
                      <div className="mt-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 shadow-md">
                        <Star size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Advanced AI Features</p>
                        <p className="text-sm text-gray-600">Access to premium AI capabilities</p>
                      </div>
                    </motion.li>
                  </motion.ul>
                </div>
              </CardContent>

              <CardFooter className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 relative z-10">
                <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {}}
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Upgrade to Premium
                  </Button>
                </motion.div>
              </CardFooter>

              {/* Price tag */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                $99.99
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}


'use client'

import { useAppDispatch, useAppSelector } from "@/redux/store";
import { RootState } from "@/redux/store";
import { Button } from "../ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "./icons";
// import { useRouter } from "next/navigation";
// import { addUser } from "@/features/auth/authSlice";
import axios from "axios";


function UserButton() {
  // const dispatch = useAppDispatch()
  const user = useAppSelector((store : RootState) => store.user);
 
  async function googleSignIn(): Promise<void> {
      try {
        const user = await axios.get('http://localhost:4000/api/v1/auth/google')
        if(!user) throw new Error("auth failed!");

      } catch (error : any) {
        console.error(`Error  : ${error.message}`)
      } 
  }  

  return (
    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      {user.isAuthenticated? 
        (<> 
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarImage src={user?.userInfo?.profilePic || ""} />
                  <AvatarFallback>
                    {user?.userInfo?.userName.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" forceMount>
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="text-sm font-medium">{user?.userInfo?.userName}</div>
                <div className="text-sm text-muted-foreground">
                  {user?.userInfo?.emailId}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={"/dashboard"}>
                  <Icons.dashboard className="mr-2 size-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/dashboard/settings"}>
                  <Icons.settings className="mr-2 size-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Icons.logout className="mr-2 size-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>) 
        : 
        (<> 
        <Button onClick={googleSignIn}>
            Sign in
          </Button>
        </>)}
    </div>
  )
}

export default UserButton
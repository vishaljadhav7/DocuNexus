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
import { openModal } from "@/features/modal/modalSlice";



function UserButton() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((store : RootState) => store.user);
  

  function handleClick  ()  {
    dispatch(openModal("connectAccountModal"))
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
        <Button onClick={handleClick}>
            Sign in
          </Button>
        </>)}
    </div>
  )
}

export default UserButton
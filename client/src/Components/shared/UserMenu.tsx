'use client'

import { useAppSelector } from "@/redux/store";
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

function UserMenu() {
  const user = useAppSelector((store : RootState) => store.user);

  return (
    <div className="fixed top-3 right-30 z-50 flex flex-1 items-center justify-between space-x-2 md:justify-end">      
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
            <Link href={"/dashboard/customizations"}>
              <Icons.settings className="mr-2 size-4" />
              <span>Customizations</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Icons.logout className="mr-2 size-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div> 
  )
}

export default UserMenu
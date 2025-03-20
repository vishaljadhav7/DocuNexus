"use client";

import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ElementType } from "react";
import UserMenu from "../shared/UserMenu";

export const SideMenu = () => {
  return (
    <aside className="bg-gray-50 text-gray-800 border-r border-gray-200 w-[280px] min-h-screen hidden md:block">
      <SideMenuContent />
    </aside>
  );
};

const SideMenuContent = () => {
  const pathname = usePathname();

  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: FileText,
      label: "Outcomes",
      href: "/dashboard/outcomes",
    },
    {
      icon: Settings,
      label: "Customizations",
      href: "/dashboard/customizations",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 h-full flex flex-col">
      <nav className="flex-grow p-6">
        <ul role="list" className="flex flex-col space-y-2">
          {sidebarItems.map((item) => (
            <SideMenulink key={item.label} path={pathname} link={item} />
          ))}
        </ul>
      </nav>
    </div>
  );
};

interface ISideMenulink {
  path: string;
  link: {
    icon: ElementType;
    label: string;
    href: string;
    target?: string;
  };
}

const SideMenulink = ({ path, link }: ISideMenulink) => {
  return (
    <li key={link.label}>
      <Link
        href={link.href}
        className={cn(
          "group flex h-10 items-center gap-x-3 rounded-md px-3 text-sm font-medium text-gray-700 transition-colors duration-200",
          path === link.href
            ? "bg-teal-100 text-teal-600"
            : "hover:bg-gray-200 hover:text-teal-600"
        )}
      >
        <link.icon className="size-4 shrink-0 text-teal-600" />
        {link.label}
      </Link>
    </li>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 relative">
      <SideMenu />
      <UserMenu />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
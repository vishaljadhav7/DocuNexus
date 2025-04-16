
"use client";

import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ElementType } from "react";
import UserMenu from "../shared/UserMenu";
import { motion } from "framer-motion";

export const SideMenu = () => {
  return (
    <aside className="bg-white text-gray-900 border-r border-gray-100 w-[280px] min-h-screen hidden md:block shadow-lg">
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
    <div className="bg-gradient-to-b from-white to-gray-50 text-gray-900 h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-teal-600">AI Contracts</h1>
      </div>
      <nav className="flex-grow px-4 py-2">
        <ul role="list" className="flex flex-col space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
            >
              <SideMenulink path={pathname} link={item} />
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <UserMenu />
      </div>
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
    <Link
      href={link.href}
      className={cn(
        "group flex h-12 items-center gap-x-4 rounded-lg px-4 text-base font-semibold transition-all duration-300",
        path === link.href
          ? "bg-teal-500 text-white shadow-md"
          : "text-gray-700 hover:bg-teal-50 hover:text-teal-600 hover:shadow-sm"
      )}
    >
      <link.icon className={cn(
        "size-5 shrink-0 transition-colors duration-300",
        path === link.href ? "text-white" : "text-teal-500 group-hover:text-teal-600"
      )} />
      {link.label}
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 relative">
      <SideMenu />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}

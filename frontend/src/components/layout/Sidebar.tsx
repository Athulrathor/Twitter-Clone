"use client";

import React from "react";

import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  LogOut,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TwitterLogo from "../Twitterlogo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  mobile?: boolean;
}

export default function Sidebar({
  currentPage = "home",
  onNavigate,
  mobile,
}: SidebarProps) {
  const { user, logout, currentSession } = useAuth();

  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navigation = [
    { name: "Home", icon: Home, current: currentPage === "home", page: "home" },
    {
      name: "Explore",
      icon: Search,
      current: currentPage === "explore",
      page: "explore",
    },
    {
      name: "Notifications",
      icon: Bell,
      current: currentPage === "notifications",
      page: "notifications",
      badge: true,
    },
    {
      name: "Messages",
      icon: Mail,
      current: currentPage === "messages",
      page: "messages",
    },
    {
      name: "Bookmarks",
      icon: Bookmark,
      current: currentPage === "bookmarks",
      page: "bookmarks",
    },
    {
      name: "Profile",
      icon: User,
      current: currentPage === "profile",
      page: "profile",
    },
  ];

return mobile ? (
  <div className="flex items-center justify-around h-16 px-2">
    {navigation.map((item) => (
      <Button
        key={item.page}
        variant="ghost"
        size="icon"
        onClick={() => onNavigate?.(item.page)}
        className={`
          h-11 w-11 rounded-full
          transition-all duration-200
          hover:bg-gray-900
          active:scale-95
          ${
            item.current
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-white"
          }
        `}
      >
        <item.icon className="h-5 w-5" />
      </Button>
    ))}

    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="
            h-11 w-11 rounded-full
            text-gray-500
            transition-all duration-200
            hover:bg-gray-900
            hover:text-white
            active:scale-95
            data-[state=open]:bg-gray-900
            data-[state=open]:text-white
          "
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="end"
        className="w-56 bg-black border-gray-800 text-white"
      >
        <DropdownMenuItem
          onClick={() => router.push("security")}
          className="hover:bg-gray-900 focus:bg-gray-900 cursor-pointer"
        >
          <Shield className="mr-2 h-4 w-4" />
          Security
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(`subscriptions/${user?._id}`)}
          className="hover:bg-gray-900 focus:bg-gray-900 cursor-pointer"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Subscription
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => logout(currentSession?._id as string)}
          className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
) : (
    <div className="flex flex-col h-screen bg-black mt-3">
      {/* Logo */}
      <div className="p-2 max-lg:p-0 max-lg:m-auto flex items-center justify-start">
        <TwitterLogo size="lg" className="text-white" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.(item.page)}
                className={`w-full lg:justify-start justify-center
                h-10 rounded-lg text-white hover:bg-gray-900
                ${item.current ? "font-bold" : ""}
              `}
              >
                <item.icon className="h-5 w-5 lg:mr-4" />
                <span className="hidden lg:block">{item.name}</span>
              </Button>
            </li>
          ))}
        </ul>

        <Button
          className="hidden lg:flex mt-6 w-full rounded-lg
        bg-blue-500 hover:bg-blue-600"
        >
          Post
        </Button>
      </nav>

      {/* User */}
      {user && (
        <div className="max-lg:p-0 sm:pb-4 sm:pt-2 p-3 border-t border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center mt-1 mb-2 lg:justify-start rounded-lg lg:h-12"
              >
                <Avatar className="h-10 w-10 ">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>

                <div className="hidden lg:block lg:ml-3 text-left flex-1">
                  <div className="font-semibold">{user.displayName}</div>
                  <div className="text-sm text-gray-400">@{user.username}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-black border-gray-800">
              <DropdownMenuItem onClick={() => router.push(`security`)}>
                <Shield className="mr-2 h-4 w-4" />
                Security
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push(`subscriptions/${user?._id}`)}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Subscription
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => logout(currentSession?._id as string)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-white">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

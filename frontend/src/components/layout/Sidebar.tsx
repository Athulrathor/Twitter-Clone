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
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TwitterLogo from "../Twitterlogo";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";

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
  const { user, logout } = useAuth();

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
    {
      name: "More",
      icon: MoreHorizontal,
      current: currentPage === "more",
      page: "more",
    },
  ];

  return mobile ? (
    <div className="flex items-center justify-around h-16">
      {navigation.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          size="icon"
          className={`rounded-full ${
            item.current ? "text-white" : "text-gray-500"
          }`}
          onClick={() => onNavigate?.(item.page)}
        >
          <item.icon className="h-5 w-5" />
        </Button>
      ))}
    </div>
  ) : (
    <div className="flex flex-col h-screen bg-black">
      {/* Logo */}
      <div className="p-2 mx-auto">
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
                h-14 rounded-full text-white hover:bg-gray-900
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
        className="hidden lg:flex mt-6 w-full rounded-full
        bg-blue-500 hover:bg-blue-600"
      >
        Post
      </Button>
      </nav>

      {/* User */}
      {user && (
        <div className="p-3 border-t border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center lg:justify-start rounded-full h-16"
              >
                <Avatar className="h-10 w-10 ">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>

                <div className="hidden lg:block ml-3 text-left flex-1">
                  <div className="font-semibold">{user.displayName}</div>
                  <div className="text-sm text-gray-400">@{user.username}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-black border-gray-800">
              <DropdownMenuItem onClick={logout}>
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

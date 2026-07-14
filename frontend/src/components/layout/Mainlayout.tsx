"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import LoadingSpinner from "../loading-spinner";
import Sidebar from "./Sidebar";
import RightSidebar from "./Rightsidebar";
import ProfilePage from "../ProfilePage";
import NotificationsPage from "@/app/notification/page";

const Mainlayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing  } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");

  if (isInitializing ) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-4xl font-bold mb-4">X</div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // If user is not logged in → show children (like login/signup pages)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full">
      {/* Sidebar */}
        <aside className="hidden md:flex md:w-20 lg:w-64 border-r border-gray-800 shrink-0 sticky top-0 h-screen">
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        </aside>
        {/* Main Feed */}
        <main className="flex-1 border-x border-gray-800 pb-20 md:pb-0 overflow-hidden">
          {currentPage === "profile" ? (
            <ProfilePage />
          ) : currentPage === "notification" ? (
            <NotificationsPage />
          ) : (
            children
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block xl:w-80 border-l border-gray-800 shrink-0">
          <RightSidebar />
        </aside>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden sticky bottom-0 border-t border-gray-800 bg-black z-50">
        <Sidebar
          mobile
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Mainlayout;

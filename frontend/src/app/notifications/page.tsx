"use client";

import { useEffect, useState } from "react";
import NotificationCard from "../../components/notifications/notificationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markAsRead,
  markAllRead,
  unreadCount,
} from "../../components/notifications/hook/useNotification.hook";
import { auth } from "../../context/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

type Notification = {
  _id: string;
  isRead: boolean;
  [key: string]: unknown;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const { isInitializing,user } = useAuth();

  const router = useRouter();
  const { t } = useTranslation();

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const [notificationRes, unreadRes] = await Promise.all([
        getNotifications(),
        unreadCount(),
      ]);

      setNotifications(notificationRes?.data?.notifications);
      setCount(unreadRes?.data?.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitializing) return;
    if (!user) return;
    loadNotifications();
  }, [isInitializing,user]);

  const handleRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev: any[]) =>
      prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)),
    );

    setCount((prev) => Math.max(prev - 1, 0));

    try {
      await markAsRead(id);
    } catch (err) {
      console.error(err);
      loadNotifications();
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();

      setNotifications((prev: any[]) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      setCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">{t("loading")}</div>;
  }

  return (
    <div className="">
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b flex items-center">
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft size={18} />
        </Button> */}
        <h1 className="text-2xl font-bold p-5"> {t("notifications")}</h1>
        {count > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            {t("notification:mark_all_read")}
          </Button>
        )}
      </div>

      {notifications?.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          {t("notification:no_notifications")}
        </div>
      ) : (
        notifications?.map((notification: any) => (
          <NotificationCard
            key={notification._id}
            notification={notification}
            onRead={handleRead}
          />
        ))
      )}
    </div>
  );
}

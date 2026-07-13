import { Bell } from "lucide-react";
import formatDistanceToNow from "@/lib/formatDistanceToNow";

interface Props {
  notification: any;
  onRead: (id: string) => void;
}

export default function NotificationCard({
  notification,
  onRead,
}: Props) {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification._id);
    }

    alert("onreaded");

    //  router.push(`/tweet/${notification.tweetId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`border-b p-4 hover:bg-muted transition cursor-pointer ${
        !notification.read ? "bg-blue-500/5" : ""
      }`}
    >
      <div className="flex gap-3">
        <Bell className="text-blue-500 mt-1" />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {notification?.title}
            </h3>

            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(
                new Date(notification.createdAt),
                {
                  addSuffix: true,
                }
              )}
            </span>
          </div>

          <p className="mt-2 text-sm whitespace-pre-wrap">
            {notification.body}
          </p>

          {!notification.read && (
            <span className="mt-2 inline-block h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
}
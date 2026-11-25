
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { apiFetch } from "@/lib/api";

export default function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch unread count when the component loads
  useEffect(() => {
    let ignore = false;

    const fetchUnreadCount = async () => {
      try {
        const response = await apiFetch("/notifications/unread-count");

        if (!ignore) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch notifications when the dropdown opens
  const handleToggle = async () => {
    const shouldOpen = !isOpen;
    setIsOpen(shouldOpen);

    if (!shouldOpen) return;

    try {
      setLoading(true);
      setError("");

      const [notificationResponse, countResponse] = await Promise.all([
        apiFetch("/notifications?page=1&limit=10"),
        apiFetch("/notifications/unread-count"),
      ]);

      setNotifications(notificationResponse.data);
      setUnreadCount(countResponse.data.unreadCount);
    } catch (error) {
      setError(error.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (!notification.isRead) {
      try {
        await apiFetch(`/notifications/${notification._id}/read`, {
          method: "PATCH",
        });

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((previous) => Math.max(0, previous - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return;
      }
    }

    if (notification.issueId?._id) {
      setIsOpen(false);
      let issueRoute = "/citizen/issues";

      if (pathname.startsWith("/department")) {
        issueRoute = "/department/issues";
      } else if (pathname.startsWith("/maintenance")) {
        issueRoute = "/maintenance/issues";
      }

      router.push(`${issueRoute}/${notification.issueId._id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch("/notifications/read-all", {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setError("Could not update notifications. Please try again.");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-100"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-85 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                Notifications
              </h3>
              <p className="text-xs text-gray-500">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-95 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <LoaderCircle size={18} className="animate-spin" />
                Loading notifications...
              </div>
            ) : error ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">
                {error}
              </p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 text-gray-300" size={28} />
                <p className="text-sm font-medium text-gray-700">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Updates about your reports will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleMarkAsRead(notification)}
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${!notification.isRead ? "bg-blue-50/60" : "bg-white"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead
                        ? "bg-gray-300"
                        : "bg-blue-600"
                        }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-3">
            <Link
              href="/citizen/issues"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View my reports
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

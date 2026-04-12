"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { requestNotificationPermission, getNotificationStatus } from "@/lib/messaging";
import { useAuth } from "@/lib/auth";

export default function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem('gs-notif-dismissed');
    const status = getNotificationStatus();
    // Show if not dismissed, not already granted, and supported
    if (!dismissed && status === 'default') {
      setShow(true);
    }
  }, []);

  const handleEnable = async () => {
    if (!user) return;
    setRequesting(true);
    const token = await requestNotificationPermission(user.uid);
    setRequesting(false);
    if (token) {
      setShow(false);
      localStorage.setItem('gs-notif-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('gs-notif-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="bg-creek-lt border-b border-creek/20 px-4 py-3">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <div className="w-8 h-8 rounded-full bg-creek/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-creek" />
        </div>
        <p className="flex-1 text-sm text-root font-dm-sans">
          <strong>Stay connected to the farm.</strong> Enable notifications for frost alerts, new orders, and morning task briefs.
        </p>
        <button
          onClick={handleEnable}
          disabled={requesting}
          className="px-4 py-1.5 bg-creek text-white rounded-full text-xs font-bold hover:bg-creek/80 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {requesting ? 'Enabling...' : 'Enable'}
        </button>
        <button onClick={handleDismiss} className="text-stone-c hover:text-root p-1 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

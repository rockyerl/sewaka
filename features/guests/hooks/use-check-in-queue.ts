"use client";

import { useState, useEffect, useCallback } from "react";

export interface CheckInQueueEntry {
  guestId: string;
  invitationCode: string;
  checkedInAt: string;
  deviceId: string;
  performedBy: string;
  timestamp: number;
}

const QUEUE_KEY_PREFIX = "sewaka_checkin_queue_";
const MAX_QUEUE_SIZE = 100;

function getQueueKey(workspaceId: string) {
  return `${QUEUE_KEY_PREFIX}${workspaceId}`;
}

function getDeviceId(): string {
  if (typeof navigator === "undefined") return "server";
  return `${navigator.userAgent || "unknown"} | ${navigator.platform || "unknown"} | ${navigator.language || "unknown"}`;
}

function loadQueue(workspaceId: string): CheckInQueueEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getQueueKey(workspaceId);
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data) as CheckInQueueEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(workspaceId: string, queue: CheckInQueueEntry[]) {
  if (typeof window === "undefined") return;
  try {
    const key = getQueueKey(workspaceId);
    localStorage.setItem(key, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save check-in queue:", error);
  }
}

export function useCheckInQueue(workspaceId: string) {
  const [queue, setQueue] = useState<CheckInQueueEntry[]>(() => loadQueue(workspaceId));
  const [prevWorkspaceId, setPrevWorkspaceId] = useState(workspaceId);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  if (workspaceId !== prevWorkspaceId) {
    setPrevWorkspaceId(workspaceId);
    setQueue(loadQueue(workspaceId));
  }

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const enqueue = useCallback(
    (invitationCode: string, guestId?: string, performedBy?: string) => {
      const entry: CheckInQueueEntry = {
        guestId: guestId || "",
        invitationCode,
        checkedInAt: new Date().toISOString(),
        deviceId: getDeviceId(),
        performedBy: performedBy || "scanner",
        timestamp: Date.now(),
      };

      const currentQueue = loadQueue(workspaceId);

      // Check for duplicates
      const exists = currentQueue.some(
        (e) => e.invitationCode === invitationCode
      );
      if (exists) {
        console.warn("Duplicate check-in in queue:", invitationCode);
        return false;
      }

      // Enforce max queue size
      const newQueue = [...currentQueue, entry];
      if (newQueue.length > MAX_QUEUE_SIZE) {
        newQueue.shift();
      }

      saveQueue(workspaceId, newQueue);
      setQueue(newQueue);
      return true;
    },
    [workspaceId]
  );

  const dequeue = useCallback(() => {
    const currentQueue = loadQueue(workspaceId);
    if (currentQueue.length === 0) return null;

    const [first, ...rest] = currentQueue;
    saveQueue(workspaceId, rest);
    setQueue(rest);
    return first;
  }, [workspaceId]);

  const removeEntry = useCallback(
    (invitationCode: string) => {
      const currentQueue = loadQueue(workspaceId);
      const newQueue = currentQueue.filter(
        (e) => e.invitationCode !== invitationCode
      );
      saveQueue(workspaceId, newQueue);
      setQueue(newQueue);
    },
    [workspaceId]
  );

  const clearQueue = useCallback(() => {
    saveQueue(workspaceId, []);
    setQueue([]);
  }, [workspaceId]);

  const getPending = useCallback(() => {
    return loadQueue(workspaceId);
  }, [workspaceId]);

  return {
    queue,
    isOnline,
    pendingCount: queue.length,
    enqueue,
    dequeue,
    removeEntry,
    clearQueue,
    getPending,
  };
}

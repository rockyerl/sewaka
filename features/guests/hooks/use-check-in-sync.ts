"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckInQueueEntry } from "./use-check-in-queue";

interface SyncResult {
  success: number;
  failed: number;
  conflicts: number;
}

interface UseCheckInSyncProps {
  workspaceId: string;
  queue: CheckInQueueEntry[];
  onSync: (entries: CheckInQueueEntry[]) => Promise<SyncResult>;
  onSyncComplete?: (result: SyncResult) => void;
}

const RETRY_DELAYS = [1000, 2000, 4000, 8000]; // Exponential backoff: 1s, 2s, 4s, 8s
const MAX_RETRIES = RETRY_DELAYS.length;

export function useCheckInSync({
  workspaceId,
  queue,
  onSync,
  onSyncComplete,
}: UseCheckInSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const syncInProgressRef = useRef(false);
  const syncQueueRef = useRef<() => Promise<void>>(null);

  const syncQueue = useCallback(async () => {
    if (syncInProgressRef.current || queue.length === 0) return;

    syncInProgressRef.current = true;
    setIsSyncing(true);

    try {
      const result = await onSync(queue);
      setLastSyncResult(result);
      onSyncComplete?.(result);

      if (result.failed > 0 && retryCount < MAX_RETRIES) {
        // Schedule retry with exponential backoff
        const delay = RETRY_DELAYS[retryCount];
        setRetryCount((c) => c + 1);
        setTimeout(() => {
          syncInProgressRef.current = false;
          syncQueueRef.current?.();
        }, delay);
      } else {
        setRetryCount(0);
        syncInProgressRef.current = false;
      }
    } catch (error) {
      console.error("Sync failed:", error);
      setRetryCount((c) => Math.min(c + 1, MAX_RETRIES));
      syncInProgressRef.current = false;
    } finally {
      setIsSyncing(false);
    }
  }, [queue, onSync, onSyncComplete, retryCount]);

  useEffect(() => {
    syncQueueRef.current = syncQueue;
  }, [syncQueue]);

  // Detect online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-sync when coming back online with pending queue
  useEffect(() => {
    if (!isOnline || queue.length === 0 || syncInProgressRef.current) return;

    const timeoutId = setTimeout(() => {
      syncQueue();
    }, 500); // Small delay to ensure connection is stable

    return () => clearTimeout(timeoutId);
  }, [isOnline, queue.length, syncQueue]);

  const cancelSync = useCallback(() => {
    syncInProgressRef.current = false;
    setIsSyncing(false);
    setRetryCount(0);
  }, []);

  return {
    isSyncing,
    isOnline,
    lastSyncResult,
    retryCount,
    syncQueue,
    cancelSync,
  };
}

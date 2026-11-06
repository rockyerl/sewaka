"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string | Date;
}

const typeStyles = {
  info: "border-l-[#5B132B] bg-[#faf6f0]",
  warning: "border-l-[#D4AF37] bg-[#faf5ec]",
  error: "border-l-[#c53030] bg-[#fdf2f2]",
  maintenance: "border-l-[#A08F74] bg-[#f5f0eb]",
};

const typeBadges = {
  info: "Info",
  warning: "Penting",
  error: "Urgent",
  maintenance: "Maintenance",
};

export function AnnouncementsBanner({ announcements }: { announcements: Announcement[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeAnnouncements = announcements.filter(
    (a) => a.isActive && !dismissed.has(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2">
      {activeAnnouncements.map((announcement) => (
        <Card
          key={announcement.id}
          className={`relative flex items-start gap-3 border-l-4 p-4 ${typeStyles[announcement.type as keyof typeof typeStyles] || typeStyles.info}`}
        >
          <Bell className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full text-[10px] font-medium"
              >
                {typeBadges[announcement.type as keyof typeof typeBadges] || "Info"}
              </Badge>
              <span className="text-sm font-medium">{announcement.title}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{announcement.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 -translate-x-1 -translate-y-1"
            onClick={() => setDismissed((prev) => new Set(prev).add(announcement.id))}
          >
            <X className="size-3" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

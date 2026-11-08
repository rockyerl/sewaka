"use client";

import { Calendar, Heart } from "lucide-react";
import { getBlobUrl } from "@/lib/utils/blob-url";

interface TimelineMilestone {
  date: string;
  title: string;
  description: string;
  photo_url?: string;
}

interface StoryTimelineProps {
  milestones: TimelineMilestone[];
}

export function StoryTimeline({ milestones }: StoryTimelineProps) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-lg">
      <div className="text-center mb-8">
        <span className="inline-grid size-8 place-items-center rounded-full bg-[#FAF5EC] text-[#D4AF37] mx-auto mb-2">
          <Heart className="size-4" />
        </span>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase">
          Perjalanan Cinta Kami
        </p>
        <h2 className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
          Love Story Timeline
        </h2>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent" />

        <div className="space-y-8">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="relative flex gap-5">
              {/* Dot on the line */}
              <div className="relative z-10 flex shrink-0 size-12 items-center justify-center">
                <div className="grid size-10 place-items-center rounded-full border-2 border-[#D4AF37] bg-white shadow-sm">
                  <Calendar className="size-4 text-[#D4AF37]" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                {milestone.photo_url && (
                  <div className="mb-3 overflow-hidden rounded-xl border border-[#E6D5B8]/60">
                    <img
                      src={getBlobUrl(milestone.photo_url)}
                      alt={milestone.title}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-[#E6D5B8]/60 bg-[#FAF5EC] p-4">
                  {milestone.date && (
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-[#D4AF37] uppercase">
                      {milestone.date}
                    </p>
                  )}
                  <h3 className="mt-1 font-serif text-lg font-semibold text-[#5B132B]">
                    {milestone.title}
                  </h3>
                  {milestone.description && (
                    <p className="mt-2 text-xs leading-relaxed text-[#786C5A]">
                      {milestone.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

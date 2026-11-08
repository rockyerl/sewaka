"use client";

import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function TabsWithUnderline({
  tabs,
  defaultActive = 0,
  className = "",
}: {
  tabs: { id: string; label: string; icon?: LucideIcon; content: React.ReactNode }[];
  defaultActive?: number;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(defaultActive);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const panels = containerRef.current.querySelectorAll<HTMLElement>("[data-tab-panel]");
      panels.forEach((panel, i) => {
        panel.style.display = i === activeIndex ? "" : "none";
      });
    }
  }, [activeIndex]);

  const Icon = tabs[activeIndex]?.icon;

  return (
    <div className={className}>
      <div className="flex items-center border-b border-border/60">
        {tabs.map((tab, i) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`-mb-px flex items-center gap-2 px-4 pb-3 text-xs font-medium transition-all border-b-2 ${
                i === activeIndex
                  ? "border-[#5B132B] text-[#5B132B]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {TabIcon && <TabIcon className="size-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div ref={containerRef} className="pt-4">
        {tabs.map((tab, i) => (
          <div key={tab.id} data-tab-panel style={{ display: i === activeIndex ? "" : "none" }}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}

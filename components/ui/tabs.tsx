"use client";

import * as React from "react";
import { cn } from "@/lib/utils/utils";

const TabsContext = React.createContext<string>("");

const Tabs = ({ children, defaultValue, className }: { children: React.ReactNode; defaultValue: string; className?: string }) => {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={value}>
      <div className={cn("space-y-4", className)} data-tabs-value={value}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { value, setValue } as any)
            : child
        )}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className, value, setValue }: { children: React.ReactNode; className?: string; value?: string; setValue?: (v: string) => void }) => {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { value, setValue } as any)
          : child
      )}
    </div>
  );
};

const TabsTrigger = ({ children, value: triggerValue, className, value: contextValue, setValue }: { children: React.ReactNode; value: string; className?: string; contextValue?: string; setValue?: (v: string) => void }) => {
  const isActive = contextValue === triggerValue;
  return (
    <button
      type="button"
      role="tab"
      onClick={() => setValue?.(triggerValue)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow" : "hover:bg-background/50 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value: triggerValue, className, value: contextValue }: { children: React.ReactNode; value: string; className?: string; contextValue?: string }) => {
  if (contextValue !== triggerValue) return null;
  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };

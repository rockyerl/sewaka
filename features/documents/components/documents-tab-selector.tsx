"use client";

import { useState, useSyncExternalStore } from "react";
import { Upload, ListTodo } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot() {
  const hash = window.location.hash.slice(1);
  return hash === "checklist" ? "checklist" : "files";
}

function getServerSnapshot() {
  return "files";
}

export function DocumentsTabSelector({ workspaceId: _workspaceId }: { workspaceId: string }) {
  const hashSection = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [manualSection, setManualSection] = useState<string | null>(null);
  const activeSection = manualSection ?? hashSection;

  return (
    <div className="mb-5 flex gap-1 rounded-lg bg-muted/50 p-1">
      <a
        href="#files"
        onClick={() => setManualSection("files")}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
          activeSection === "files" || activeSection === ""
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Upload className="size-4" />
        File Upload
      </a>
      <a
        href="#checklist"
        onClick={() => setManualSection("checklist")}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
          activeSection === "checklist"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ListTodo className="size-4" />
        Checklist Nikah
      </a>
    </div>
  );
}

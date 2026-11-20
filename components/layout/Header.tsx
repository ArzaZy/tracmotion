"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui";
import { isActive, navItems } from "./nav-items";

export function Header() {
  const pathname = usePathname();
  const current = navItems.find((item) => isActive(pathname, item.href));
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="brand-mark brand-mark-sm">T</span>
        <p className="topbar-title">{current?.label ?? "TracMotion"}</p>
      </div>
      <Badge tone="muted">Local mode</Badge>
    </header>
  );
}

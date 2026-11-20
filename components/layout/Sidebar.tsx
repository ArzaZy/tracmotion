"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar" aria-label="Navigasi utama">
      <Link href="/" className="brand">
        <span className="brand-mark">T</span>
        <span className="brand-text">
          TracMotion<small>Motion studio</small>
        </span>
      </Link>
      <nav className="side-nav">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item${isActive(pathname, href) ? " active" : ""}`}
            aria-current={isActive(pathname, href) ? "page" : undefined}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="side-foot">Stage 1 · v0.1.0</div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, navItems } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav" aria-label="Navigasi utama">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`mobile-item${isActive(pathname, href) ? " active" : ""}`}
          aria-current={isActive(pathname, href) ? "page" : undefined}
        >
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteNavItem } from "@/lib/site-content";
import { cn } from "@/lib/utils";

type SiteChromeProps = {
  title: string;
  navItems: SiteNavItem[];
  children: React.ReactNode;
};

function isActive(pathname: string, href: string, matchPrefixes?: string[]) {
  if (href === "/") {
    return pathname === "/";
  }

  if (pathname === href) {
    return true;
  }

  return matchPrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false;
}

export function SiteChrome({ title, navItems, children }: SiteChromeProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="site-shell">
      <div className="site-frame">
        <header className="site-header">
          <Link className="site-title" href="/">
            {title}
          </Link>
          <div className="site-menu-wrap">
            <button
              aria-controls="site-nav"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="site-menu-button"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <span className="site-menu-button-line" />
              <span className="site-menu-button-line" />
              <span className="site-menu-button-line" />
            </button>
            <nav
              aria-label="Primary"
              className={cn("site-nav", menuOpen && "site-nav-open")}
              id="site-nav"
            >
              {navItems.map((item) => (
                <Link
                  className={cn(
                    "site-nav-link",
                    isActive(pathname, item.href, item.matchPrefixes) && "site-nav-link-active"
                  )}
                  href={item.href}
                  key={item.key}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="site-content">{children}</main>
      </div>
    </div>
  );
}

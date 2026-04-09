import React from "react";
import type { Metadata } from "next";
import "@fontsource-variable/montserrat";
import "@/app/globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { repository } from "@/lib/data/repository";
import { config } from "@/lib/config";
import { getSiteNavItems } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Masters Pool",
  description: "Masters Pool website."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tournament = repository.getTournament();
  const title = `${tournament.year} ${tournament.name}`.toUpperCase();
  const navItems = getSiteNavItems(config.siteVariant);

  return (
    <html lang="en">
      <body>
        <SiteChrome title={title} navItems={navItems}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}

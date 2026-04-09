import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const originalSiteVariant = process.env.SITE_VARIANT;

afterEach(() => {
  process.env.SITE_VARIANT = originalSiteVariant;
  vi.doUnmock("@/components/site-chrome");
  vi.doUnmock("@/lib/data/repository");
  vi.resetModules();
});

describe("site layout", () => {
  it("uses the player-site navigation", async () => {
    vi.doMock("@/lib/data/repository", () => ({
      repository: {
        getTournament: () => ({ year: 2026, name: "Masters Pool" })
      }
    }));
    vi.doMock("@/components/site-chrome", () => ({
      SiteChrome: ({ children, navItems, title }: { children: React.ReactNode; navItems: Array<{ label: string }>; title: string }) => (
        <div data-title={title}>
          <nav>{navItems.map((item) => item.label).join("|")}</nav>
          {children}
        </div>
      )
    }));

    const { default: RootLayout } = await import("@/app/layout");
    const html = renderToStaticMarkup(RootLayout({ children: <div>child</div> }));

    expect(html).toContain("Rules|Rosters|Scoreboard|Round 1|Round 2|Round 3|Round 4|Overall|Payouts");
    expect(html).not.toContain("Submit Roster");
    expect(html).toContain("2026 MASTERS POOL");
  });

  it("renders the welcome landing page on the home page", async () => {
    const { default: HomePage } = await import("@/app/page");
    const html = renderToStaticMarkup(HomePage());

    expect(html).toContain("Welcome");
    expect(html).toContain("Pool commissioner&#x27;s welcome message here");
    expect(html).toContain("The 2026 Masters Pool is locked and live.");
  });
});

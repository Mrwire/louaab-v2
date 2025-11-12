import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-soft-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}



"use client";

import { usePathname } from "next/navigation";

const HIDE_NAV_PATH_PREFIXES = [];
const HIDE_FOOTER_PATH_PREFIXES = ["/dashboard/admin"];

export default function LayoutShell({ navbar, footer, children }) {
  const pathname = usePathname();
  const hideNav = pathname
    ? HIDE_NAV_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;
  const hideFooter = pathname
    ? HIDE_FOOTER_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;

  return (
    <>
      {!hideNav && navbar && (
        <header className="sticky top-0 z-50 w-full">{navbar}</header>
      )}
      <main id="main-content" className="flex-1 w-full" role="main">
        {children}
      </main>
      {!hideFooter && footer}
    </>
  );
}

// =============================================================================
// Root Layout — Sidebar + Main Content Area
// =============================================================================
// Fixed left sidebar (240px, dark bg) with nav links:
//   Dashboard, Projects (future: Settings)
// Top header: "Envora — Sandbox Platform"
// Main content fills remaining width.
// =============================================================================

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Envora — Sandbox Platform",
  description: "Provision isolated demo environments with AI-generated data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Implement sidebar + header layout
  // - Fixed left sidebar (240px, dark bg) with:
  //   - Logo/brand: "Envora"
  //   - Nav links with lucide-react icons:
  //     - Dashboard → /
  //     - Projects → /projects (list of all projects)
  //   - Active route should be highlighted
  // - Top header bar: "Sandbox Platform" + subtle border-bottom
  // - Main content area: {children}
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "../components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Envora — Sandbox Platform",
  description: "Provision isolated demo environments with AI-generated data",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark flex h-screen bg-background text-foreground`}>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 items-center border-b border-border px-6">
            <span className="text-sm text-muted-foreground">Sandbox Platform</span>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}

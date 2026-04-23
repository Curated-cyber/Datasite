"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CalendarDays,
  CheckSquare,
  Sparkles,
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/contacts",  label: "Contacts",   icon: Users },
  { href: "/companies", label: "Pipeline",   icon: Building2 },
  { href: "/deals",     label: "Deal Rooms", icon: Briefcase },
  { href: "/meetings",  label: "Meetings",   icon: CalendarDays },
  { href: "/tasks",     label: "Tasks",      icon: CheckSquare },
  { href: "/search",    label: "AI Search",  icon: Sparkles },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-[#e5e7eb] bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[#e5e7eb] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0f2d5c]">
          <Briefcase className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[#1a1a2e]">
          DealFlow <span className="text-[#0f2d5c]">OS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#0f2d5c]/8 text-[#0f2d5c]"
                      : "text-[#6b7280] hover:bg-[#f4f5f7] hover:text-[#1a1a2e]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-[#0f2d5c]" : "text-[#9ca3af] group-hover:text-[#1a1a2e]"
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-[#e5e7eb] p-3">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-[#f4f5f7]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f2d5c] text-[10px] font-semibold text-white">
            JD
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#1a1a2e]">James Dixon</p>
            <p className="truncate text-[10px] text-[#9ca3af]">Principal</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
        </button>
      </div>
    </aside>
  )
}

function TopBar() {
  return (
    <header className="fixed left-56 right-0 top-0 z-30 flex h-14 items-center gap-4 border-b border-[#e5e7eb] bg-white px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Search deals, contacts, companies…"
          className="h-8 w-full rounded-md border border-[#e5e7eb] bg-[#f4f5f7] pl-9 pr-3 text-sm text-[#1a1a2e] placeholder:text-[#9ca3af] focus:border-[#0f2d5c]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20 transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#f4f5f7] hover:text-[#1a1a2e]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        {/* Settings */}
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#f4f5f7] hover:text-[#1a1a2e]">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f5f7]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar />
      <TopBar />
      <main className="ml-56 pt-14">
        <div className="min-h-[calc(100vh-3.5rem)] p-6">{children}</div>
      </main>
    </div>
  )
}

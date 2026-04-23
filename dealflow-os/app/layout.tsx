import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "DealFlow OS",
  description: "Private Equity CRM & Deal Management Platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

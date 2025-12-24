import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product & Warranty Management System',
  description: 'Complete warranty management solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

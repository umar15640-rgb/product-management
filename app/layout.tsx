import './globals.css'
import type { Metadata } from 'next'
import { ToastContainer } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

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
      <body>
        {children}
        <ToastContainer />
        <ConfirmDialog />
      </body>
    </html>
  )
}

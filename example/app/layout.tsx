import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FeedbackWidget } from './components/FeedbackWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Feedback Vos - Example',
  description: 'Example app for testing feedback-vos widget',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <FeedbackWidget />
      </body>
    </html>
  )
}


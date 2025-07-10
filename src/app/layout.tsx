import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Use Inter font instead of Geist if you're having issues
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Next Pump',
    description: 'Pump monitoring application',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}</body>
        </html>
    )
}
import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "lily's inner plots",
  description: 'because she just be doing stuff',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

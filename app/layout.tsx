import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cruz Roja Credenciales",
  description: "Sistema de Emisión y Renovación de Credenciales para Cruz Roja Mexicana",
  generator: "v0.dev",
  icons: {
    icon: "/favicon-16x16.png", 
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

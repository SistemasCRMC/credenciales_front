import type React from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"


export default function BitacoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      {/* Header */}
        <div className="flex items-center justify-between mb-8 px-4 py-8 container mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-red-700 mb-2">Bitácora de Registros</h1>
            <p className="text-gray-600">Consulta el historial de emisión y renovación de credenciales del sistema</p>
          </div>
          <Link href="/dashboard" passHref>
            <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Regresar
            </Button>
          </Link>
        </div>
        <div className="py-8">
          {children}
      </div>
    </div>
  )
}

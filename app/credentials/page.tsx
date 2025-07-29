import Link from "next/link" // Importar Link
import { CredentialDesigner } from "@/components/credential-designer"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button" // Importar Button
import { ArrowLeftIcon } from "@heroicons/react/24/outline" // Importar icono

export default function CredentialsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 mb-2 flex items-center justify-between">
          {" "}
          {/* Añadido flex para alinear */}
          <h1 className="text-3xl font-bold text-red-700 pr-2">Emisión de Credenciales</h1>
          <Link href="/dashboard" passHref>
            <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Regresar
            </Button>
          </Link>
        </div>
        <CredentialDesigner />
      </main>
    </div>
  )
}

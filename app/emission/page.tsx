"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { CredentialDesigner } from "@/components/credential-designer"
import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"

export default function EmissionPage() {
    return (
        <RouteGuard requiredRole="usuario">
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                {/* Ajustado el padding-bottom del contenedor y eliminado el margin-bottom del div del título */}
                <div className="container mx-auto px-4 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        {" "}
                        {/* Eliminado mb-6 */}
                        <h1 className="text-3xl font-bold text-red-700">Emisión de Credenciales</h1>
                        <Link href="/dashboard" passHref>
                            <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Regresar
                            </Button>
                        </Link>
                    </div>
                </div>
                <CredentialDesigner />
            </div>
        </RouteGuard>
    )
}

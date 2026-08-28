"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

import { RegisterForm } from "@/components/register-form"

export default function AdminUserManagementPage() {
    return (
        <RouteGuard requiredRole="admin">
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <main className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-red-700 mb-2">Editar Usuario</h1>
                            <p className="text-gray-600">Crear un nuevo usuario en el sistema</p>
                        </div>
                        <Link href="/admin/users" passHref>
                            <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Regresar
                            </Button>
                        </Link>
                    </div>
                    <RegisterForm />
                </main>
            </div>
        </RouteGuard>
    )
}

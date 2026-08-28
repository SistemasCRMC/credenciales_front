import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, UserIcon } from "@heroicons/react/24/outline"

import { ResetPasswordForm } from "@/components/reset-password-form"
import BitacoraPage from "@/app/bitacora/page"

export default function AdminUserManagementPage() {
    return (
        <RouteGuard requiredRole="admin">
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
                    <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                            <h1 className="mb-2 text-2xl font-bold text-red-700 sm:text-3xl">Gestión de Usuarios</h1>
                            <p className="text-sm text-gray-600 sm:text-base">Crear usuarios y restablecer contraseñas</p>
                        </div>
                        <Link href="/dashboard" passHref className="w-full md:w-auto">
                            <Button
                                variant="outline"
                                className="w-full border-red-600 bg-transparent text-red-600 hover:bg-red-50 md:w-auto"
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Regresar
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-2 md:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,1024px)]">
                        

                        <div className="min-w-0">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-3 rounded-lg bg-blue-100 p-3 sm:mr-4">
                                        <UserIcon className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                                        Restablecer Contraseña
                                    </h3>
                                </div>
                                <ResetPasswordForm />
                            </div>
                        </div>
                        <div className="min-w-0 overflow-hidden">
                            <BitacoraPage />
                        </div>
                    </div>
                </main>
            </div>
        </RouteGuard>
    )
}

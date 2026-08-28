"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline"

import { RegisterForm } from "@/components/register-form"

export default function AdminUserManagementPage() {
    return (
        <RouteGuard requiredRole="admin">
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <main className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-red-700 mb-2">Gestión de Usuarios</h1>
                            <p className="text-gray-600">Crear usuarios y restablecer contraseñas</p>
                        </div>
                        <Link href="/dashboard" passHref>
                            <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Regresar
                            </Button>
                        </Link>
                    </div>
                    <div className="grid gap-2 md:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,920px)]">
                        <div>
                            <Link href="/admin/users/recovery" passHref>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                    <UserGroupIcon className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                                    Gestión de Accesos
                                </h3>
                                <p className="text-gray-600 text-sm">Administrar permisos y restablecer contraseñas</p>
                                </div>
                            </Link>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-0 md:w-[89vh]">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                                        <UserIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Crear Usuario</h3>
                                </div>
                                <RegisterForm />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </RouteGuard>
    )
}

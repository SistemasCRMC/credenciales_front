"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { getUserFromStorage } from "@/lib/auth"
import { DocumentPlusIcon, ArrowPathIcon, ClipboardDocumentListIcon, UserGroupIcon } from "@heroicons/react/24/outline"

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; rol: string } | null>(null)

  useEffect(() => {
    const userData = getUserFromStorage()
    if (userData) {
      setUser({
        name: userData.nombre,
        rol: userData.rol,
      })
      console.log("DashboardPage: Rol del usuario en estado:", userData.rol)
    }
  }, [])

  return (
    <RouteGuard requiredRole="usuario">
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-700 mb-2">Qué alegría verte{user?.name ? `, ${user.name}` : ""}</h1>
            <p className="text-gray-600">
              {user?.rol === "admin"
                ? "Panel de administración del sistema de credenciales"
                : "Sistema de gestión de credenciales Cruz Roja"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Emitir Credencial - Disponible para todos */}
            <Link href="/emission" passHref>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <DocumentPlusIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  Emitir Credencial
                </h3>
                <p className="text-gray-600 text-sm">Crear una nueva credencial para un empleado</p>
              </div>
            </Link>

            {/* Renovar Credencial - Disponible para todos */}
            <Link href="/renewal" passHref>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ArrowPathIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Renovar Credencial
                </h3>
                <p className="text-gray-600 text-sm">Actualizar una credencial existente</p>
              </div>
            </Link>

            {/* Bitácora - Solo para admin */}
            {user?.rol === "admin" && (
              <Link href="/bitacora" passHref>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    Bitácora
                  </h3>
                  <p className="text-gray-600 text-sm">Ver historial y gestionar credenciales</p>
                </div>
              </Link>
            )}

            {/* Gestión de Usuarios - Solo para admin (ahora funcional) */}
            {user?.rol === "admin" && (
              <Link href="/admin/users" passHref>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <UserGroupIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    Gestión de Usuarios
                  </h3>
                  <p className="text-gray-600 text-sm">Administrar usuarios y restablecer contraseñas</p>
                </div>
              </Link>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}

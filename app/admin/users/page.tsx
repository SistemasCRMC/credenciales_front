"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, KeyIcon, UserIcon } from "@heroicons/react/24/outline"
import axios from "axios"
import { getUserFromStorage } from "@/lib/auth"

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

export default function AdminUserManagementPage() {
    const [userId, setUserId] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const router = useRouter()

    // Función para manejar cambios en el ID del usuario
    const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // 1. Filtrar solo números
        const filteredValue = value.replace(/[^0-9]/g, "")

        // 2. Limitar a 4 caracteres
        const limitedValue = filteredValue.slice(0, 4)

        // 3. Asegurar que no sea negativo y que sea al menos 1 si no está vacío
        let finalValue = limitedValue
        if (limitedValue !== "") {
            const num = Number.parseInt(limitedValue, 10)
            if (isNaN(num) || num < 1) {
                finalValue = "1" // Si es 0 o negativo, establecer a 1
            }
        }
        setUserId(finalValue)
    }

    // Función para validar solo números en el evento keydown (para flechas y otros)
    const handleNumbersOnlyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const char = e.key
        // Permitir teclas de control (backspace, delete, arrow keys, tab, enter)
        if (
            char.length === 1 &&
            !/[0-9]/.test(char) &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey &&
            char !== "Backspace" &&
            char !== "Delete" &&
            char !== "ArrowLeft" &&
            char !== "ArrowRight" &&
            char !== "Tab" &&
            char !== "Enter"
        ) {
            e.preventDefault()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess("")

        const adminUser = getUserFromStorage()
        if (!adminUser || adminUser.rol !== "admin") {
            setError("No tienes permisos de administrador para realizar esta acción.")
            setIsLoading(false)
            return
        }

        // Validar userId después de la limpieza y limitación
        if (!userId || Number.parseInt(userId, 10) < 1) {
            setError("Por favor, ingresa un ID de usuario válido (número positivo).")
            setIsLoading(false)
            return
        }

        if (!newPassword || !confirmNewPassword) {
            setError("Por favor, completa todos los campos de contraseña.")
            setIsLoading(false)
            return
        }
        if (newPassword !== confirmNewPassword) {
            setError("Las contraseñas no coinciden.")
            setIsLoading(false)
            return
        }
        if (newPassword.length < 8 || newPassword.length > 24) {
            setError("La nueva contraseña debe tener entre 8 y 24 caracteres.")
            setIsLoading(false)
            return
        }

        try {
            const response = await axios.post(`${API_URL}/admin/users/${userId}/reset-password`, {
                newPassword,
                adminUserId: adminUser.id, // Enviamos el ID del admin para verificación en el backend
            })

            if (response.status === 200) {
                setSuccess("Contraseña restablecida exitosamente para el usuario " + userId)
                setUserId("")
                setNewPassword("")
                setConfirmNewPassword("")
            }
        } catch (err: any) {
            console.error("Error al restablecer contraseña:", err)
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else if (err.response?.status === 403) {
                setError("Acceso denegado. Asegúrate de tener permisos de administrador.")
            } else if (err.response?.status === 404) {
                setError("Usuario no encontrado con el ID proporcionado.")
            } else {
                setError("Error de conexión o interno del servidor.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <RouteGuard requiredRole="admin">
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <main className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-red-700 mb-2">Gestión de Usuarios</h1>
                            <p className="text-gray-600">Restablecer contraseñas de usuarios</p>
                        </div>
                        <Link href="/dashboard" passHref>
                            <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Regresar
                            </Button>
                        </Link>
                    </div>
                    <Card className="w-full max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Restablecer Contraseña de Usuario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                                        {success}
                                    </div>
                                )}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="number" // Mantener type="number" para las flechas, pero la lógica de onChange lo controlará
                                        placeholder="ID del Usuario"
                                        value={userId}
                                        onChange={handleUserIdChange} // Usar la nueva función de manejo
                                        onKeyDown={handleNumbersOnlyKeyDown} // Prevenir caracteres no numéricos
                                        required
                                        min="1" // Hint para el navegador, la lógica de onChange es la principal
                                        maxLength={4} // Hint para el navegador, la lógica de onChange es la principal
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <KeyIcon className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Nueva Contraseña"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        maxLength={24}
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <KeyIcon className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Confirmar Nueva Contraseña"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        maxLength={24}
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                                    {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </RouteGuard>
    )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserFromStorage, hasPermission } from "@/lib/auth"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

interface RouteGuardProps {
    children: React.ReactNode
    requiredRole?: "usuario" | "admin"
    redirectTo?: string
}

export function RouteGuard({ children, requiredRole = "usuario", redirectTo = "/" }: RouteGuardProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAccess = () => {
            const user = getUserFromStorage()

            if (!user) {
                // No está autenticado
                router.push(redirectTo)
                return
            }

            if (!hasPermission(requiredRole)) {
                // No tiene permisos suficientes
                router.push("/dashboard") // Redirigir al dashboard
                return
            }

            setHasAccess(true)
            setIsLoading(false)
        }

        checkAccess()
    }, [requiredRole, redirectTo, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 mb-3 animate-spin" />
                    <p className="text-gray-600">Verificando permisos...</p>
                </div>
            </div>
        )
    }

    if (!hasAccess) {
        return null // El useEffect ya manejó la redirección
    }

    return <>{children}</>
}

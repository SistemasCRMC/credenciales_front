"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserCircleIcon, Bars3Icon } from "@heroicons/react/24/outline"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUserFromStorage } from "@/lib/auth"

export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; rol: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Obtener información del usuario del localStorage
    const userData = getUserFromStorage()
    if (userData) {
      setUser({
        name: userData.nombre,
        email: userData.correo,
        rol: userData.rol,
      })
    } else {
      // Si no hay usuario, redirigir al login
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return null // O un loading spinner
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Espacio para la imagen */}
            <div className="w-60 h-8 flex items-center justify-start">
              <img src="/images/logo-block.png" alt="Logo" className="transform -translate-x-2" />
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="text-sm">
                {/* Se muestra el nombre del usuario, con un fallback a 'Usuario' si está vacío */}
                <p className="font-medium text-gray-900">{user.name || "Usuario"}</p>
                <p className="text-gray-500">{user.rol === "admin" ? "Administrador" : "Empleado"}</p>
              </div>
            </div>
            {/* Botón de Cerrar Sesión con icono de lucide-react */}
            <Button variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Bars3Icon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

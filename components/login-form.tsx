"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"

interface LoginFormProps {
  onRegisterClick: () => void
}

// Añadir "/api" al final de la URL del backend
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

export function LoginForm({ onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.")
      setIsLoading(false)
      return
    }

    // Validar longitud de la contraseña
    if (password.length < 8 || password.length > 24) {
      setError("La contraseña debe tener entre 8 y 24 caracteres.")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        correo: email,
        contrasena: password,
      })

      console.log("Respuesta completa del backend al login:", response) // Log de la respuesta completa
      console.log("Datos de la respuesta del backend:", response.data) // Log de response.data

      if (response.data.success) {
        // Guardar información de sesión
        const userData = {
          id: response.data.user.id,
          nombre: response.data.user.name, // Mapear 'name' del backend a 'nombre'
          correo: response.data.user.email, // Mapear 'email' del backend a 'correo'
          rol: response.data.user.rol,
        }
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", response.data.token)
        console.log("Datos guardados en localStorage:", {
          user: localStorage.getItem("user"),
          token: localStorage.getItem("token"),
        })
        console.log("Login exitoso, intentando redirigir a /dashboard...")
        // Redirigir al dashboard
        router.push("/dashboard")
      } else {
        setError(response.data.message || "Error al iniciar sesión")
        console.log("Login fallido según el backend:", response.data.message)
      }
    } catch (error: any) {
      console.error("Error en login (catch block):", error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.response?.status === 401) {
        setError("Credenciales incorrectas")
      } else if (error.response?.status === 500) {
        setError("Error del servidor. Intenta más tarde.")
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-400">
              <EnvelopeIcon className="h-5 w-5" />
            </div>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={40}
              className="pl-10 border-red-200 focus:border-red-500 focus:ring-red-500 shadow-sm bg-white/80"
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-400">
              <LockClosedIcon className="h-5 w-5" />
            </div>
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={24}
              className="pl-10 border-red-200 focus:border-red-500 focus:ring-red-500 shadow-sm bg-white/80"
              disabled={isLoading}
            />
          </div>

        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
        <div className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <button
            type="button" // Importante: Cambiar a type="button" para evitar que envíe el formulario
            onClick={onRegisterClick}
            className="font-medium text-red-600 hover:text-red-800"
            disabled={isLoading}
          >
            Regístrate ahora
          </button>
        </div>
      </form>
    </div>
  )
}

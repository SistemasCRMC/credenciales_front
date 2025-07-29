"use client"

import type React from "react"
import { useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"

interface RegisterFormProps {
  onLoginClick: () => void
}

// Añadir "/api" al final de la URL del backend
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

export function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Función para validar solo letras y espacios
  const handleLettersOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key
    if (char.length === 1 && !/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(char)) {
      e.preventDefault()
    }
  }

  // Función para manejar cambios en campos de solo letras
  const handleLettersChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
    setName(filteredValue)
  }

  // Función para validar solo números
  const handleNumbersOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key
    if (char.length === 1 && !/[0-9]/.test(char)) {
      e.preventDefault()
    }
  }

  // Función para manejar cambios en campos de solo números
  const handleNumbersChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const filteredValue = value.replace(/[^0-9]/g, "")
    setPhone(filteredValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.")
      setIsLoading(false)
      return
    }

    // Validar longitud del teléfono
    if (phone.length !== 10) {
      setError("El número de teléfono debe tener exactamente 10 dígitos.")
      setIsLoading(false)
      return
    }

    console.log("Intentando registrar usuario en:", `${API_URL}/auth/register`)
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        nombre: name,
        correo: email,
        telefono: phone,
        contrasena: password,
      })

      if (response.data.success) {
        // Guardar información de sesión (aunque en registro no se suele loguear automáticamente)
        // Si el backend devuelve user y token, se pueden guardar.
        // En tu `app/api/auth/register/route.ts` actual, no se devuelve `user` ni `token` en la respuesta de éxito.
        // Si quieres que el usuario se loguee automáticamente, necesitarías modificar esa ruta.
        // Por ahora, solo se redirige al login.
        console.log("Registro exitoso, redirigiendo a login...")
        onLoginClick() // Voltear al formulario de login
      } else {
        setError(response.data.message || "Error al registrarse")
      }
    } catch (error: any) {
      console.error("Error en registro:", error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.response?.status === 409) {
        setError("El correo electrónico ya está registrado")
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
              <UserIcon className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={handleLettersChange}
              onKeyDown={handleLettersOnly}
              required
              maxLength={32}
              className="pl-10 border-red-200 focus:border-red-500 focus:ring-red-500 shadow-sm bg-white/80"
              disabled={isLoading}
            />
          </div>
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
              <PhoneIcon className="h-5 w-5" />
            </div>
            <Input
              type="tel"
              placeholder="Ej. 9981234567"
              value={phone}
              onChange={handleNumbersChange}
              onKeyDown={handleNumbersOnly}
              required
              maxLength={10}
              inputMode="numeric"
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-400">
              <LockClosedIcon className="h-5 w-5" />
            </div>
            <Input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              maxLength={24}
              className="pl-10 border-red-200 focus:border-red-500 focus:ring-red-500 shadow-sm bg-white/80"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrarse"}
        </Button>
        <div className="text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <button
            type="button" // Importante: Cambiar a type="button" para evitar que envíe el formulario
            onClick={onLoginClick}
            className="font-medium text-red-600 hover:text-red-800"
            disabled={isLoading}
          >
            Iniciar sesión
          </button>
        </div>
      </form>
    </div>
  )
}

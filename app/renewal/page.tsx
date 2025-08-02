"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MagnifyingGlassIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import { CredentialDesigner, type CredentialData } from "@/components/credential-designer"
import axios from "axios"

interface Credential {
  id: string
  name: string
}

// Añadir "/api" al final de la URL del backend
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem("token")
}

// Función para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
}

// Función para convertir los datos del backend al formato CredentialData
const convertBackendToCredentialData = (backendData: any): CredentialData => {
  return {
    name: backendData.nombre_completo || "",
    photo: backendData.fotografia_url || "/placeholder.svg?height=200&width=200",
    area: backendData.area || "SERVICIOS MEDICOS",
    position: "",
    delegation: "DELEGACION CANCUN",
    vigencia: backendData.vigencia || "2026",
    areaColor: backendData.color_area || "#2563eb",
    emergencyContact: backendData.contacto_emergencia || "",
    parentesco: backendData.parentesco || "",
    telefono: backendData.telefono_emergencia || "",
    tipoSangre: backendData.tipo_sangre || "O+",
    alergias: backendData.alergias || "",
    curp: backendData.curp || "",
    showPrinciples: true,
    credentialId: backendData.id || null,
    qrCodeUrl: backendData.qr_codigo_url || undefined,
    miembroDesde: backendData.miembro_desde || "",
  }
}

const RenewalPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [foundCredential, setFoundCredential] = useState<CredentialData | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    setSearchError(null)
    setFoundCredential(null)
    setIsSearching(true)

    const term = searchTerm.trim()
    if (!term) {
      setSearchError("Por favor, ingresa un nombre o ID para buscar.")
      setIsSearching(false)
      return
    }

    try {
      const response = await axios.get(
        `${API_URL}/credentials/search?term=${encodeURIComponent(term)}`,
        getAuthHeaders(),
      )

      if (response.status === 200) {
        const credentialsFound = response.data

        if (credentialsFound && Array.isArray(credentialsFound) && credentialsFound.length > 0) {
          const backendCredential = credentialsFound[0]
          const convertedCredential = convertBackendToCredentialData(backendCredential)
          setFoundCredential(convertedCredential)
        } else {
          setSearchError("No se encontró ninguna credencial con ese nombre o ID.")
        }
      } else {
        setSearchError(response.data?.message || "Error inesperado al buscar credencial.")
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setSearchError(error.response.data.message)
      } else if (error.response?.status === 401) {
        setSearchError("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else if (error.response?.status === 404) {
        setSearchError("No se encontró ninguna credencial con ese nombre o ID.")
      } else if (error.response?.status === 500) {
        setSearchError("Error del servidor. Intenta más tarde.")
      } else {
        setSearchError("Error de conexión. Verifica tu conexión a internet.")
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleCredentialUpdate = async (updatedData: CredentialData): Promise<CredentialData> => {
    try {
      const userDataString = localStorage.getItem("user")
      let usuario_id: number | null = null
      let userEmail: string | null = null

      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString)
          usuario_id = userData.id
          userEmail = userData.email
        } catch (e) {
          console.error("Error al parsear user data de localStorage:", e)
          alert("Error interno: No se pudo obtener la información del usuario.")
          return {
            ...updatedData,
            miembroDesde: updatedData.miembroDesde || "",
          }
        }
      } else {
        alert("No se pudo actualizar la credencial: Usuario no autenticado. Por favor, inicia sesión.")
        return {
          ...updatedData,
          miembroDesde: updatedData.miembroDesde || "",
        }
      }

      const backendData = {
        nombre_completo: updatedData.name,
        correo: userEmail || null,
        area: updatedData.area,
        color_area: updatedData.areaColor,
        vigencia: updatedData.vigencia,
        contacto_emergencia: updatedData.emergencyContact || null,
        parentesco: updatedData.parentesco || null,
        telefono_emergencia: updatedData.telefono || null,
        tipo_sangre: updatedData.tipoSangre || null,
        alergias: updatedData.alergias || null,
        curp: updatedData.curp || null,
        fotografia_base64: updatedData.photo && updatedData.photo.startsWith("data:") ? updatedData.photo : null,
        fotografia_url_current:
          updatedData.photo && updatedData.photo.startsWith("http")
            ? updatedData.photo
            : updatedData.photo === "/placeholder.svg?height=200&width=200"
            ? null
            : updatedData.photo,
        usuario_id: usuario_id,
      }

      const response = await axios.put(
        `${API_URL}/credentials/${updatedData.credentialId}`,
        backendData,
        getAuthHeaders(),
      )

      if (response.status === 200) {
        const updatedCredential = {
          ...updatedData,
          photo: response.data.fotografia_url || updatedData.photo,
          qrCodeUrl: response.data.qr_codigo_url || updatedData.qrCodeUrl,
        }

        setFoundCredential(updatedCredential)
        return updatedCredential
      } else {
        alert("Error al actualizar la credencial: " + (response.data.message || "Error desconocido"))
        throw new Error(response.data.message || "Error desconocido")
      }
    } catch (error: any) {
      console.error("Error al actualizar credencial:", error)
      let errorMessage = "Error al actualizar la credencial"
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente."
      } else if (error.response?.status === 500) {
        errorMessage = "Error del servidor. Intenta más tarde."
      }
      alert(errorMessage)

      return {
        ...updatedData,
        miembroDesde: updatedData.miembroDesde || "",
      }
    }
  }

  return (
    <RouteGuard requiredRole="usuario">
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-red-700">Renovación de Credenciales</h1>
            <Link href="/dashboard" passHref>
              <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Regresar
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Buscar Credencial Existente</h3>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar por Nombre, CURP o ID de Credencial"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                  disabled={isSearching}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 text-white px-8"
                disabled={isSearching}
              >
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {searchError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mt-3">
                {searchError}
              </div>
            )}
            {foundCredential && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm mt-3">
                ✓ Credencial encontrada: <strong>{foundCredential.name}</strong> (ID: {foundCredential.credentialId})
              </div>
            )}
          </div>

          {foundCredential ? (
            <div className="max-w-7xl mx-auto pt-0">
              <CredentialDesigner initialData={foundCredential} onSave={handleCredentialUpdate} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Ingresa un término de búsqueda para encontrar una credencial.</p>
              <p className="text-sm mt-2">Puedes buscar por nombre completo, CURP o ID de credencial.</p>
            </div>
          )}
        </main>
      </div>
    </RouteGuard>
  )
}

export default RenewalPage


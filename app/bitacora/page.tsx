"use client"
import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  DocumentIcon,
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import axios from "axios"
import Link from "next/link"
import { DebouncedSearchInput } from "@/components/debounced-search-input" // Importar el nuevo componente

interface LogRecord {
  id: string
  fecha: string
  hora: string
  usuario: string
  iniciales: string
  accion: "emision" | "renovacion"
  credencial: string
  credencial_id: number
  credencial_estado: "emitida" | "renovada" | "deshabilitada"
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

const RECORDS_PER_PAGE = 12

export default function BitacoraPage() {
  const [searchTerm, setSearchTerm] = useState("") // Término de búsqueda real (debounced)
  const [filterAction, setFilterAction] = useState<"todas" | "emision" | "renovacion">("todas")
  const [filterDate, setFilterDate] = useState("")
  const [allRecords, setAllRecords] = useState<LogRecord[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Calcular registros paginados
  const totalPages = Math.ceil(allRecords.length / RECORDS_PER_PAGE)
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE
  const endIndex = startIndex + RECORDS_PER_PAGE
  const paginatedRecords = allRecords.slice(startIndex, endIndex)

  // Función para cargar los registros desde el backend
  const loadRecords = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (filterAction !== "todas") params.append("action", filterAction)
      if (filterDate) params.append("date", filterDate)

      const response = await axios.get(`${API_URL}/bitacora?${params.toString()}`, getAuthHeaders())
      setAllRecords(response.data || [])
      setCurrentPage(1) // Reset to first page when filters change
    } catch (error: any) {
      console.error("Error al cargar registros:", error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.response?.status === 401) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else if (error.response?.status === 500) {
        setError("Error del servidor. Intenta más tarde.")
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, filterAction, filterDate]) // Dependencias para useCallback

  // Cargar registros al montar el componente y cuando cambian los filtros principales
  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Usar useCallback para envolver setSearchTerm y asegurar que sea una función estable
  const handleDebouncedSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleDisableCredential = async (credencial_id: number, nombre_completo: string) => {
    if (!confirm(`¿Estás seguro de que quieres deshabilitar la credencial de ${nombre_completo}?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await axios.post(
        `${API_URL}/credentials/disable`,
        {
          credencial_id,
          usuario_id: userData.id,
        },
        getAuthHeaders(),
      )

      if (response.status === 200) {
        loadRecords() // Recargar los registros
        alert("Credencial deshabilitada exitosamente")
      }
    } catch (error: any) {
      console.error("Error al deshabilitar credencial:", error)
      alert(error.response?.data?.message || "Error al deshabilitar la credencial")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEnableCredential = async (credencial_id: number, nombre_completo: string) => {
    if (!confirm(`¿Estás seguro de que deseas habilitar la credencial de ${nombre_completo}?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await axios.post(
        `${API_URL}/credentials/enable`,
        {
          credencial_id,
          usuario_id: userData.id,
        },
        getAuthHeaders(),
      )

      if (response.status === 200) {
        loadRecords() // Recargar los registros
        alert("Credencial habilitada exitosamente")
      }
    } catch (error: any) {
      console.error("Error al rehabilitar credencial:", error)
      alert(error.response?.data?.message || "Error al habilitar la credencial")
    } finally {
      setIsProcessing(false)
    }
  }

  const getActionBadge = (action: LogRecord["accion"]) => {
    switch (action) {
      case "emision":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <DocumentIcon className="h-3 w-3 mr-1" />
            Emisión
          </span>
        )
      case "renovacion":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Renovación
          </span>
        )
    }
  }

  const getStatusBadge = (estado: LogRecord["credencial_estado"]) => {
    switch (estado) {
      case "emitida":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activa
          </span>
        )
      case "renovada":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activa
          </span>
        )
      case "deshabilitada":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Deshabilitada
          </span>
        )
    }
  }

  const getUserInitialsColor = (iniciales: string) => {
    const colors = [
      "bg-red-100 text-red-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600",
      "bg-orange-100 text-orange-600",
    ]
    const index = iniciales.charCodeAt(0) % colors.length
    return colors[index]
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-red-700 mb-2">Bitácora de Registros</h1>
              <p className="text-gray-600">Consulta el historial de emisión y renovación de credenciales del sistema</p>
            </div>
            <Link href="/dashboard" passHref>
              <Button variant="outline" className="bg-transparent text-red-600 hover:bg-red-50 border-red-600">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Regresar
              </Button>
            </Link>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>
          )}

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <DebouncedSearchInput
                placeholder="Buscar por Nombre o ID"
                onDebouncedChange={handleDebouncedSearchChange} // Usamos la función memoizada
                initialValue={searchTerm} // Asegura que el input se inicialice con el searchTerm actual
              />
              <div className="flex gap-3">
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500 text-sm bg-white min-w-[160px]"
                  disabled={isLoading}
                >
                  <option value="todas">Todas las acciones</option>
                  <option value="emision">Solo emisiones</option>
                  <option value="renovacion">Solo renovaciones</option>
                </select>
                <div className="relative">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500 text-sm bg-white"
                    placeholder="dd/mm/aaaa"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={loadRecords} // Ahora loadRecords se llama directamente
                  variant="outline"
                  className="bg-white border-gray-300 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  {isLoading ? "Cargando..." : "Actualizar"}
                </Button>
              </div>
            </div>
            {/* Indicador de búsqueda activa */}
            {searchTerm && (
              <div className="mt-3 text-sm text-gray-600">
                Buscando: "<span className="font-medium text-gray-900">{searchTerm}</span>" - {allRecords.length}{" "}
                resultado(s) encontrado(s)
              </div>
            )}
          </div>

          {/* Tabla de registros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
                  <p className="text-lg font-medium">Cargando registros...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha y Hora
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credencial
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRecords.length > 0 ? (
                        paginatedRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{record.fecha}</div>
                              <div className="text-sm text-gray-500">{record.hora}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${getUserInitialsColor(
                                      record.iniciales,
                                    )}`}
                                  >
                                    {record.iniciales}
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{record.usuario}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(record.accion)}</td>
                            <td className="px-6 py-4">
                              <div
                                className="text-sm font-medium text-gray-900 max-w-xs truncate"
                                title={record.credencial}
                              >
                                {record.credencial}
                              </div>
                              <div className="text-xs text-gray-500">ID: {record.credencial_id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.credencial_estado)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {record.credencial_estado === "deshabilitada" ? (
                                <Button
                                  onClick={() => handleEnableCredential(record.credencial_id, record.credencial)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={isProcessing}
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Habilitar
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleDisableCredential(record.credencial_id, record.credencial)}
                                  size="sm"
                                  variant="destructive"
                                  disabled={isProcessing}
                                >
                                  <XCircleIcon className="h-4 w-4 mr-1" />
                                  Deshabilitar
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-12">
                            <div className="text-gray-500">
                              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-lg font-medium">No se encontraron registros</p>
                              <p className="mt-1">
                                {searchTerm || filterAction !== "todas" || filterDate
                                  ? "Intenta ajustar los filtros de búsqueda"
                                  : "No hay registros disponibles"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Footer con paginación */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{Math.min(endIndex, allRecords.length) - startIndex}</span> de{" "}
                        <span className="font-medium">{allRecords.length}</span> registros
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className="bg-white"
                        >
                          <ChevronLeftIcon className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        {/* Números de página */}
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber
                            if (totalPages <= 5) {
                              pageNumber = i + 1
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i
                            } else {
                              pageNumber = currentPage - 2 + i
                            }
                            return (
                              <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(pageNumber)}
                                className={currentPage === pageNumber ? "bg-red-600 hover:bg-red-700" : "bg-white"}
                              >
                                {pageNumber}
                              </Button>
                            )
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="bg-white"
                        >
                          Siguiente
                          <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
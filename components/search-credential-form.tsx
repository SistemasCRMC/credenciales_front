"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Credential {
    id: number
    nombre_completo: string
    area: string
    vigencia: string
    // Añade más campos de credencial según tu esquema
}

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

export function SearchCredentialForm() {
    const [searchTerm, setSearchTerm] = useState("")
    const [results, setResults] = useState<Credential[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("") // Limpiar errores anteriores
        setResults([]) // Limpiar resultados anteriores
        setLoading(true)

        console.log("Frontend: Iniciando búsqueda para el término:", searchTerm)
        console.log("Frontend: URL de la API:", `${API_URL}/credentials/search?term=${encodeURIComponent(searchTerm)}`)

        if (!searchTerm.trim()) {
            setError("Por favor, ingresa un término de búsqueda.")
            setLoading(false)
            console.log("Frontend: Término de búsqueda vacío.")
            return
        }

        try {
            const response = await axios.get(`${API_URL}/credentials/search?term=${encodeURIComponent(searchTerm)}`)
            console.log("Frontend: Respuesta exitosa del backend:", response.status, response.data)

            if (response.status === 200) {
                setResults(response.data)
                console.log("Frontend: Resultados actualizados:", response.data)
                if (response.data.length === 0) {
                    setError("No se encontraron resultados para tu búsqueda.")
                }
            } else {
                // Esto no debería ocurrir si el backend devuelve 200, pero es una buena práctica
                setError(response.data?.message || "Error inesperado al buscar credenciales.")
                console.error("Frontend: Respuesta no 200:", response.status, response.data)
            }
        } catch (err: any) {
            console.error("Frontend: Error en la solicitud Axios:", err)
            if (err.response) {
                // El servidor respondió con un código de estado fuera del rango 2xx
                console.error("Frontend: Error de respuesta del servidor:", err.response.data)
                console.error("Frontend: Código de estado:", err.response.status)
                setError(err.response.data?.message || `Error del servidor: ${err.response.status}`)
            } else if (err.request) {
                // La solicitud fue hecha pero no se recibió respuesta
                console.error("Frontend: No se recibió respuesta del servidor:", err.request)
                setError("No se pudo conectar con el servidor. Verifica tu conexión o la URL del backend.")
            } else {
                // Algo más causó el error
                console.error("Frontend: Error al configurar la solicitud:", err.message)
                setError(`Error: ${err.message}`)
            }
        } finally {
            setLoading(false)
            console.log("Frontend: Búsqueda finalizada.")
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Buscar Credencial para Renovación</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, CURP o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Buscando..." : "Buscar"}
                    </Button>
                </form>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {results.length > 0 ? (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Resultados:</h3>
                        {results.map((cred) => (
                            <div key={cred.id} className="p-3 border rounded-md bg-gray-50">
                                <p className="font-medium">
                                    {cred.nombre_completo} (ID: {cred.id})
                                </p>
                                <p className="text-sm text-gray-600">
                                    Área: {cred.area} | Vigencia: {cred.vigencia}
                                </p>
                                {/* Puedes añadir un botón para seleccionar la credencial aquí */}
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading &&
                    !error &&
                    searchTerm.trim() && <p className="text-gray-500 text-sm">No se encontraron resultados.</p>
                )}
            </CardContent>
        </Card>
    )
}

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CredentialFront } from "@/components/credential-front"
import {
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline"
import axios from "axios"

interface CredentialData {
    name: string
    photo: string
    area: string
    position: string
    delegation: string
    vigencia: string
    areaColor: string
    emergencyContact: string
    parentesco: string
    telefono: string
    tipoSangre: string
    alergias: string
    curp: string
    showPrinciples: boolean
    credentialId: number | null
    estado: "emitida" | "renovada" | "deshabilitada"
    miembroDesde: string  // agregado
}

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

// Función para convertir los datos del backend al formato CredentialData
const convertBackendToCredentialData = (backendData: any): CredentialData => {
    return {
        name: backendData.nombre_completo || "",
        photo: backendData.fotografia_url || "/placeholder.svg?height=200&width=200",
        area: backendData.area || "SERVICIOS MEDICOS",
        position: "", // Este campo no existe en el backend
        delegation: "DELEGACION CANCUN", // Valor por defecto
        vigencia: backendData.vigencia || "2025",
        areaColor: backendData.color_area || "#2563eb",
        emergencyContact: backendData.contacto_emergencia || "",
        parentesco: backendData.parentesco || "",
        telefono: backendData.telefono_emergencia || "",
        tipoSangre: backendData.tipo_sangre || "O+",
        alergias: backendData.alergias || "",
        curp: backendData.curp || "",
        showPrinciples: true,
        credentialId: backendData.id || null,
        estado: backendData.estado || "emitida",
        miembroDesde: backendData.miembro_desde || "",  // agregado
    }
}

export default function ValidacionPage() {
    const params = useParams()
    const credentialId = params.id as string

    const [credential, setCredential] = useState<CredentialData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [isExpired, setIsExpired] = useState<boolean>(false)

    useEffect(() => {
        const validateCredential = async () => {
            if (!credentialId) {
                setError("ID de credencial no válido")
                setIsLoading(false)
                return
            }

            try {
                const response = await axios.get(`${API_URL}/credentials/${credentialId}`)

                if (response.status === 200) {
                    const credentialData = convertBackendToCredentialData(response.data)
                    setCredential(credentialData)

                    const currentYear = new Date().getFullYear()
                    const vigenciaYear = Number.parseInt(credentialData.vigencia)

                    // Verificar si la credencial está deshabilitada
                    if (credentialData.estado === "deshabilitada") {
                        setIsDisabled(true)
                        setIsValid(false)
                        setError("Credencial deshabilitada")
                    }
                    // Verificar si la credencial está vencida
                    else if (vigenciaYear < currentYear) {
                        setIsExpired(true)
                        setIsValid(false)
                        setError("Credencial vencida")
                    }
                    // Credencial válida
                    else {
                        setIsValid(true)
                        setIsDisabled(false)
                        setIsExpired(false)
                    }
                } else {
                    setError("Credencial no encontrada")
                    setIsValid(false)
                }
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setError("Credencial no encontrada")
                    setIsValid(false)
                } else {
                    setError("Error de conexión")
                    setIsValid(false)
                }
            } finally {
                setIsLoading(false)
            }
        }

        validateCredential()
    }, [credentialId])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 mb-3 animate-spin" />
                    <p className="text-gray-600">Validando credencial...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header simple */}
                <div className="text-center mb-8">
                </div>

                {/* Status */}
                <div className="mb-8">
                    <div
                        className={`rounded-lg p-4 text-center ${isExpired
                            ? "bg-yellow-100 text-yellow-800"
                            : isDisabled
                                ? "bg-orange-100 text-orange-800"
                                : isValid
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                    >
                        {isExpired ? (
                            <div className="flex items-center justify-center">
                                <ClockIcon className="h-5 w-5 mr-2" />
                                <span className="font-medium">Credencial Vencida</span>
                            </div>
                        ) : isDisabled ? (
                            <div className="flex items-center justify-center">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                <span className="font-medium">Credencial Deshabilitada</span>
                            </div>
                        ) : isValid ? (
                            <div className="flex items-center justify-center">
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                <span className="font-medium">Credencial Válida</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <XCircleIcon className="h-5 w-5 mr-2" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Credencial */}
                {credential && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex justify-center mb-4">
                            <div className={isDisabled || isExpired ? "filter grayscale opacity-60" : ""}>
                                <CredentialFront data={{ ...credential, miembroDesde: credential.miembroDesde || "" }} />
                            </div>
                        </div>

                        {/* Info básica */}
                        <div className="text-center space-y-2 text-sm text-gray-600">
                            <p>
                                <span className="font-medium">ID:</span> {credential.credentialId}
                            </p>
                            <p>
                                <span className="font-medium">Vigencia:</span>{" "}
                                <span className={isExpired ? "text-yellow-600 font-medium" : "text-gray-900"}>
                                    {credential.vigencia}
                                    {isExpired && " (Vencida)"}
                                </span>
                            </p>
                            <p>
                                <span className="font-medium">Estado:</span>{" "}
                                <span
                                    className={
                                        isExpired
                                            ? "text-yellow-600"
                                            : isDisabled
                                                ? "text-orange-600"
                                                : credential.estado === "renovada"
                                                    ? "text-blue-600"
                                                    : "text-green-600"
                                    }
                                >
                                    {isExpired
                                        ? "Vencida"
                                        : isDisabled
                                            ? "Deshabilitada"
                                            : credential.estado === "renovada"
                                                ? "Renovada"
                                                : "Vigente"}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer simple */}
                <div className="text-center mt-8 text-xs text-gray-500">
                    <p>© Cruz Roja Mexicana · Delegación Cancún · Todos los derechos reservados</p>
                </div>
            </div>
        </div>
    )
}

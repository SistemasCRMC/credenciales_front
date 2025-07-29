"use client"

import { useState, useEffect } from "react"
import { CredentialFront } from "@/components/credential-front"
import { CredentialBack } from "@/components/credential-back"
import { CredentialEditor } from "@/components/credential-editor"
import { PrinterIcon, DocumentDuplicateIcon, EyeIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { createRoot } from "react-dom/client"
import axios from "axios"

export interface CredentialData {
  name: string
  photo: string // Esto contendrá la URL de la imagen o la cadena base64 temporalmente
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
  miembroDesde: string // Campo corregido a español
  showPrinciples: boolean
  credentialId: number | null
  qrCodeUrl?: string // Nueva propiedad para la URL del QR
}

const areaColors = {
  VOLUNTARIADO: "#d60000",
  ADMINISTRACIÓN: "#b1b1b1",
  COMUNICACIÓN: "#b1b1b1",
  "INSTITUTO UNIVERSITARIO": "#0f843e",
  NATACIÓN: "#0f843e",
  CAPACITACIÓN: "#0f843e",
  SOCORROS: "#f79021",
  DAMAS: "#004aad",
  VETERANOS: "#004aad",
  JUVENTUD: "#004aad",
  "SERVICIOS MÉDICOS": "#319dd1",
  PREVENCIÓN: "#fac30b",
  "APOYO PSICOSOCIAL": "#7e4b96",
  MIGRACIÓN: "#5c183b",
}

// Define el estado inicial vacío de una credencial
const EMPTY_CREDENTIAL_DATA: CredentialData = {
  name: "",
  photo: "/placeholder.svg?height=200&width=200",
  area: "SERVICIOS MÉDICOS",
  position: "",
  delegation: "DELEGACION CANCUN",
  vigencia: "2025",
  areaColor: areaColors["SERVICIOS MÉDICOS"],
  emergencyContact: "",
  parentesco: "",
  telefono: "",
  tipoSangre: "O+",
  alergias: "",
  curp: "",
  miembroDesde: "", // Inicializar el nuevo campo en español
  showPrinciples: true,
  credentialId: null,
  qrCodeUrl: undefined,
}

interface CredentialDesignerProps {
  initialData?: CredentialData
  onSave?: (data: CredentialData) => Promise<CredentialData | void> // Modificado para permitir Promise<void>
}

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

const getAuthToken = () => {
  return localStorage.getItem("token")
}

const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

export function CredentialDesigner({ initialData, onSave }: CredentialDesignerProps) {
  const [credentialData, setCredentialData] = useState<CredentialData>(initialData || EMPTY_CREDENTIAL_DATA)
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front")
  const [savedCredentials, setSavedCredentials] = useState<CredentialData[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    if (initialData) {
      setCredentialData(initialData)
    }
  }, [initialData])

  const updateCredentialData = (field: keyof CredentialData, value: string | boolean | number | null) => {
    setCredentialData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "area" && typeof value === "string") {
        const newColor = areaColors[value as keyof typeof areaColors] || "#dc2626"
        updated.areaColor = newColor
      }
      return updated
    })
  }

  const saveCredential = async (): Promise<CredentialData | undefined> => {
    setIsSaving(true)
    setSaveError("")

    try {
      if (onSave) {
        // Si hay una función onSave personalizada (como en renovación), usarla
        const result = await onSave(credentialData)

        // Si onSave devuelve una credencial, usarla; si no, usar la actual
        const savedCredential = result || credentialData

        // Actualizar el estado local con la credencial guardada
        setCredentialData(savedCredential)

        return savedCredential
      } else {
        // Lógica original para crear nueva credencial
        const userDataString = localStorage.getItem("user")
        let usuario_id: number | null = null
        let userEmail: string | null = null

        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString)
            usuario_id = userData.id
            userEmail = userData.email
            console.log("Datos de usuario de localStorage:", { usuario_id, userEmail })
          } catch (e) {
            console.error("Error al parsear user data de localStorage:", e)
            setSaveError("Error interno: No se pudo obtener la información del usuario.")
            return undefined
          }
        } else {
          console.warn("No se encontró 'user' en localStorage. El usuario no está logueado.")
          setSaveError("No se pudo guardar la credencial: Usuario no autenticado. Por favor, inicia sesión.")
          return undefined
        }

        const backendData = {
          nombre_completo: credentialData.name,
          correo: userEmail,
          area: credentialData.area,
          color_area: credentialData.areaColor,
          vigencia: credentialData.vigencia,
          contacto_emergencia: credentialData.emergencyContact,
          parentesco: credentialData.parentesco,
          telefono_emergencia: credentialData.telefono,
          tipo_sangre: credentialData.tipoSangre,
          alergias: credentialData.alergias,
          curp: credentialData.curp,
          miembro_desde: credentialData.miembroDesde, // Incluir el nuevo campo en español
          fotografia_base64: credentialData.photo,
          usuario_id: usuario_id,
        }

        console.log("Datos a enviar al backend:", backendData)

        const headers = getAuthHeaders()
        console.log("Headers de autenticación:", headers)

        const response = await axios.post(`${API_URL}/credentials`, backendData, { headers })
        console.log("Respuesta del backend (POST):", response.data)

        if (response.status === 201) {
          const newCredential = {
            ...credentialData,
            credentialId: response.data.credentialId,
            photo: response.data.fotografia_url || credentialData.photo,
            qrCodeUrl: response.data.qr_codigo_url, // Añadir la URL del QR
          }
          setSavedCredentials((prev) => [...prev, newCredential])
          // Resetear el formulario a un estado vacío para la siguiente credencial
          setCredentialData(EMPTY_CREDENTIAL_DATA)
          console.log("Nueva credencial guardada y formulario reseteado:", newCredential)
          return newCredential
        } else {
          throw new Error(response.data.message || "Error al crear credencial")
        }
      }
    } catch (error: any) {
      console.error("Error al guardar credencial:", error)
      let errorMessage = "Error al guardar la credencial"
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente."
      } else if (error.response?.status === 400) {
        errorMessage = "Datos inválidos. Por favor, revisa la información ingresada."
        if (error.response?.data?.errors) {
          errorMessage += " Errores: " + JSON.stringify(error.response.data.errors)
        }
      } else if (error.response?.status === 500) {
        errorMessage = "Error del servidor. Intenta más tarde."
      } else if (error.message) {
        errorMessage = error.message
      }
      setSaveError(errorMessage)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const printCredential = async () => {
    try {
      console.log("Iniciando proceso de impresión...")

      // 1. Guardar/actualizar la credencial para asegurar que los datos (especialmente el QR) están al día.
      const savedCred = await saveCredential()

      if (!savedCred) {
        console.error("No se pudo guardar la credencial para imprimir.")
        setSaveError("No se pudo guardar la credencial antes de imprimir.")
        return
      }

      console.log("Credencial guardada/actualizada. Procediendo a renderizar para impresión:", savedCred)

      // 2. Renderizar los componentes en memoria para obtener su HTML.
      const frontContainer = document.createElement("div")
      const backContainer = document.createElement("div")
      createRoot(frontContainer).render(<CredentialFront data={savedCred} />)
      createRoot(backContainer).render(<CredentialBack data={savedCred} />)

      // 3. Esperar un breve momento para que el renderizado se complete en el contenedor virtual.
      setTimeout(() => {
        const frontHTML = frontContainer.innerHTML
        const backHTML = backContainer.innerHTML

        // 4. Recopilar todos los estilos de la aplicación.
        const appStyles = Array.from(document.styleSheets)
          .map((styleSheet) => {
            try {
              return Array.from(styleSheet.cssRules)
                .map((rule) => rule.cssText)
                .join("")
            } catch (e) {
              return ""
            }
          })
          .join("")

        // 5. Definir estilos específicos y robustos para la impresión.
        const printSpecificStyles = `
        @page {
          size: 86mm 54mm;
          margin: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 86mm;
          height: 54mm;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .print-page {
          width: 86mm;
          height: 54mm;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          page-break-after: always;
        }

        .print-page:last-child {
          page-break-after: auto;
        }

        /*
         * El componente de la credencial tiene un tamaño fijo (380x240px).
         * Lo escalamos para que quepa perfectamente en la página de 86x54mm.
         * El factor de escala se elige como el más pequeño entre el horizontal y el vertical
         * para asegurar que todo el contenido sea visible sin ser cortado.
         * (86mm ≈ 325px, 54mm ≈ 204px).
         * Escala X: 325/380 ≈ 0.855
         * Escala Y: 204/240 ≈ 0.85
         * Usamos 0.85 para asegurar que quepa, y un poco menos (0.845) para un pequeño margen.
        */
        .credential-content {
          transform: scale(0.845);
          transform-origin: center;
        }
      `

        // 6. Abrir una nueva ventana y construir el documento para imprimir.
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Imprimir Credencial</title>
              <style>${appStyles}</style>
              <style>${printSpecificStyles}</style>
            </head>
            <body>
              <div class="print-page">
                <div class="credential-content">${frontHTML}</div>
              </div>
              <div class="print-page">
                <div class="credential-content">${backHTML}</div>
              </div>
            </body>
          </html>
        `)
          printWindow.document.close()
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print()
              printWindow.close()
            }, 500) // Aumentar el delay para dar tiempo al navegador a renderizar todo.
          }
        }
      }, 200) // Aumentar el delay para asegurar que el renderizado en memoria termine.
    } catch (error) {
      console.error("Error en el proceso de impresión:", error)
      setSaveError("Ocurrió un error al preparar la credencial para impresión.")
    }
  }

  const handleSectionChange = (section: "personal" | "emergency") => {
    setCurrentSide(section === "emergency" ? "back" : "front")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto pt-0">
          <div className="order-2 lg:order-1">
            <CredentialEditor
              data={credentialData}
              onUpdate={updateCredentialData}
              areaColors={areaColors}
              onSectionChange={handleSectionChange}
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Vista Previa</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={printCredential}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={isSaving}
                    >
                      <PrinterIcon className="h-4 w-4 mr-2" />
                      {isSaving ? "Guardando..." : "Imprimir"}
                    </Button>
                  </div>
                </div>
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
                    {saveError}
                  </div>
                )}
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentSide("front")}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentSide === "front"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Frontal
                  </button>
                  <button
                    onClick={() => setCurrentSide("back")}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentSide === "back"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Trasera
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div id="credential-print-area" className="flex justify-center">
                  {currentSide === "front" ? (
                    <CredentialFront data={credentialData} />
                  ) : (
                    <CredentialBack data={credentialData} />
                  )}
                </div>
              </div>

              <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Progreso de Completado</h4>
                <div className="space-y-2">
                  {[
                    { field: "name", label: "Nombre", completed: !!credentialData.name },
                    {
                      field: "photo",
                      label: "Fotografía",
                      completed: credentialData.photo !== "/placeholder.svg?height=200&width=200",
                    },
                    { field: "emergencyContact", label: "Emergencias", completed: !!credentialData.emergencyContact },
                  ].map((item) => (
                    <div key={item.field} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <div className={`w-3 h-3 rounded-full ${item.completed ? "bg-green-500" : "bg-slate-300"}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

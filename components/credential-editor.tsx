"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  UserIcon,
  ShieldCheckIcon,
  PhotoIcon,
  TrashIcon,
  PlusIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { CredentialData } from "@/components/credential-designer"

interface CredentialEditorProps {
  data: CredentialData
  onUpdate: (field: keyof CredentialData, value: string | boolean | number | null) => void
  areaColors: Record<string, string>
  onSectionChange: (section: "personal" | "emergency") => void
}

interface CSVData {
  nombre?: string
  contacto_emergencia?: string
  parentesco?: string
  telefono?: string
  tipo_sangre?: string
  alergias?: string
  curp?: string
  miembro_desde?: string // Nuevo campo para CSV import en español
}

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001") + "/api"

export function CredentialEditor({ data, onUpdate, areaColors, onSectionChange }: CredentialEditorProps) {
  const [activeSection, setActiveSection] = useState<"personal" | "emergency">("personal")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [customAreas, setCustomAreas] = useState<{ [key: string]: string }>({})
  const [newAreaName, setNewAreaName] = useState("")
  const [newAreaColor, setNewAreaColor] = useState("#dc2626")
  const [isAddingArea, setIsAddingArea] = useState(false)
  const [csvData, setCsvData] = useState<CSVData[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const allAreas = { ...areaColors, ...customAreas }

  // Cargar áreas personalizadas del localStorage al inicializar
  useEffect(() => {
    loadCustomAreas()
  }, [])

  const loadCustomAreas = async () => {
    try {
      // Cargar áreas personalizadas desde localStorage
      const savedAreas = localStorage.getItem("customAreas")
      if (savedAreas) {
        const parsedAreas = JSON.parse(savedAreas)
        setCustomAreas(parsedAreas)
        console.log("Áreas personalizadas cargadas desde localStorage:", parsedAreas)
      }
    } catch (error) {
      console.error("Error al cargar áreas personalizadas desde localStorage:", error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onUpdate("photo", e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvText = e.target?.result as string
        parseCSV(csvText)
      }
      reader.readAsText(file)
    } else {
      alert("Por favor, selecciona un archivo CSV válido.")
    }
  }

  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "")
    if (lines.length < 2) {
      alert("El archivo CSV debe tener al menos una fila de encabezados y una fila de datos.")
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const rows = lines.slice(1)

    const parsedData: CSVData[] = rows.map((row) => {
      const values = row.split(",").map((v) => v.trim().replace(/"/g, ""))
      const rowData: CSVData = {}

      headers.forEach((header, index) => {
        const value = values[index] || ""

        // Mapear los encabezados comunes de Google Forms a nuestros campos
        if (header.includes("nombre") || header.includes("name")) {
          rowData.nombre = value.toUpperCase()
        } else if (header.includes("contacto") || header.includes("emergencia") || header.includes("emergency")) {
          rowData.contacto_emergencia = value.toUpperCase()
        } else if (header.includes("parentesco") || header.includes("relationship") || header.includes("relacion")) {
          rowData.parentesco = value.toUpperCase()
        } else if (header.includes("telefono") || header.includes("teléfono") || header.includes("phone")) {
          rowData.telefono = value.replace(/\D/g, "") // Solo números
        } else if (header.includes("sangre") || header.includes("blood")) {
          rowData.tipo_sangre = value.toUpperCase()
        } else if (header.includes("alergia") || header.includes("allergy")) {
          rowData.alergias = value.toUpperCase()
        } else if (header.includes("curp")) {
          rowData.curp = value.toUpperCase()
        } else if (header.includes("desde cuando eres miembro de la cruz roja") || header.includes("miembro desde")) {
          rowData.miembro_desde = value.replace(/\D/g, "") // Solo números para el año
        }
      })

      return rowData
    })

    setCsvData(parsedData)
    setIsImportDialogOpen(true)
  }

  const applyCSVData = (rowIndex: number) => {
    const selectedData = csvData[rowIndex]
    if (selectedData) {
      if (selectedData.nombre) onUpdate("name", selectedData.nombre)
      if (selectedData.contacto_emergencia) onUpdate("emergencyContact", selectedData.contacto_emergencia)
      if (selectedData.parentesco) onUpdate("parentesco", selectedData.parentesco)
      if (selectedData.telefono) onUpdate("telefono", selectedData.telefono)
      if (selectedData.tipo_sangre) onUpdate("tipoSangre", selectedData.tipo_sangre)
      if (selectedData.alergias) onUpdate("alergias", selectedData.alergias)
      if (selectedData.curp) onUpdate("curp", selectedData.curp)
      if (selectedData.miembro_desde) onUpdate("miembroDesde", selectedData.miembro_desde) // Aplicar el nuevo campo en español

      setIsImportDialogOpen(false)
      setCsvData([])
      setSelectedRow(null)

      // Limpiar el input file
      if (csvInputRef.current) {
        csvInputRef.current.value = ""
      }
    }
  }

  const clearField = (field: keyof CredentialData) => {
    if (field === "photo") {
      onUpdate(field, "/placeholder.svg?height=200&width=200")
    } else if (field === "credentialId") {
      onUpdate(field, null)
    } else {
      onUpdate(field, "")
    }
  }

  const handleAreaChange = (areaName: string) => {
    onUpdate("area", areaName)
    const areaColor = allAreas[areaName] || "#dc2626"
    onUpdate("areaColor", areaColor)
  }

  // Función para validar solo letras mayúsculas y espacios (sin números ni símbolos)
  const handleAreaNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key
    // Permitir teclas de control (backspace, delete, arrow keys, etc.)
    if (char.length === 1 && !/[A-ZÁÉÍÓÚÑÜa-záéíóúñü\s]/.test(char)) {
      e.preventDefault()
    }
  }

  // Función para manejar cambios en el nombre del área
  const handleAreaNameChange = (value: string) => {
    // Filtrar solo letras y espacios, convertir a mayúsculas
    const filteredValue = value.replace(/[^A-ZÁÉÍÓÚÑÜa-záéíóúñü\s]/g, "").toUpperCase()
    setNewAreaName(filteredValue)
  }

  const addCustomArea = async () => {
    if (newAreaName.trim() && !allAreas[newAreaName.trim()]) {
      const areaNameUpper = newAreaName.trim().toUpperCase()

      try {
        // Agregar al estado local
        const newAreas = { ...customAreas, [areaNameUpper]: newAreaColor }
        setCustomAreas(newAreas)

        // Guardar en localStorage
        localStorage.setItem("customAreas", JSON.stringify(newAreas))

        // Actualizar el área seleccionada Y forzar la actualización del color
        onUpdate("area", areaNameUpper)
        onUpdate("areaColor", newAreaColor) // Forzar actualización del color

        setNewAreaName("")
        setNewAreaColor("#dc2626")
        setIsAddingArea(false)

        console.log(`Área personalizada agregada y guardada en localStorage: ${areaNameUpper} - ${newAreaColor}`)
      } catch (error) {
        console.error("Error al agregar área personalizada:", error)
        // Aún así agregar al estado local si falla el localStorage
        const newAreas = { ...customAreas, [areaNameUpper]: newAreaColor }
        setCustomAreas(newAreas)

        // Intentar guardar en localStorage de nuevo
        try {
          localStorage.setItem("customAreas", JSON.stringify(newAreas))
        } catch (storageError) {
          console.error("Error al guardar en localStorage:", storageError)
        }

        onUpdate("area", areaNameUpper)
        onUpdate("areaColor", newAreaColor) // Forzar actualización del color
        setNewAreaName("")
        setNewAreaColor("#dc2626")
        setIsAddingArea(false)
      }
    }
  }

  // Función para validar solo letras y espacios
  const handleLettersOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key
    // Permitir teclas de control (backspace, delete, arrow keys, etc.)
    if (char.length === 1 && !/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(char)) {
      e.preventDefault()
    }
  }

  // Función para validar solo números
  const handleNumbersOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key
    // Permitir teclas de control y solo números
    if (char.length === 1 && !/[0-9]/.test(char)) {
      e.preventDefault()
    }
  }

  // Función para manejar cambios en campos de solo letras
  const handleLettersChange = (field: keyof CredentialData, value: string) => {
    // Filtrar solo letras, espacios y caracteres especiales del español
    const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
    onUpdate(field, filteredValue.toUpperCase())
  }

  // Función para manejar cambios en campos de solo números
  const handleNumbersChange = (field: keyof CredentialData, value: string) => {
    // Filtrar solo números
    const filteredValue = value.replace(/[^0-9]/g, "")
    // Simplemente actualiza el campo con el valor filtrado.
    // La validación de longitud se maneja con 'maxLength' en el Input.
    // La validación de rango de años se puede hacer al guardar si es necesario.
    onUpdate(field, filteredValue)
  }

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const parentescoOptions = ["MADRE", "PADRE", "HERMANO/A", "ESPOSO/A", "HIJO/A", "OTRO"]

  return (
    <div className="space-y-6">
      {/* Navegación de secciones */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
        <div className="flex">
          <button
            onClick={() => {
              setActiveSection("personal")
              onSectionChange("personal")
            }}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeSection === "personal"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Información Personal
          </button>
          <button
            onClick={() => {
              setActiveSection("emergency")
              onSectionChange("emergency")
            }}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeSection === "emergency"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Emergencias
          </button>
        </div>
      </div>

      {/* Contenido de secciones */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {activeSection === "personal" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Información Personal</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => csvInputRef.current?.click()}
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                Importar Respuestas
              </Button>
              <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            </div>

            {/* Dialog para mostrar datos del CSV */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Seleccionar Datos a Importar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Se encontraron {csvData.length} registros. Selecciona uno para importar:
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {csvData.map((row, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRow === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => setSelectedRow(index)}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <strong>Nombre:</strong> {row.nombre || "N/A"}
                          </div>
                          <div>
                            <strong>Contacto:</strong> {row.contacto_emergencia || "N/A"}
                          </div>
                          <div>
                            <strong>Parentesco:</strong> {row.parentesco || "N/A"}
                          </div>
                          <div>
                            <strong>Teléfono:</strong> {row.telefono || "N/A"}
                          </div>
                          <div>
                            <strong>Tipo Sangre:</strong> {row.tipo_sangre || "N/A"}
                          </div>
                          <div>
                            <strong>Alergias:</strong> {row.alergias || "N/A"}
                          </div>
                          <div>
                            <strong>CURP O NSS:</strong> {row.curp || "N/A"}
                          </div>
                          <div>
                            <strong>Miembro Desde:</strong> {row.miembro_desde || "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsImportDialogOpen(false)
                        setCsvData([])
                        setSelectedRow(null)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => selectedRow !== null && applyCSVData(selectedRow)}
                      disabled={selectedRow === null}
                    >
                      Importar Seleccionado
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Nombre *</label>
              <div className="relative">
                <Input
                  value={data.name}
                  onChange={(e) => handleLettersChange("name", e.target.value)}
                  onKeyDown={handleLettersOnly}
                  className="pr-10 text-base font-medium"
                  placeholder="NOMBRE APELLIDO"
                  maxLength={20}
                />
                {data.name && (
                  <button
                    onClick={() => clearField("name")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {/* Fotografía */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Fotografía *</label>
              <div className="flex items-start space-x-4">
                {/* Preview de foto */}
                <div className="flex-shrink-0">
                  {data.photo && data.photo !== "/placeholder.svg?height=200&width=200" ? (
                    <div className="relative group">
                      <img
                        src={data.photo || "/placeholder.svg"}
                        alt="Preview"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200"
                      />
                      <button
                        onClick={() => clearField("photo")}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                      <PhotoIcon className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                {/* Controles de foto */}
                <div className="flex-1">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full mb-2">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {data.photo && data.photo !== "/placeholder.svg?height=200&width=200"
                      ? "Cambiar Foto"
                      : "Subir Foto"}
                  </Button>
                  <p className="text-xs text-slate-500">Formatos: JPG, PNG.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            {/* Área de Trabajo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Área de Trabajo *</label>
                <Dialog open={isAddingArea} onOpenChange={setIsAddingArea}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Agregar Área
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Nueva Área</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="newAreaName" className="block text-sm font-medium text-slate-700">
                          Nombre del Área
                        </label>
                        <Input
                          id="newAreaName"
                          value={newAreaName}
                          onChange={(e) => handleAreaNameChange(e.target.value)}
                          onKeyDown={handleAreaNameKeyDown}
                          placeholder="Ej: PSICOLOGÍA"
                          maxLength={24}
                          className="uppercase"
                        />
                      </div>
                      <div>
                        <label htmlFor="newAreaColor" className="block text-sm font-medium text-slate-700">
                          Color del Área
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            id="newAreaColor"
                            type="color"
                            value={newAreaColor}
                            onChange={(e) => setNewAreaColor(e.target.value)}
                            className="w-16 h-10 rounded border border-slate-300 cursor-pointer"
                          />
                          <Input
                            value={newAreaColor}
                            onChange={(e) => setNewAreaColor(e.target.value)}
                            placeholder="#dc2626"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddingArea(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={addCustomArea} disabled={!newAreaName.trim()}>
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <select
                value={data.area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              >
                {Object.keys(allAreas).map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: data.areaColor }} />
                <span className="text-xs text-slate-500">Color del área: {data.areaColor}</span>
              </div>
            </div>
            {/* Vigencia */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Vigencia</label>
              <div className="relative">
                <Input
                  value={data.vigencia}
                  onChange={(e) => handleNumbersChange("vigencia", e.target.value)}
                  onKeyDown={handleNumbersOnly}
                  placeholder="2026"
                  inputMode="numeric"
                />
                {data.vigencia && (
                  <button
                    onClick={() => clearField("vigencia")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {activeSection === "emergency" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Emergencias</h3>
            </div>
            {/* Miembro Desde */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Miembro Desde</label>
              <div className="relative">
                <Input
                  value={data.miembroDesde}
                  onChange={(e) => handleNumbersChange("miembroDesde", e.target.value)}
                  onKeyDown={handleNumbersOnly}
                  placeholder="Año de inicio (ej. 2010)"
                  inputMode="numeric"
                  maxLength={4}
                />
                {data.miembroDesde && (
                  <button
                    onClick={() => clearField("miembroDesde")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {/* Contacto y Parentesco */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Contacto de Emergencia</label>
                <div className="relative">
                  <Input
                    value={data.emergencyContact}
                    onChange={(e) => handleLettersChange("emergencyContact", e.target.value)}
                    onKeyDown={handleLettersOnly}
                    placeholder="NOMBRE DEL CONTACTO"
                    maxLength={20}
                  />
                  {data.emergencyContact && (
                    <button
                      onClick={() => clearField("emergencyContact")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Parentesco</label>
                <select
                  value={data.parentesco}
                  onChange={(e) => onUpdate("parentesco", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {parentescoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Teléfono y Tipo de Sangre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                <div className="relative">
                  <Input
                    value={data.telefono}
                    onChange={(e) => handleNumbersChange("telefono", e.target.value)}
                    onKeyDown={handleNumbersOnly}
                    placeholder="10 dígitos"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {data.telefono && (
                    <button
                      onClick={() => clearField("telefono")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Tipo de Sangre</label>
                <select
                  value={data.tipoSangre}
                  onChange={(e) => onUpdate("tipoSangre", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Alergias */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Alergias</label>
              <div className="relative">
                <Input
                  value={data.alergias}
                  onChange={(e) => handleLettersChange("alergias", e.target.value)}
                  onKeyDown={handleLettersOnly}
                  placeholder="NINGUNA o especificar alergias"
                  maxLength={20}
                />
                {data.alergias && (
                  <button
                    onClick={() => clearField("alergias")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {/* CURP */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">CURP O NSS</label>
              <div className="relative flex-1">
                <Input
                  value={data.curp}
                  onChange={(e) => onUpdate("curp", e.target.value.toUpperCase())}
                  placeholder="11 a 18 caracteres"
                  maxLength={18}
                />
                {data.curp && (
                  <button
                    onClick={() => clearField("curp")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, CalendarIcon, DocumentIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LogRecord {
  id: string
  usuario: string
  accion: "emision" | "renovacion"
  credencial: string
  fecha: string
  hora: string
}

const mockLogRecords: LogRecord[] = [
  {
    id: "1",
    usuario: "Carlos Mendoza",
    accion: "emision",
    credencial: "EDUARDO SOSA - SERVICIOS MEDICOS",
    fecha: "2024-01-15",
    hora: "14:30:25",
  },
  {
    id: "2",
    usuario: "María González",
    accion: "renovacion",
    credencial: "ANA MARÍA RODRÍGUEZ - ENFERMERÍA",
    fecha: "2024-01-15",
    hora: "13:45:12",
  },
  {
    id: "3",
    usuario: "Roberto Silva",
    accion: "emision",
    credencial: "CARLOS HERNÁNDEZ - AMBULANCIAS",
    fecha: "2024-01-15",
    hora: "12:15:08",
  },
  {
    id: "4",
    usuario: "Patricia López",
    accion: "renovacion",
    credencial: "PATRICIA JIMÉNEZ - DIRECCIÓN",
    fecha: "2024-01-15",
    hora: "11:20:45",
  },
  {
    id: "5",
    usuario: "Diego Ramírez",
    accion: "emision",
    credencial: "MIGUEL TORRES - CAPACITACIÓN",
    fecha: "2024-01-15",
    hora: "10:35:30",
  },
  {
    id: "6",
    usuario: "Laura Herrera",
    accion: "renovacion",
    credencial: "JUAN MORALES - SOCORROS",
    fecha: "2024-01-14",
    hora: "16:50:15",
  },
  {
    id: "7",
    usuario: "Fernando Castro",
    accion: "emision",
    credencial: "LAURA PÉREZ - VOLUNTARIADO",
    fecha: "2024-01-14",
    hora: "15:25:40",
  },
  {
    id: "8",
    usuario: "Ana Martínez",
    accion: "emision",
    credencial: "DIEGO RAMÍREZ - JUVENTUD",
    fecha: "2024-01-14",
    hora: "14:10:22",
  },
]

export function RecordLog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<"todos" | "emision" | "renovacion">("todos")
  const [filterDate, setFilterDate] = useState("")
  const [records, setRecords] = useState<LogRecord[]>(mockLogRecords)

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.credencial.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = filterAction === "todos" || record.accion === filterAction
    const matchesDate = !filterDate || record.fecha === filterDate
    return matchesSearch && matchesAction && matchesDate
  })

  const getActionBadge = (action: LogRecord["accion"]) => {
    switch (action) {
      case "emision":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <DocumentIcon className="h-3 w-3 mr-1" />
            Emisión
          </span>
        )
      case "renovacion":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Renovación
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const refreshLog = () => {
    // Simular actualización de datos
    setRecords([...mockLogRecords])
  }

  return (
    <div className="p-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500 text-sm"
          >
            <option value="todos">Todas las acciones</option>
            <option value="emision">Solo emisiones</option>
            <option value="renovacion">Solo renovaciones</option>
          </select>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500 text-sm"
            />
          </div>
          <Button onClick={refreshLog} variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha y Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credencial
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(record.fecha)}</div>
                  <div className="text-sm text-gray-500">{record.hora}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-red-600">
                          {record.usuario
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{record.usuario}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(record.accion)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={record.credencial}>
                    {record.credencial}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No se encontraron registros</p>
            <p className="mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{filteredRecords.length}</span> de{" "}
          <span className="font-medium">{records.length}</span> registros
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

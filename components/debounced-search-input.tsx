"use client"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline"

interface DebouncedSearchInputProps {
    initialValue?: string
    placeholder?: string
    debounceTime?: number
    onDebouncedChange: (value: string) => void
}

export function DebouncedSearchInput({
    initialValue = "",
    placeholder = "Buscar...",
    debounceTime = 300,
    onDebouncedChange,
}: DebouncedSearchInputProps) {
    // inputValue ahora es el estado interno del input, inicializado una vez.
    // Ya no se sincroniza con initialValue después del montaje inicial.
    const [inputValue, setInputValue] = useState(initialValue)
    const [isTyping, setIsTyping] = useState(false) // Indica si el debounce está activo
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // Este useEffect se encarga de disparar la función de cambio debounced
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Si el input está vacío, notificar inmediatamente y detener el spinner
        if (inputValue.trim() === "") {
            onDebouncedChange("")
            setIsTyping(false)
            return
        }

        setIsTyping(true) // Activar spinner de "escribiendo"
        debounceRef.current = setTimeout(() => {
            onDebouncedChange(inputValue)
            setIsTyping(false) // Desactivar spinner cuando la búsqueda se dispara
        }, debounceTime)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [inputValue, debounceTime, onDebouncedChange]) // onDebouncedChange debe ser estable (usar useCallback en el padre)

    const handleClear = () => {
        setInputValue("")
        onDebouncedChange("") // Notificar inmediatamente que la búsqueda está vacía
    }

    return (
        <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10 pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
            // No hay prop 'disabled' aquí, el input siempre está habilitado para escribir
            />
            {inputValue && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <XCircleIcon className="h-5 w-5" />
                </button>
            )}
            {isTyping && ( // Spinner para indicar que el debounce está activo
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                </div>
            )}
        </div>
    )
}

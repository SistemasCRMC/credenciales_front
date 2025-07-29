// Utilidades para manejo de autenticación y autorización
export interface User {
    id: number
    nombre: string
    correo: string
    rol: "usuario" | "admin"
}

export const getUserFromStorage = (): User | null => {
    if (typeof window === "undefined") return null

    try {
        const userData = localStorage.getItem("user")
        console.log("Auth: Recuperando usuario de localStorage:", userData)
        return userData ? JSON.parse(userData) : null
    } catch {
        return null
    }
}

export const isAdmin = (user: User | null): boolean => {
    return user?.rol === "admin"
}

export const isAuthenticated = (): boolean => {
    return getUserFromStorage() !== null
}

export const hasPermission = (requiredRole: "usuario" | "admin"): boolean => {
    const user = getUserFromStorage()
    console.log("Auth: Verificando permisos para el usuario:", user, "con rol requerido:", requiredRole)
    if (!user) return false

    if (requiredRole === "admin") {
        return user.rol === "admin"
    }

    // Si requiere rol usuario, tanto usuario como admin pueden acceder
    return user.rol === "usuario" || user.rol === "admin"
}

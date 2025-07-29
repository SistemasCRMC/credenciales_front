"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"

export default function Home() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFlip = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setIsFlipped(!isFlipped)
    }
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: "url('/images/red-cross-pattern.png')",
        backgroundSize: "400px 400px",
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
      }}
    >
      {/* Overlay sutil para mejorar legibilidad */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-[0.5px]"></div>
      <div className="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-5xl perspective-1000">
          {/* Login Side */}
          <div
            className={`grid w-full overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2 transition-all duration-800 ease-in-out absolute inset-0 ${
              isFlipped ? "opacity-0 transform -translate-x-full" : "opacity-100 transform translate-x-0 relative"
            }`}
            style={{
              transitionProperty: "transform, opacity",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="flex flex-col justify-center bg-white/95 backdrop-blur-sm p-8 md:p-12 shadow-inner border-r border-red-100">
              <h1 className="mb-6 text-center text-2xl font-bold text-red-700 md:text-3xl">Iniciar Sesión</h1>
              <div className="h-full flex flex-col justify-center">
                <LoginForm onRegisterClick={handleFlip} />
              </div>
            </div>
            <div className="relative hidden md:block">
              <Image
                src="/images/cruz-roja-team.png"
                alt="Cruz Roja Mexicana Equipo"
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          {/* Register Side */}
          <div
            className={`grid w-full overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2 transition-all duration-800 ease-in-out absolute inset-0 ${
              isFlipped ? "opacity-100 transform translate-x-0 relative" : "opacity-0 transform translate-x-full"
            }`}
            style={{
              transitionProperty: "transform, opacity",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="relative hidden md:block">
              <Image
                src="/images/cruz-roja-team.png"
                alt="Cruz Roja Mexicana Equipo"
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center bg-white/95 backdrop-blur-sm p-8 md:p-12 shadow-inner border-l border-red-100">
              <h1 className="mb-6 text-center text-2xl font-bold text-red-700 md:text-3xl">Registro</h1>
              <div className="h-full flex flex-col justify-center">
                <RegisterForm onLoginClick={handleFlip} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

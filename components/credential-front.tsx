"use client"

import Image from "next/image"
import type { CredentialData } from "@/components/credential-designer"

interface CredentialFrontProps {
  data: CredentialData
  areaBlockWidth?: number // ancho opcional en px, default 348
}

export function CredentialFront({ data, areaBlockWidth = 348 }: CredentialFrontProps) {
  const formatCredentialId = (id: number | null) => {
    if (id === null) {
      return "N/A"
    }
    if (id < 10) {
      return `0${id}`
    }
    return id.toString()
  }

  // Solo cambia aquí el fontSize que quieras:
  const fontSizeAreaId = 14 // px, cámbialo al que gustes

  return (
    <div className="w-[380px] h-[240px] bg-white relative overflow-hidden rounded-xl border border-slate-200">
      {/* Top Red Bar */}
      <div className="absolute top-0 left-4 w-[150px] h-[13px] bg-red-600"></div>

      {/* Contenedor de texto de VIGENCIA y la fecha */}
      <div className="absolute -top-1 -right-3.5 flex flex-col items-end justify-center pr-[20px] pt-3 pl-9.5">
        <p className="text-[7px] font-bold leading-none text-slate-900">VIGENCIA</p>
        <p className="text-[9px] font-bold leading-none text-slate-900">{data.vigencia}</p>
      </div>

      {/* Línea roja independiente y controlable */}
      <div
        className="absolute h-[5px]"
        style={{
          top: "26px",     // Ajusta vertical
          left: "340px",   // Ajusta horizontal independiente
          width: "90px",
          backgroundColor: data.areaColor,
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 h-full">
        {/* Logo */}
        <div className="absolute -top-14 left-4">
          <Image
            src="/images/cruz-roja-logo-text-combined.png"
            alt="Cruz Roja Mexicana Logo y Texto"
            width={145}
            height={45}
            className="object-contain"
            style={{
              width: "150px",
              height: "200px",
              minWidth: "150px",
              maxWidth: "150px",
              minHeight: "200px",
              maxHeight: "200px",
            }}
          />
        </div>

        {/* Photo */}
        <div className="absolute top-[8.8px] left-[208px]">
          <div className="w-[174px] h-[174px] rounded-full border-[6px] overflow-hidden bg-white flex items-center justify-center" style={{
              borderColor: data.areaColor
            }}>
            {data.photo && data.photo !== "/placeholder.svg?height=200&width=200" ? (
              <Image
                src={data.photo || "/placeholder.svg"}
                alt="Foto del empleado"
                width={159}
                height={159}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <span className="text-slate-400 text-sm font-medium">FOTO</span>
              </div>
            )}
          </div>
        </div>

        {/* Ser Mejores Block */}
        <div className="absolute top-[80px] left-4">
          <Image
            src="/images/ser-mejoresss-block.png"
            alt="Ser Mejores"
            width={140}
            height={60}
            className="object-contain"
            style={{
              width: "150px",
              height: "95px",
              minWidth: "150px",
              maxWidth: "150px",
              minHeight: "96px",
              maxHeight: "91px",
            }}
          />
        </div>
      </div>

      {/* Bottom Section - Name */}
      <div className="absolute top-[168px] left-0 w-full bg-white p-4 pt-2">
        <div
          className="mb-1"
          style={{
            width: "285px",              // ⬅️ Ancho total de la línea
            height: "6px",               // ↕️ Grosor
            marginLeft: "-17px",          // ⬅️ Controlas cuánto se corre a la derecha (crece hacia la izquierda)
             background: `linear-gradient(to left, ${data.areaColor}, ${data.areaColor})`, // Rojo sólido
          }}
        />

        <h2 className="text-xl font-extrabold text-slate-900 leading-tight uppercase truncate tracking-wide">
          {data.name || "NOMBRE"}
        </h2>
      </div>

      {/* Area and ID Block centrado, con ancho dinámico */}
      <div
        className="absolute flex justify-between items-center rounded-sm"
        style={{
          top: "212px",
          left: "50%",
          width: `${areaBlockWidth}px`,
          minWidth: "390px",
          height: "28px",
          backgroundColor: data.areaColor || "#dc2626",
          paddingLeft: "23px",
          paddingRight: "18px",
          transform: "translateX(-50%)",
        }}
      >
        <p
          className="font-extrabold text-white uppercase truncate tracking-wide flex-shrink-0"
          style={{ fontSize: `${fontSizeAreaId}px`, lineHeight: "1.1" }}
          title={`Área: ${data.area || "ÁREA"}`}
        >
          ÁREA: {data.area || "ÁREA"}
        </p>
        <span
          className="font-extrabold text-white tracking-wide flex-shrink-0"
          style={{ fontSize: `${fontSizeAreaId}px`, lineHeight: "1.1" }}
          title={`ID: ${formatCredentialId(data.credentialId)}`}
        >
          ID: {formatCredentialId(data.credentialId)}
        </span>
      </div>
    </div>
  )
}

"use client"

import Image from "next/image"
import type { CredentialData } from "@/components/credential-designer"

interface CredentialBackProps {
  data: CredentialData & { qrCodeUrl?: string }
}

export function CredentialBack({ data }: CredentialBackProps) {
  return (
    <div className="w-[380px] h-[240px] bg-white rounded-xl border border-slate-200 relative overflow-hidden flex">
      {/* Left Section: Credential Info */}
      <div className="flex flex-col w-1/2">
        {/* Header */}
        <div className="bg-white py-1 px-1 text-slate-900 text-center border-b border-slate-200">
          <h3 className="text-[8px] font-bold uppercase">VALIDAR AUTENTICIDAD</h3>
        </div>

        {/* QR Code Area */}
        <div className="flex-grow flex items-center justify-center py-1 px-1.5">
          <div className="w-[85px] h-[85px] bg-white rounded-lg overflow-hidden flex items-center justify-center border border-slate-300">
            <img
              src={data.qrCodeUrl || "/placeholder.svg"}
              alt="Código QR de Validación"
              width={85}
              height={85}
              className="object-contain"
            />
          </div>
        </div>

        {/* Emergency Information */}
        <div className="px-1.5 py-0.5 text-[7px] text-slate-900 leading-tight">
          <p className="font-bold text-red-700">
            MIEMBRO DESDE: <span className="font-normal text-slate-900">{data.miembroDesde || "N/A"}</span>
          </p>
          <p className="font-bold text-red-700">
            EMERGENCIAS: <span className="font-normal text-slate-900">{data.emergencyContact || "N/A"}</span>
          </p>
          <p className="font-bold text-red-700">
            PARENTESCO: <span className="font-normal text-slate-900">{data.parentesco || "N/A"}</span>
          </p>
          <p className="font-bold text-red-700">
            TELÉFONO: <span className="font-normal text-slate-900">{data.telefono || "N/A"}</span>
          </p>
          <p className="font-bold text-red-700">
            TIPO DE SANGRE: <span className="font-normal text-slate-900">{data.tipoSangre}</span>
          </p>
          <p className="font-bold text-red-700">
            ALERGIAS: <span className="font-normal text-slate-900">{data.alergias || "NINGUNA"}</span>
          </p>
          <p className="font-bold text-red-700">
            CURP O NSS: <span className="font-normal text-slate-900">{data.curp || "No especificado"}</span>
          </p>
        </div>

        {/* Signature and Director Info */}
        <div className="px-1.5 pt-0.5 pb-0.5 text-center">
          <Image
            src="/images/signature-seal.png"
            alt="Firma y Sello"
            width={120}
            height={45}
            className="mx-auto object-contain"
          />
        </div>
      </div>

      {/* Right Section: Vision and Mission */}
      <div className="w-1/2 flex flex-col relative">
        {/* Red vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-red-600"></div>

        {/* Vision Section */}
        <div className="flex-grow bg-white flex">
          <div className="flex items-center justify-center ml-[5px] w-[30px]">
            <span className="text-red-600 text-[11px] font-bold uppercase transform -rotate-90 whitespace-nowrap">
              VISIÓN
            </span>
          </div>
          <div className="p-1 pl-[0.25px] text-[6px] text-slate-900 flex flex-col justify-center">
            <p className="mb-0.5 leading-tight text-justify">
              Somos líderes nacionales en movilización y vinculación social, a través de redes solidarias que dan
              respuesta a las vulnerabilidades de las personas y comunidades, con las que logramos:
            </p>
            <ul className="list-disc list-inside space-y-0.25 pl-0.5">
              <li className="text-justify">
                Fortalecer la cultura de prevención y cuidado de la salud de las personas.
              </li>
              <li className="text-justify">
                Generar capacidades comunitarias para, anticiparse, hacer frente y recuperarse ante emergencias y
                desastres.
              </li>
              <li className="text-justify">
                Mantener nuestra posición como referentes en la atención a emergencias y desastres.
              </li>
              <li className="text-justify">
                Actuando con apego a la legalidad, los Principios Fundamentales y Valores del Movimiento Internacional
                de la Cruz Roja y la Media Luna Roja.
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[5px] bg-red-600 ml-0"></div>

        {/* Mission Section */}
        <div className="flex-grow bg-white flex">
          <div className="flex items-center justify-center ml-[5px] w-[30px]">
            <span className="text-red-600 text-[11px] font-bold uppercase transform -rotate-90 whitespace-nowrap">
              MISIÓN
            </span>
          </div>
          <div className="p-1 pl-[0.25px] text-[6px] text-slate-900 flex flex-col justify-center">
            <p className="leading-tight text-justify">
              Cruz Roja Mexicana es una institución humanitaria de asistencia privada, que forma parte del Movimiento
              Internacional de la Cruz Roja y la Media Luna Roja, dedicada a preservar la salud, la vida y aliviar el
              sufrimiento humano, fomentando la cultura del autocuidado en las personas y sus comunidades, a través de
              la acción voluntaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

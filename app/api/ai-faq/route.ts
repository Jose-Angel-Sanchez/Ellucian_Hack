import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // For now, we'll use a simple response system
    // In production, you would integrate with Gemini AI API
    const response = await generateAIResponse(question)

    return NextResponse.json({ answer: response })
  } catch (error) {
    console.error("Error in AI FAQ:", error)
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 })
  }
}

async function generateAIResponse(question: string): Promise<string> {
  // Simple keyword-based responses for demo
  // In production, replace with actual Gemini AI integration
  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes("ruta") || lowerQuestion.includes("personalizada")) {
    return "Para crear una ruta de aprendizaje personalizada, ve a la sección 'Rutas de Aprendizaje' en tu dashboard. Nuestro sistema de IA analizará tu nivel actual, objetivos y preferencias para generar un plan de estudios optimizado específicamente para ti. Puedes ajustar la ruta en cualquier momento según tu progreso."
  }

  if (lowerQuestion.includes("certificado") || lowerQuestion.includes("diploma")) {
    return "Los certificados se generan automáticamente cuando completas un curso al 100%. Incluyen tu nombre, el título del curso, fecha de finalización y un ID único de verificación. Puedes descargarlos en formato PDF desde la sección 'Mis Certificados' en tu dashboard."
  }

  if (lowerQuestion.includes("accesibilidad") || lowerQuestion.includes("discapacidad")) {
    return "Nuestra plataforma está diseñada con accesibilidad completa: navegación por teclado, soporte para lectores de pantalla, transcripciones automáticas de videos, modo de alto contraste, ajuste de tamaño de texto y soporte para daltonismo. Puedes activar estas funciones desde el panel de accesibilidad en la esquina superior derecha."
  }

  if (lowerQuestion.includes("precio") || lowerQuestion.includes("pago") || lowerQuestion.includes("costo")) {
    return "Ofrecemos un modelo de 'compra una vez, mantén para siempre'. No hay suscripciones mensuales. Una vez que adquieres acceso, es tuyo de por vida. Los precios varían según el curso o paquete que elijas. Consulta nuestra página de precios para más detalles."
  }

  if (lowerQuestion.includes("progreso") || lowerQuestion.includes("avance")) {
    return "Puedes seguir tu progreso desde el dashboard principal. Verás estadísticas detalladas incluyendo tiempo de estudio, cursos completados, habilidades adquiridas y tu racha de aprendizaje. También recibirás recomendaciones personalizadas basadas en tu rendimiento."
  }

  if (lowerQuestion.includes("móvil") || lowerQuestion.includes("dispositivo") || lowerQuestion.includes("tablet")) {
    return "Sí, la plataforma es completamente responsive y funciona perfectamente en computadoras, tablets y móviles. Tu progreso se sincroniza automáticamente entre todos tus dispositivos, permitiéndote aprender en cualquier lugar y momento."
  }

  // Default response
  return "Gracias por tu pregunta. Basándome en la información de nuestra plataforma, te recomiendo revisar las preguntas frecuentes más comunes arriba, o contactar a nuestro equipo de soporte para una respuesta más específica. También puedes explorar nuestra guía de inicio para obtener más información sobre las funcionalidades disponibles."
}

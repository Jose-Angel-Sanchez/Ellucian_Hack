'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { VideoModal, useEscapeKey } from "@/components/ui/video-modal"
import { BookOpen, Brain, Award, Users } from "lucide-react"

export function HomePageClient() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [videoSource, setVideoSource] = useState<'youtube' | 'gdrive'>('youtube')
  const [isLongPress, setIsLongPress] = useState(false)
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [pressProgress, setPressProgress] = useState(0)
  const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null)
  
  // ID del video de YouTube para el demo - Video educativo sobre IA en educación
  const demoVideoId = "dqFVhbLhxGo" // Video sobre IA en educación
  
  // URL del video de Google Drive como respaldo
  const gdriveVideoId = "1DLKaZ5cT0FPctkqUF3egk11ptBBUf973"
  
  // Cerrar modal con tecla ESC
  useEscapeKey(() => setIsVideoOpen(false))

  const openVideoModal = () => {
    setIsVideoOpen(true)
  }

  const closeVideoModal = () => {
    setIsVideoOpen(false)
    // Reset video source to YouTube when closing
    setVideoSource('youtube')
    setIsLongPress(false)
    setPressProgress(0)
  }

  const handleMouseDown = () => {
    setIsLongPress(false)
    setPressProgress(0)
    
    // Timer para completar el long press
    const timer = setTimeout(() => {
      setIsLongPress(true)
      setVideoSource('gdrive')
      setPressProgress(100)
    }, 800) // 800ms para activar Google Drive
    setPressTimer(timer)

    // Timer para animar el progreso
    let progress = 0
    const progressTimer = setInterval(() => {
      progress += 100 / 16 // 800ms / 50ms = 16 steps
      setPressProgress(progress)
      if (progress >= 100) {
        clearInterval(progressTimer)
      }
    }, 50)
    setProgressTimer(progressTimer)
  }

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
    
    if (progressTimer) {
      clearInterval(progressTimer)
      setProgressTimer(null)
    }
    
    // Si fue long press, abrir con Google Drive
    if (isLongPress) {
      setVideoSource('gdrive')
      openVideoModal()
    } else {
      // Si fue clic normal, abrir con YouTube
      setVideoSource('youtube')
      openVideoModal()
    }
    
    // Reset states
    setPressProgress(0)
    setIsLongPress(false)
  }

  const handleMouseLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
    
    if (progressTimer) {
      clearInterval(progressTimer)
      setProgressTimer(null)
    }
    
    setIsLongPress(false)
    setPressProgress(0)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        {/* Navbar global */}

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Aprende de forma <span className="text-primary">inteligente</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma de aprendizaje con IA que crea rutas personalizadas según tu nivel y objetivos. Accesible,
              adaptativa y diseñada para tu éxito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative">
                <Button
                  size="lg"
                  variant="outline"
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleMouseDown}
                  onTouchEnd={handleMouseUp}
                  className={`border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg bg-transparent transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden ${
                    isLongPress ? 'bg-blue-100 border-blue-500' : ''
                  }`}
                  title="Clic normal: YouTube | Mantén presionado: Google Drive"
                >
                  {/* Barra de progreso */}
                  {pressProgress > 0 && pressProgress < 100 && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-75"
                      style={{ width: `${pressProgress}%` }}
                    />
                  )}
                  Ver Demo {isLongPress ? '(Google Drive)' : ''}
                </Button>
                {isLongPress && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                    ✓
                  </div>
                )}
                {pressProgress > 0 && pressProgress < 100 && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(pressProgress)}%
                  </div>
                )}
              </div>
              {isLongPress && (
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">
                    � Suelta para abrir Google Drive
                  </p>
                  <p className="text-xs text-gray-500">
                    (respaldo en caso de problemas con YouTube)
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir inspiraT?</h2>
              <p className="text-xl text-gray-600">Tecnología avanzada al servicio de tu educación</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">IA Personalizada</h3>
                <p className="text-gray-600">Rutas de aprendizaje adaptadas a tu nivel y estilo de aprendizaje</p>
              </div>

              <div className="text-center p-6">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenido Adaptativo</h3>
                <p className="text-gray-600">Material que evoluciona según tu progreso y necesidades</p>
              </div>

              <div className="text-center p-6">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Certificaciones</h3>
                <p className="text-gray-600">Certificados digitales verificables para validar tus logros</p>
              </div>

              <div className="text-center p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Accesibilidad Total</h3>
                <p className="text-gray-600">Diseñado para ser accesible para personas con discapacidades</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-4">¿Listo para transformar tu aprendizaje?</h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de estudiantes que ya están aprendiendo de forma más inteligente
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-6 w-6" />
              <span className="text-xl font-bold">inspiraT</span>
            </div>
            <p className="text-gray-400">© 2024 inspiraT. Transformando la educación con inteligencia artificial.</p>
          </div>
        </footer>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={closeVideoModal}
        videoId={videoSource === 'youtube' ? demoVideoId : gdriveVideoId}
        videoSource={videoSource}
        title={`Demo - Plataforma inspiraT ${videoSource === 'gdrive' ? '(Google Drive)' : '(YouTube)'}`}
      />
    </>
  )
}

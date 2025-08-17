'use client'

import { useState, useEffect } from 'react'
import { X, Play } from 'lucide-react'
import { Button } from './button'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  videoSource?: 'youtube' | 'gdrive'
  title?: string
}

export function VideoModal({ 
  isOpen, 
  onClose, 
  videoId, 
  videoSource = 'youtube', 
  title = "Demo Video" 
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      setIsLoading(true)
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to reset body scroll
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Reset loading when video source changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
    }
  }, [videoSource, videoId, isOpen])

  const handleClose = () => {
    setIsLoading(true)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleVideoLoad = () => {
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {videoSource === 'youtube' ? 'YouTube' : 'Google Drive'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Cargando video...</p>
              </div>
            </div>
          )}
          
          <div className="aspect-video">
            {videoSource === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleVideoLoad}
              />
            ) : (
              <iframe
                src={`https://drive.google.com/file/d/${videoId}/preview`}
                title={title}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
                onLoad={handleVideoLoad}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">
                Presiona <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">ESC</kbd> o haz clic fuera del video para cerrar
              </p>
              {videoSource === 'gdrive' && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 Video desde Google Drive como respaldo
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook para manejar tecla ESC
export function useEscapeKey(callback: () => void) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [callback])
}

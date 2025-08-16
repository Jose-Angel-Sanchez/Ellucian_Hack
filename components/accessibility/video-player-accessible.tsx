"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  CaptionsIcon as ClosedCaptioning,
  SkipBack,
  SkipForward,
} from "lucide-react"

interface VideoPlayerProps {
  title: string
  duration: number
  transcription?: string
  audioDescription?: string
}

export default function AccessibleVideoPlayer({ title, duration, transcription, audioDescription }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [showCaptions, setShowCaptions] = useState(true)
  const [showTranscript, setShowTranscript] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const videoRef = useRef<HTMLDivElement>(null)

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return duration
          }
          return prev + 1
        })
      }, 1000 / playbackSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, playbackSpeed])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const skipBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 10))
  }

  const skipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Sample captions data
  const captions = [
    { start: 0, end: 5, text: "Bienvenidos a esta lección sobre JavaScript." },
    { start: 5, end: 10, text: "Hoy aprenderemos sobre variables y tipos de datos." },
    { start: 10, end: 15, text: "Comenzaremos con la declaración de variables usando let y const." },
  ]

  const currentCaption = captions.find((caption) => currentTime >= caption.start && currentTime < caption.end)

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={videoRef}
            className="relative bg-gray-900 aspect-video rounded-t-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary"
            role="application"
            aria-label={`Reproductor de video: ${title}`}
          >
            {/* Video Content Area */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">{isPlaying ? <Pause /> : <Play />}</div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-300">Contenido de video simulado</p>
              </div>
            </div>

            {/* Captions Overlay */}
            {showCaptions && currentCaption && (
              <div className="absolute bottom-16 left-4 right-4">
                <div className="bg-black/80 text-white p-3 rounded text-center">
                  <p className="text-lg">{currentCaption.text}</p>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  onValueChange={(value) => setCurrentTime(value[0])}
                  max={duration}
                  step={1}
                  className="w-full"
                  aria-label={`Progreso del video: ${formatTime(currentTime)} de ${formatTime(duration)}`}
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipBackward}
                    className="text-white hover:bg-white/20"
                    aria-label="Retroceder 10 segundos"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                    aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipForward}
                    className="text-white hover:bg-white/20"
                    aria-label="Avanzar 10 segundos"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={(value) => {
                          setVolume(value[0])
                          setIsMuted(value[0] === 0)
                        }}
                        max={100}
                        step={1}
                        aria-label={`Volumen: ${isMuted ? 0 : volume}%`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCaptions(!showCaptions)}
                    className={`text-white hover:bg-white/20 ${showCaptions ? "bg-white/20" : ""}`}
                    aria-label={showCaptions ? "Ocultar subtítulos" : "Mostrar subtítulos"}
                  >
                    <ClosedCaptioning className="h-4 w-4" />
                  </Button>

                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-transparent text-white text-sm border border-white/20 rounded px-2 py-1"
                    aria-label="Velocidad de reproducción"
                  >
                    <option value={0.5} className="text-black">
                      0.5x
                    </option>
                    <option value={0.75} className="text-black">
                      0.75x
                    </option>
                    <option value={1} className="text-black">
                      1x
                    </option>
                    <option value={1.25} className="text-black">
                      1.25x
                    </option>
                    <option value={1.5} className="text-black">
                      1.5x
                    </option>
                    <option value={2} className="text-black">
                      2x
                    </option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    aria-label="Pantalla completa"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Toggle */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>{showTranscript ? "Ocultar" : "Mostrar"} Transcripción</span>
        </Button>

        <div className="text-sm text-gray-600">
          Duración: {formatTime(duration)} | Velocidad: {playbackSpeed}x
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && transcription && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transcripción Completa</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {transcription ||
                  "Bienvenidos a esta lección sobre JavaScript. Hoy aprenderemos sobre variables y tipos de datos. Comenzaremos con la declaración de variables usando let y const. Las variables son contenedores que nos permiten almacenar datos que podemos usar y modificar a lo largo de nuestro programa. En JavaScript, tenemos diferentes formas de declarar variables..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Description */}
      {audioDescription && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">Descripción de Audio</h4>
            <p className="text-sm text-blue-800">{audioDescription}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

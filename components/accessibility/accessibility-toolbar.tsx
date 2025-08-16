"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accessibility, Eye, Type, Keyboard, X } from "lucide-react"

interface AccessibilitySettings {
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  voiceNavigation: boolean
  colorBlindMode: string
  focusIndicator: boolean
}

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    voiceNavigation: false,
    colorBlindMode: "none",
    focusIndicator: true,
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement

    // Font size
    root.style.fontSize = `${settings.fontSize}px`

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    // Color blind mode
    root.setAttribute("data-colorblind", settings.colorBlindMode)

    // Focus indicator
    if (settings.focusIndicator) {
      root.classList.add("enhanced-focus")
    } else {
      root.classList.remove("enhanced-focus")
    }

    // Save to localStorage
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      voiceNavigation: false,
      colorBlindMode: "none",
      focusIndicator: true,
    }
    setSettings(defaultSettings)
  }

  return (
    <>
      {/* Accessibility Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary-hover text-white rounded-full w-12 h-12 p-0 shadow-lg"
        aria-label="Abrir configuración de accesibilidad"
        title="Configuración de Accesibilidad"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Configuración de Accesibilidad</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Cerrar configuración">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium">Tamaño de Texto</label>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={(value) => updateSetting("fontSize", value[0])}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                    aria-label="Ajustar tamaño de texto"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Pequeño (12px)</span>
                    <span>Actual: {settings.fontSize}px</span>
                    <span>Grande (24px)</span>
                  </div>
                </div>
              </div>

              {/* Visual Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Configuración Visual</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Alto Contraste</label>
                      <p className="text-xs text-gray-600">Mejora la visibilidad del texto</p>
                    </div>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                      aria-label="Activar alto contraste"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Indicadores de Foco Mejorados</label>
                      <p className="text-xs text-gray-600">Resalta elementos seleccionados</p>
                    </div>
                    <Switch
                      checked={settings.focusIndicator}
                      onCheckedChange={(checked) => updateSetting("focusIndicator", checked)}
                      aria-label="Activar indicadores de foco mejorados"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modo para Daltonismo</label>
                    <Select
                      value={settings.colorBlindMode}
                      onValueChange={(value) => updateSetting("colorBlindMode", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin ajustes</SelectItem>
                        <SelectItem value="protanopia">Protanopia (rojo-verde)</SelectItem>
                        <SelectItem value="deuteranopia">Deuteranopia (rojo-verde)</SelectItem>
                        <SelectItem value="tritanopia">Tritanopia (azul-amarillo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Motion Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Configuración de Movimiento</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Reducir Animaciones</label>
                    <p className="text-xs text-gray-600">Minimiza movimientos y transiciones</p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                    aria-label="Reducir animaciones"
                  />
                </div>
              </div>

              {/* Navigation Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <Keyboard className="h-4 w-4" />
                  <span>Navegación</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Navegación por Teclado</label>
                      <p className="text-xs text-gray-600">Usar Tab, Enter y flechas</p>
                    </div>
                    <Switch
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                      aria-label="Activar navegación por teclado"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Soporte para Lector de Pantalla</label>
                      <p className="text-xs text-gray-600">Optimizado para NVDA, JAWS, VoiceOver</p>
                    </div>
                    <Switch
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                      aria-label="Activar soporte para lector de pantalla"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={resetSettings}>
                  Restablecer
                </Button>
                <Button onClick={() => setIsOpen(false)} className="bg-primary hover:bg-primary-hover text-white">
                  Aplicar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

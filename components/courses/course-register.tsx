"use client"

import { Button } from "@/components/ui/button"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Loader2, Mail, Lock, User, Eye, EyeOff, AtSign } from "lucide-react"
import { Car } from "lucide-react"
import { Label } from "@radix-ui/react-select"
import { Input } from "../ui/input"
import { useActionState } from "react"
import { signUp } from "@/lib/actions"
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-secondary hover:bg-secondary-hover text-white py-3 text-lg font-medium rounded-lg h-12"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando curso...
        </>
      ) : (
        "Subir Curso"
      )}
    </Button>
  )
}

interface CourseProps{
    courseId:string,
    active:boolean,
}

export default function CourseRegister(){
const [state, formAction] = useActionState(signUp, null)
    return (
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900">Crecion de Curso</CardTitle>
            <CardDescription className="text-gray-600 text-lg">Crea rapidamente un curso</CardDescription>
            </CardHeader>    
        <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {state.success}
            </div>
          )}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
                        Nombre del Curso
                    </label>
                    <div className="relative">
                        <Input 
                        id="courseName" 
                        name="courseName" 
                        type="text" 
                        placeholder="Introduzca el nombre del curso" 
                        className="w-full pr-10" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="courseDescription" className="block text-sm font-medium text-gray">
                        Descripcion del curso
                    </label>
                    <div>
                        <Input 
                        id="courseDescription"
                        name="courseDescription"
                        type="text"
                        placeholder="Introduzca una breve descripcion del curso"
                        className="w-full pr-10"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="courseContent" className="block text-sm font-medium text-gray">
                        Contenido del curso
                    </label>
                    <div>
                        <Input 
                        id="courseContent"
                        name="courseContent"
                        type="text"
                        placeholder="Introduzca los modulos del curso"
                        className="w-full pr-10"
                        />
                    </div>
                </div>
            </div>
            <SubmitButton />
        </form>
        </CardContent>
        </Card>
    
    )
}
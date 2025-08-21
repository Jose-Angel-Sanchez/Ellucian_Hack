'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, Users, Star, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import EnrollButton from "./enroll-button"

interface CourseCardProps {
  course: any
  user: any
}

export default function CourseCard({ course, user }: CourseCardProps) {
  const supabase = createClient()
  const getDifficultyColor = (level: string) => {
    switch ((level || '').toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch ((level || '').toLowerCase()) {
      case 'beginner':
        return 'Principiante'
      case 'intermediate':
        return 'Intermedio'
      case 'advanced':
        return 'Avanzado'
      default:
        return level
    }
  }
  const [localRating, setLocalRating] = useState(
    course.ratings?.find((r: any) => r.user_id === user.id && (r.feedback_type === 'course' || r.feedback_type == null))?.rating || 0
  )
  const [isRating, setIsRating] = useState(false)
  const [showEnrolled, setShowEnrolled] = useState(false)
  const [enrolledUsers, setEnrolledUsers] = useState<Array<{ id: string; full_name: string; email: string }>>([])

  const getAverageRating = (ratings: any[]) => {
    if (!ratings || ratings.length === 0) return 0
    const sum = ratings
      .filter((r: any) => (r.feedback_type === 'course' || r.feedback_type == null) && typeof r.rating === 'number')
      .reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0)
    return (sum / ratings.length).toFixed(1)
  }

  const isUserEnrolled = (enrollments: any[], userId: string) => {
    return enrollments?.some(e => e.user_id === userId) || false
  }

  const handleRating = async (courseId: string, rating: number) => {
    if (isRating) return
    setIsRating(true)
    try {
      // Try update feedback; if not exists, insert
      const { error: updateErr } = await supabase
        .from('feedback')
        .update({ rating, feedback_type: 'course' })
        .eq('course_id', courseId)
        .eq('user_id', user.id)
      if (updateErr) {
        console.warn('Falling back to insert feedback:', updateErr?.message)
      }
      if (updateErr) {
        const { error: insertErr } = await supabase
          .from('feedback')
          .insert({ course_id: courseId, user_id: user.id, rating, feedback_type: 'course' })
        if (insertErr) {
          console.error('Error rating course:', insertErr)
          return
        }
      }

      setLocalRating(rating)
    } catch (error) {
      console.error('Error rating course:', error)
    } finally {
      setIsRating(false)
    }
  }

  // Load enrolled users' profiles when toggled open
  useEffect(() => {
    const loadEnrolled = async () => {
      try {
        const userIds = (course.enrollments || []).map((e: any) => e.user_id)
        if (userIds.length === 0) {
          setEnrolledUsers([])
          return
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
        if (error) {
          console.error('Error fetching enrolled profiles:', error)
          return
        }
        setEnrolledUsers(data || [])
      } catch (err) {
        console.error('Error fetching enrolled profiles:', err)
      }
    }
    if (showEnrolled) {
      loadEnrolled()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEnrolled, course?.enrollments?.length])

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={getDifficultyColor(course.difficulty_level)}>
            {getDifficultyLabel(course.difficulty_level)}
          </Badge>
          <Badge variant="secondary">{course.category}</Badge>
        </div>
        <CardTitle className="text-xl">{course.title}</CardTitle>
        <CardDescription className="text-sm text-gray-600 line-clamp-3">{course.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>
              {Math.floor(course.estimated_duration / 60)}h {course.estimated_duration % 60}m
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{(course.sections?.length ?? course.content?.modules?.length ?? 0)} módulos</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <button
            type="button"
            onClick={() => setShowEnrolled(v => !v)}
            className="flex items-center space-x-1 hover:text-gray-700"
            aria-expanded={showEnrolled}
          >
            <Users className="h-4 w-4" />
            <span>{course.enrollments?.length || 0} estudiantes</span>
            {showEnrolled ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1">{getAverageRating(course.ratings)}</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(course.id, star)}
                  disabled={isRating}
                  className="focus:outline-none transition-colors duration-200"
                  aria-label={`Calificar ${star} estrellas`}
                  title={isUserEnrolled(course.enrollments, user.id) ? `Calificar ${star}` : 'Inscríbete para calificar'}
                >
                  <Star 
                    className={`h-4 w-4 ${
                      localRating >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {showEnrolled && (
          <div className="mb-3 rounded border p-2 bg-gray-50">
            <p className="text-xs font-medium text-gray-700 mb-1">Inscritos</p>
            {enrolledUsers.length === 0 ? (
              <p className="text-xs text-gray-500">Sin inscripciones</p>
            ) : (
              <ul className="max-h-28 overflow-auto text-xs text-gray-700 list-disc pl-4">
                {enrolledUsers.map((u) => (
                  <li key={u.id} title={u.email} className="truncate">
                    {u.full_name || u.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-2">
          <EnrollButton
            courseId={course.id}
            userId={user.id}
            isEnrolled={isUserEnrolled(course.enrollments, user.id)}
          />
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline" className="w-full">
              Ver detalles del curso
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

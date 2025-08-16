import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      goal,
      description,
      currentLevel,
      timeCommitment,
      preferredCategories,
      specificSkills,
      learningStyle,
      availableCourses,
    } = body

    // Simulate AI processing with a more sophisticated algorithm
    const generateLearningPath = (data: any) => {
      const { goal, currentLevel, preferredCategories, specificSkills, availableCourses, timeCommitment } = data

      // Filter courses based on preferences and level
      let relevantCourses = availableCourses.filter((course: any) => {
        // Level matching
        const levelMatch =
          (currentLevel === "beginner" && course.difficulty_level === "beginner") ||
          (currentLevel === "intermediate" && ["beginner", "intermediate"].includes(course.difficulty_level)) ||
          (currentLevel === "advanced" && ["intermediate", "advanced"].includes(course.difficulty_level))

        // Category matching
        const categoryMatch = preferredCategories.length === 0 || preferredCategories.includes(course.category)

        // Skills matching (simple keyword matching)
        const skillsMatch =
          !specificSkills ||
          specificSkills
            .toLowerCase()
            .split(",")
            .some(
              (skill: string) =>
                course.title.toLowerCase().includes(skill.trim()) ||
                course.description.toLowerCase().includes(skill.trim()),
            )

        return levelMatch && categoryMatch && skillsMatch
      })

      // If no relevant courses found, include some beginner courses
      if (relevantCourses.length === 0) {
        relevantCourses = availableCourses.filter((course: any) => course.difficulty_level === "beginner").slice(0, 3)
      }

      // Sort by relevance and select appropriate number based on time commitment
      const maxCourses =
        timeCommitment === "1-5" ? 2 : timeCommitment === "5-10" ? 3 : timeCommitment === "10-20" ? 4 : 5
      const selectedCourses = relevantCourses.slice(0, maxCourses)

      // Generate reasons for each course selection
      const coursesWithReasons = selectedCourses.map((course: any, index: number) => ({
        course,
        reason: generateCourseReason(course, goal, currentLevel, index),
      }))

      // Calculate estimated duration
      const totalHours = selectedCourses.reduce((total: number, course: any) => total + course.estimated_duration, 0)
      const weeklyHours =
        timeCommitment === "1-5" ? 3 : timeCommitment === "5-10" ? 7 : timeCommitment === "10-20" ? 15 : 25
      const estimatedWeeks = Math.ceil(totalHours / 60 / weeklyHours)

      return {
        title: generatePathTitle(goal, currentLevel),
        description: generatePathDescription(goal, currentLevel, selectedCourses.length),
        difficulty: currentLevel,
        estimatedDuration: estimatedWeeks,
        courses: coursesWithReasons,
        targetSkills: extractSkills(goal, specificSkills),
        generatedBy: "AI",
        pathData: {
          originalGoal: goal,
          userLevel: currentLevel,
          timeCommitment,
          preferences: { categories: preferredCategories, learningStyle },
        },
      }
    }

    const generateCourseReason = (course: any, goal: string, level: string, index: number) => {
      const reasons = [
        `Fundamental para ${goal.toLowerCase()}`,
        `Construye sobre conocimientos ${level === "beginner" ? "básicos" : "previos"}`,
        `Habilidad clave en tu área de interés`,
        `Complementa perfectamente tus objetivos`,
        `Esencial para el siguiente nivel`,
      ]
      return reasons[index % reasons.length]
    }

    const generatePathTitle = (goal: string, level: string) => {
      const levelText = level === "beginner" ? "desde Cero" : level === "intermediate" ? "Intermedio" : "Avanzado"
      return `Ruta ${levelText}: ${goal}`
    }

    const generatePathDescription = (goal: string, level: string, courseCount: number) => {
      return `Ruta personalizada de ${courseCount} cursos diseñada para ayudarte a ${goal.toLowerCase()}. Adaptada a tu nivel ${level} con contenido progresivo y práctico.`
    }

    const extractSkills = (goal: string, specificSkills: string) => {
      const skills = specificSkills ? specificSkills.split(",").map((s) => s.trim()) : []
      const goalSkills = goal.toLowerCase().includes("web")
        ? ["HTML", "CSS", "JavaScript"]
        : goal.toLowerCase().includes("marketing")
          ? ["SEO", "Analytics", "Content Marketing"]
          : goal.toLowerCase().includes("design")
            ? ["UI/UX", "Prototyping", "Visual Design"]
            : ["Problem Solving", "Critical Thinking"]

      return [...new Set([...skills, ...goalSkills])]
    }

    const learningPath = generateLearningPath(body)

    return NextResponse.json({
      success: true,
      learningPath,
    })
  } catch (error) {
    console.error("Error generating learning path:", error)
    return NextResponse.json({ success: false, error: "Failed to generate learning path" }, { status: 500 })
  }
}

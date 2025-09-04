"use client"

import { useState } from "react"
import { ArrowLeft, ChevronRight, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ExerciseIcon } from "@/components/ui/exercise-icons"

interface Exercise {
  id: string
  name: string
  bodyParts: string[]
  equipment: string[]
  icon: string
  category: string
}

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  
  const exercises: Exercise[] = [
    {
      id: "arnold-press",
      name: "Arnold press",
      bodyParts: ["shoulders", "triceps"],
      equipment: ["dumbbell"],
      icon: "arnold-press",
      category: "strength"
    },
    {
      id: "assisted-dips",
      name: "Assisted dips",
      bodyParts: ["chest", "triceps"],
      equipment: ["machine"],
      icon: "assisted-dips", 
      category: "strength"
    },
    {
      id: "barbell-bench-press",
      name: "Barbell bench press",
      bodyParts: ["chest", "triceps", "shoulders"],
      equipment: ["barbell"],
      icon: "bench-press",
      category: "strength"
    },
    {
      id: "bicep-curls",
      name: "Bicep curls",
      bodyParts: ["biceps"],
      equipment: ["dumbbell"],
      icon: "bicep-curls",
      category: "strength"
    },
    {
      id: "cable-crossover",
      name: "Cable crossover",
      bodyParts: ["chest"],
      equipment: ["cable"],
      icon: "crossover",
      category: "strength"
    },
    {
      id: "chest-press",
      name: "Chest press",
      bodyParts: ["chest", "triceps"],
      equipment: ["machine"],
      icon: "chest-press",
      category: "strength"
    },
    {
      id: "deadlift",
      name: "Deadlift",
      bodyParts: ["back", "hamstrings", "glutes"],
      equipment: ["barbell"],
      icon: "deadlift",
      category: "strength"
    },
    {
      id: "dumbbell-flyes",
      name: "Dumbbell flyes",
      bodyParts: ["chest"],
      equipment: ["dumbbell"],
      icon: "flyes",
      category: "strength"
    }
  ]

  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  
  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    const letter = exercise.name[0].toUpperCase()
    if (!acc[letter]) {
      acc[letter] = []
    }
    acc[letter].push(exercise)
    return acc
  }, {} as Record<string, Exercise[]>)

  const scrollToLetter = (letter: string) => {
    setSelectedLetter(letter)
    const element = document.getElementById(`section-${letter}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <main className="min-h-screen pb-20 md:pb-8 bg-background">
        <div className="container-padding py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/add" className="p-2">
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-text-primary">
                38 exercises related to "push"
              </h1>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Done
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>

          {/* Exercise List */}
          <div className="relative">
            <div className="space-y-1">
              {Object.entries(groupedExercises).map(([letter, exercises]) => (
                <div key={letter} id={`section-${letter}`}>
                  <div className="sticky top-0 bg-background py-2 z-10">
                    <h2 className="text-lg font-bold text-text-primary">{letter}</h2>
                  </div>
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="exercise-item">
                      <ExerciseIcon name={exercise.icon} />
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-text-primary">
                          {exercise.name}
                        </h3>
                      </div>
                      <ChevronRight className="h-5 w-5 text-text-secondary" />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Alphabet Sidebar */}
            <div className="alphabet-sidebar">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className={`w-6 h-6 text-xs font-medium rounded-full flex items-center justify-center transition-colors ${
                    selectedLetter === letter || groupedExercises[letter]
                      ? "text-primary"
                      : "text-text-tertiary"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
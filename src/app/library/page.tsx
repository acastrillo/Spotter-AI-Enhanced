"use client"

import { useState } from "react"
import { useAuthStore } from "@/store"
import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Filter, 
  Dumbbell, 
  Clock, 
  Calendar,
  MoreHorizontal,
  Play
} from "lucide-react"

export default function LibraryPage() {
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")

  if (!isAuthenticated) {
    return <Login />
  }

  const filters = [
    { label: "All", active: true },
    { label: "Upper Body" },
    { label: "Lower Body" },
    { label: "Cardio" },
    { label: "Strength" },
    { label: "HIT" }
  ]

  // Mock workout data matching the target design
  const workouts = [
    {
      id: 1,
      title: "Instagram Workout - 8/22/2025",
      date: "8/22/2025",
      steps: "9 steps",
      exercises: "6 exercises",
      duration: "0 min",
      tags: ["dumbbell", "barbell"],
      content: [
        "🔥 PUSH DAY WORKOUT! 🔥",
        "Upper Body Blast",
        "7 more steps..."
      ]
    },
    {
      id: 2,
      title: "Instagram Workout - 8/22/2025", 
      date: "8/22/2025",
      steps: "7 steps",
      exercises: "6 exercises",
      duration: "0 min",
      tags: ["dumbbell", "barbell"],
      content: [
        "🔥 PUSH DAY WORKOUT! 🔥",
        "Push-ups: 3 sets x 15 reps",
        "5 more steps..."
      ]
    },
    {
      id: 3,
      title: "Instagram Workout - 8/22/2025",
      date: "8/22/2025", 
      steps: "9 steps",
      exercises: "6 exercises",
      duration: "0 min", 
      tags: ["dumbbell", "barbell"],
      content: [
        "🔥 PUSH DAY WORKOUT! 🔥",
        "Upper Body Blast",
        "7 more steps..."
      ]
    },
    {
      id: 4,
      title: "Instagram Workout - 8/22/2025",
      date: "8/22/2025",
      steps: "9 steps", 
      exercises: "8 exercises",
      duration: "0 min",
      tags: ["dumbbell", "barbell"],
      content: [
        "🔥 PUSH DAY WORKOUT! 🔥",
        "Upper Body Blast",
        "7 more steps..."
      ]
    },
    {
      id: 5,
      title: "Instagram Workout - 8/22/2025",
      date: "8/22/2025",
      steps: "1 steps",
      exercises: "1 exercises",
      duration: "0 min",
      tags: [],
      content: [
        "test 3"
      ]
    },
    {
      id: 6,
      title: "Instagram Workout - 8/22/2025",
      date: "8/22/2025", 
      steps: "1 steps",
      exercises: "1 exercises",
      duration: "0 min",
      tags: [],
      content: [
        "test 2"
      ]
    },
    {
      id: 7,
      title: "Instagram Workout - 8/22/2025",
      date: "8/22/2025",
      steps: "1 steps",
      exercises: "1 exercises", 
      duration: "0 min",
      tags: [],
      content: [
        "test"
      ]
    }
  ]

  const summaryStats = [
    {
      icon: Dumbbell,
      value: "7",
      label: "Total Workouts",
      color: "text-primary"
    },
    {
      icon: Clock, 
      value: "0",
      label: "Body Parts",
      color: "text-secondary"
    },
    {
      icon: Clock,
      value: "3 min",
      label: "Total Time", 
      color: "text-rest"
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Workout Library
              </h1>
              <p className="text-text-secondary">
                Your saved workouts and routines
              </p>
            </div>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Workout</span>
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input 
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((filter, index) => (
              <Button
                key={filter.label}
                variant={activeFilter === filter.label ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.label)}
                className={`rounded-full ${
                  activeFilter === filter.label 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Workout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {workouts.map((workout) => (
              <Card key={workout.id} className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  {/* Workout Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">
                        {workout.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {workout.date} · {workout.steps}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Workout Stats */}
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                    <span>{workout.exercises}</span>
                    <span>•</span>
                    <span>{workout.duration}</span>
                  </div>

                  {/* Tags */}
                  {workout.tags.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {workout.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Workout Preview */}
                  <div className="space-y-1 mb-6">
                    {workout.content.map((line, index) => (
                      <p key={index} className="text-sm text-text-secondary line-clamp-1">
                        {index + 1}. {line}
                      </p>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 flex items-center space-x-2">
                      <Play className="h-3 w-3" />
                      <span>Start Workout</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Stats Summary */}
          <div className="grid grid-cols-3 gap-6">
            {summaryStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
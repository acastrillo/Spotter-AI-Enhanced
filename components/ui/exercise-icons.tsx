import { cn } from "@/lib/utils"

interface ExerciseIconProps {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const iconSizes = {
  sm: "w-6 h-6",
  md: "w-10 h-10", 
  lg: "w-16 h-16"
}

export function ExerciseIcon({ name, className, size = "md" }: ExerciseIconProps) {
  return (
    <div className={cn(
      "bg-surface rounded-lg flex items-center justify-center",
      iconSizes[size],
      className
    )}>
      {/* Placeholder icon - in real app would be exercise-specific SVGs */}
      <div className="w-1/2 h-1/2 bg-text-secondary rounded opacity-60" />
    </div>
  )
}

// Specific exercise icons with custom styling
export function BenchPressIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-10 h-10 bg-surface rounded-lg flex items-center justify-center", className)}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-secondary">
        <rect x="2" y="8" width="16" height="4" rx="1" fill="currentColor" />
        <rect x="1" y="6" width="2" height="8" rx="1" fill="currentColor" />
        <rect x="17" y="6" width="2" height="8" rx="1" fill="currentColor" />
      </svg>
    </div>
  )
}

export function RunningIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-10 h-10 bg-surface rounded-lg flex items-center justify-center", className)}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-secondary">
        <path d="M6 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM4 6h3l2 4v6h-2v-4l-1-2-2 4v2H2v-3l2-4z" fill="currentColor" />
      </svg>
    </div>
  )
}

export function DeadliftIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-10 h-10 bg-surface rounded-lg flex items-center justify-center", className)}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-secondary">
        <rect x="2" y="15" width="16" height="2" rx="1" fill="currentColor" />
        <rect x="9" y="5" width="2" height="10" rx="1" fill="currentColor" />
        <circle cx="6" cy="12" r="2" fill="currentColor" />
        <circle cx="14" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}

export function CrossoverIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-10 h-10 bg-surface rounded-lg flex items-center justify-center", className)}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-secondary">
        <path d="M2 2l6 8-6 8M18 2l-6 8 6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function FlyesIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-10 h-10 bg-surface rounded-lg flex items-center justify-center", className)}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-secondary">
        <path d="M10 6v8M4 8l6 2-6 2M16 8l-6 2 6 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}
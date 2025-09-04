import { cn } from "@/lib/utils"

interface FilterTagProps {
  children: React.ReactNode
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function FilterTag({ children, isSelected = false, onClick, className }: FilterTagProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
        isSelected 
          ? "bg-primary text-white" 
          : "bg-surface text-text-primary hover:bg-surface-elevated",
        className
      )}
    >
      {children}
    </button>
  )
}

interface BodyPartTagProps {
  bodyPart: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function BodyPartTag({ bodyPart, isSelected = false, onClick, className }: BodyPartTagProps) {
  return (
    <FilterTag 
      isSelected={isSelected} 
      onClick={onClick} 
      className={className}
    >
      {bodyPart}
    </FilterTag>
  )
}

interface EquipmentTagProps {
  equipment: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function EquipmentTag({ equipment, isSelected = false, onClick, className }: EquipmentTagProps) {
  return (
    <FilterTag 
      isSelected={isSelected} 
      onClick={onClick} 
      className={className}
    >
      {equipment}
    </FilterTag>
  )
}

interface FilterTagsGridProps {
  tags: string[]
  selectedTags?: string[]
  onTagToggle?: (tag: string) => void
  className?: string
}

export function FilterTagsGrid({ tags, selectedTags = [], onTagToggle, className }: FilterTagsGridProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <FilterTag
          key={tag}
          isSelected={selectedTags.includes(tag)}
          onClick={() => onTagToggle?.(tag)}
        >
          {tag}
        </FilterTag>
      ))}
    </div>
  )
}
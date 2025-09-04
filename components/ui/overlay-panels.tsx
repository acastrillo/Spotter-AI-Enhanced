"use client"

import { useState } from "react"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterTagsGrid } from "@/components/ui/filter-tags"
import { cn } from "@/lib/utils"

interface OverlayPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function OverlayPanel({ isOpen, onClose, title, children, className }: OverlayPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div 
        className={cn(
          "filter-overlay w-full max-w-md rounded-t-xl bg-surface border-t border-border shadow-lg transform transition-transform duration-300",
          isOpen ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-border rounded-full mx-auto my-3" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

interface FilterSection {
  section: string
  expanded: boolean
  icon: string
  options?: string[]
}

interface FilterOverlayProps {
  isOpen: boolean
  onClose: () => void
  sections: FilterSection[]
  onToggleSection?: (section: string) => void
}

export function FilterOverlay({ isOpen, onClose, sections, onToggleSection }: FilterOverlayProps) {
  return (
    <OverlayPanel isOpen={isOpen} onClose={onClose} title="Filter Options">
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
            <button
              onClick={() => onToggleSection?.(section.section)}
              className="w-full flex items-center justify-between py-2"
            >
              <span className="text-base font-medium text-text-primary">
                {section.section}
              </span>
              {section.expanded ? (
                <ChevronUp className="h-4 w-4 text-text-secondary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-text-secondary" />
              )}
            </button>
            
            {section.expanded && section.options && (
              <div className="mt-3">
                <FilterTagsGrid tags={section.options} />
              </div>
            )}
          </div>
        ))}
      </div>
    </OverlayPanel>
  )
}

interface EquipmentOverlayProps {
  isOpen: boolean
  onClose: () => void
  equipment: string[]
  selectedEquipment?: string[]
  onEquipmentToggle?: (equipment: string) => void
}

export function EquipmentOverlay({ 
  isOpen, 
  onClose, 
  equipment, 
  selectedEquipment = [], 
  onEquipmentToggle 
}: EquipmentOverlayProps) {
  return (
    <OverlayPanel isOpen={isOpen} onClose={onClose} title="Select Equipment">
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">
          Choose the equipment you have available for your workout.
        </p>
        <FilterTagsGrid 
          tags={equipment}
          selectedTags={selectedEquipment}
          onTagToggle={onEquipmentToggle}
        />
      </div>
    </OverlayPanel>
  )
}
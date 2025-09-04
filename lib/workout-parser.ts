
export interface ParsedWorkout {
  title: string
  detectedTitle?: string
  steps: WorkoutStep[]
  meta: WorkoutMeta
  totalTimeEstimateSec?: number
}

export interface WorkoutStep {
  order: number
  type: 'exercise' | 'rest' | 'time' | 'header'
  raw: string
  exercise?: string
  sets?: number
  repsJson?: string // JSON string for number or number[]
  duration?: number // seconds
  weight?: string
  distance?: string
  timesThrough?: number
  workoutTypeHint?: string
}

export interface WorkoutMeta {
  equipment: string[]
  workoutTypes: string[]
  tags: string[]
  bodyParts: string[]
  detectedTitle?: string
}

// Common workout patterns
const PATTERNS = {
  // Sets and reps
  setsReps: /(\d+)\s*(?:x|sets?\s+of|X)\s*(\d+(?:-\d+)?|\[\d+(?:,\s*\d+)*\])/gi,
  
  // Duration patterns
  duration: /(\d+(?:\.\d+)?)\s*(?:sec|second|min|minute|hr|hour)s?(?:\s|$)|(\d+):(\d+)(?::(\d+))?/gi,
  
  // Rest patterns
  rest: /rest\s+(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:sec|second|min|minute)s?|rest\s+(\d+):(\d+)/gi,
  
  // Distance patterns
  distance: /(\d+(?:\.\d+)?)\s*(m|meter|km|kilometer|mi|mile|cal|calorie|ft|feet|yd|yard)s?\b/gi,
  
  // Weight patterns
  weight: /(\d+(?:\.\d+)?)\s*(lb|lbs|kg|kgs|#)s?\b/gi,
  
  // Times through (rounds, repetitions)
  timesThrough: /(?:repeat\s+)?(?:x|×)\s*(\d+)|(\d+)\s+(?:rounds?|times?|circuits?)/gi,
  
  // Workout types
  workoutTypes: /\b(AMRAP|EMOM|Tabata|For\s+time|Ladder|Superset|Circuit|Metcon|WOD)\b/gi,
}

// Equipment dictionary with aliases
const EQUIPMENT_DICT: { [key: string]: string } = {
  'dumbbell': 'dumbbell',
  'db': 'dumbbell',
  'dumbell': 'dumbbell',
  'kettlebell': 'kettlebell',
  'kb': 'kettlebell',
  'barbell': 'barbell',
  'bb': 'barbell',
  'ez bar': 'ez-bar',
  'ezbar': 'ez-bar',
  'pull up bar': 'pull-up-bar',
  'pullup bar': 'pull-up-bar',
  'resistance band': 'band',
  'band': 'band',
  'cable': 'cable',
  'machine': 'machine',
  'bodyweight': 'bodyweight',
  'bw': 'bodyweight',
  'box': 'box',
  'bench': 'bench',
  'rack': 'rack',
  'squat rack': 'squat-rack',
  'smith machine': 'smith-machine',
  'treadmill': 'treadmill',
  'bike': 'bike',
  'rower': 'rower',
  'rowing machine': 'rower',
  'elliptical': 'elliptical',
}

// Body parts dictionary
const BODY_PARTS_DICT: { [key: string]: string } = {
  'chest': 'chest',
  'pecs': 'chest',
  'back': 'back',
  'lats': 'back',
  'shoulders': 'shoulders',
  'delts': 'shoulders',
  'arms': 'arms',
  'biceps': 'biceps',
  'triceps': 'triceps',
  'legs': 'legs',
  'quads': 'quads',
  'quadriceps': 'quads',
  'hamstrings': 'hamstrings',
  'hams': 'hamstrings',
  'glutes': 'glutes',
  'calves': 'calves',
  'core': 'core',
  'abs': 'core',
  'abdominals': 'core',
  'full body': 'full-body',
  'fullbody': 'full-body',
}

export function parseWorkoutCaption(caption: string, title: string = ''): ParsedWorkout {
  const lines = caption.split('\n').map(line => line.trim()).filter(Boolean)
  const steps: WorkoutStep[] = []
  const meta: WorkoutMeta = {
    equipment: [],
    workoutTypes: [],
    tags: [],
    bodyParts: []
  }

  let detectedTitle = title
  let order = 0
  let totalTimeEstimate = 0
  let globalRounds = 1 // Track rounds that apply to all exercises

  // Detect title if not provided
  if (!detectedTitle && lines.length > 0) {
    const firstLine = lines[0]
    // Use first line as title if it doesn't look like an exercise or rounds specification
    if (!containsExercisePattern(firstLine) && !firstLine.match(/^\d+\s+(?:rounds?|circuits?|times?)$/i)) {
      detectedTitle = firstLine.replace(/[#@]/g, '').trim()
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip empty lines and hashtags
    if (!line || line.startsWith('#') || line.startsWith('@')) {
      continue
    }

    // Skip the title line if we detected it
    if (line === detectedTitle) {
      continue
    }

    // Check if this line specifies global rounds
    const roundsMatch = line.match(/^(\d+)\s+(?:rounds?|circuits?|times?)$/i)
    if (roundsMatch) {
      globalRounds = parseInt(roundsMatch[1])
      continue // Skip this line, don't treat it as an exercise
    }

    const step = parseLine(line, order, globalRounds)
    
    if (step) {
      steps.push(step)
      order++

      // Estimate time for this step
      const stepTime = estimateStepTime(step)
      if (stepTime > 0) {
        totalTimeEstimate += stepTime
      }
    }
  }

  // Extract metadata from the entire caption
  extractEquipment(caption, meta)
  extractBodyParts(caption, meta)
  extractWorkoutTypes(caption, meta)

  return {
    title: title || detectedTitle || 'Untitled Workout',
    detectedTitle,
    steps,
    meta,
    totalTimeEstimateSec: totalTimeEstimate > 0 ? totalTimeEstimate : undefined
  }
}

function parseLine(line: string, order: number, globalRounds: number = 1): WorkoutStep | null {
  const cleanLine = line.trim()
  
  if (!cleanLine) return null

  // Check if it's a rest period
  if (containsRestPattern(cleanLine)) {
    return parseRestStep(cleanLine, order)
  }

  // Check if it's a workout type header (AMRAP, EMOM, etc.)
  const workoutTypeMatch = cleanLine.match(PATTERNS.workoutTypes)
  if (workoutTypeMatch && cleanLine.length < 50) {
    return {
      order,
      type: 'header',
      raw: cleanLine,
      workoutTypeHint: workoutTypeMatch[0].toLowerCase()
    }
  }

  // Parse as exercise
  return parseExerciseStep(cleanLine, order, globalRounds)
}

function parseExerciseStep(line: string, order: number, globalRounds: number = 1): WorkoutStep {
  const step: WorkoutStep = {
    order,
    type: 'exercise',
    raw: line
  }

  // Extract exercise name (remove numbers, sets, reps, etc.)
  let exerciseName = line
  
  // Remove sets x reps patterns
  exerciseName = exerciseName.replace(PATTERNS.setsReps, '').trim()
  
  // Remove duration patterns
  exerciseName = exerciseName.replace(PATTERNS.duration, '').trim()
  
  // Remove distance patterns
  exerciseName = exerciseName.replace(PATTERNS.distance, '').trim()
  
  // Remove weight patterns
  exerciseName = exerciseName.replace(PATTERNS.weight, '').trim()
  
  // Remove common separators and clean up
  exerciseName = exerciseName.replace(/[-–—:]\s*$/, '').trim()
  exerciseName = exerciseName.replace(/^\d+\.\s*/, '').trim() // Remove numbering
  exerciseName = exerciseName.replace(/^\d+\s/, '').trim() // Remove leading numbers (rep count)
  
  if (exerciseName) {
    step.exercise = exerciseName
  }

  // Extract sets and reps
  const setsRepsMatch = line.match(PATTERNS.setsReps)
  if (setsRepsMatch) {
    const [, sets, reps] = setsRepsMatch
    if (sets) {
      step.sets = parseInt(sets) * globalRounds // Multiply by global rounds
    }
    
    // Handle rep ranges or arrays
    if (reps && reps.includes('-')) {
      const [min, max] = reps.split('-').map(r => parseInt(r.trim()))
      step.repsJson = JSON.stringify([min, max])
    } else if (reps && reps.startsWith('[') && reps.endsWith(']')) {
      const repArray = reps.slice(1, -1).split(',').map(r => parseInt(r.trim()))
      step.repsJson = JSON.stringify(repArray)
    } else if (reps) {
      step.repsJson = JSON.stringify(parseInt(reps))
    }
  } else {
    // Check if line starts with a number (indicating reps)
    const repMatch = line.match(/^\d+/)
    if (repMatch) {
      const reps = parseInt(repMatch[0])
      step.sets = globalRounds // Use global rounds as sets
      step.repsJson = JSON.stringify(reps)
    }
  }

  // Extract duration
  const durationMatch = line.match(PATTERNS.duration)
  if (durationMatch) {
    step.duration = parseDurationToSeconds(durationMatch[0])
  }

  // Extract distance
  const distanceMatch = line.match(PATTERNS.distance)
  if (distanceMatch) {
    step.distance = distanceMatch[0].trim()
    if (!step.sets) {
      step.sets = globalRounds // Use global rounds for distance exercises too
    }
  }

  // Extract weight
  const weightMatch = line.match(PATTERNS.weight)
  if (weightMatch) {
    step.weight = weightMatch[0].trim()
  }

  // Extract times through (this overrides global rounds if present)
  const timesMatch = line.match(PATTERNS.timesThrough)
  if (timesMatch) {
    const times = timesMatch[1] || timesMatch[2]
    step.timesThrough = parseInt(times)
    step.sets = parseInt(times) // Override with specific times through
  }

  return step
}

function parseRestStep(line: string, order: number): WorkoutStep {
  const step: WorkoutStep = {
    order,
    type: 'rest',
    raw: line
  }

  const restMatch = line.match(PATTERNS.rest)
  if (restMatch) {
    const duration = restMatch[1] || `${restMatch[2]}:${restMatch[3]}`
    step.duration = parseDurationToSeconds(duration)
  } else {
    // Try to extract any number as seconds
    const numberMatch = line.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      step.duration = parseFloat(numberMatch[1])
    }
  }

  return step
}

function containsExercisePattern(line: string): boolean {
  return PATTERNS.setsReps.test(line) || 
         PATTERNS.duration.test(line) || 
         PATTERNS.distance.test(line) ||
         PATTERNS.weight.test(line)
}

function containsRestPattern(line: string): boolean {
  return /\brest\b/i.test(line)
}

function parseDurationToSeconds(duration: string): number {
  // Handle MM:SS or HH:MM:SS format
  const timeMatch = duration.match(/(\d+):(\d+)(?::(\d+))?/)
  if (timeMatch) {
    const [, first, second, third] = timeMatch
    if (third) {
      // HH:MM:SS format
      return parseInt(first) * 3600 + parseInt(second) * 60 + parseInt(third)
    } else {
      // MM:SS format
      return parseInt(first) * 60 + parseInt(second)
    }
  }

  // Handle text format (30 sec, 1.5 min, etc.)
  const numberMatch = duration.match(/(\d+(?:\.\d+)?)/)
  if (!numberMatch) return 0
  
  const value = parseFloat(numberMatch[1])
  
  if (/\bhr|hour/i.test(duration)) {
    return value * 3600
  } else if (/\bmin|minute/i.test(duration)) {
    return value * 60
  } else {
    // Default to seconds
    return value
  }
}

function extractEquipment(text: string, meta: WorkoutMeta) {
  const equipment = new Set<string>()
  const lowerText = text.toLowerCase()
  
  for (const [key, normalized] of Object.entries(EQUIPMENT_DICT)) {
    if (lowerText.includes(key)) {
      equipment.add(normalized)
    }
  }
  
  meta.equipment = Array.from(equipment)
}

function extractBodyParts(text: string, meta: WorkoutMeta) {
  const bodyParts = new Set<string>()
  const lowerText = text.toLowerCase()
  
  for (const [key, normalized] of Object.entries(BODY_PARTS_DICT)) {
    if (lowerText.includes(key)) {
      bodyParts.add(normalized)
    }
  }
  
  meta.bodyParts = Array.from(bodyParts)
}

function extractWorkoutTypes(text: string, meta: WorkoutMeta) {
  const types = new Set<string>()
  const matches = text.matchAll(PATTERNS.workoutTypes)
  
  for (const match of matches) {
    types.add(match[0].toLowerCase().replace(/\s+/g, '-'))
  }
  
  meta.workoutTypes = Array.from(types)
}

function estimateStepTime(step: WorkoutStep): number {
  if (step.type === 'rest' && step.duration) {
    return step.duration
  }
  
  if (step.type === 'exercise') {
    // If explicit duration is provided, use it
    if (step.duration) {
      return step.duration * (step.sets || 1)
    }
    
    // If distance is provided, estimate based on movement type
    if (step.distance) {
      return estimateDistanceTime(step.distance)
    }
    
    // If sets and reps, estimate based on movement tempo
    if (step.sets && step.repsJson) {
      try {
        const reps = JSON.parse(step.repsJson)
        const repCount = Array.isArray(reps) ? Math.max(...reps) : reps
        // Estimate 2 seconds per rep + 30 seconds rest between sets
        return (repCount * 2 + 30) * step.sets
      } catch (e) {
        // Fallback
        return 120 // 2 minutes default
      }
    }
  }
  
  return 0
}

function estimateDistanceTime(distance: string): number {
  const match = distance.match(/(\d+(?:\.\d+)?)\s*(m|meter|km|kilometer|mi|mile|cal|calorie)/i)
  if (!match) return 120 // Default 2 minutes
  
  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  
  switch (unit) {
    case 'm':
    case 'meter':
      // Assume moderate pace: 1m = 4 seconds (15m/min pace)
      return Math.round(value * 4)
    
    case 'km':
    case 'kilometer':
      // Assume 6 min/km pace
      return value * 360
    
    case 'mi':
    case 'mile':
      // Assume 9 min/mile pace
      return value * 540
    
    case 'cal':
    case 'calorie':
      // Assume 15 calories per minute
      return Math.round((value / 15) * 60)
    
    default:
      return 120
  }
}

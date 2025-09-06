// Comprehensive workout glossary data structure
// Based on spotter_workout_glossary.md

export interface ExerciseTerm {
  term: string;
  category: 'format' | 'structure' | 'technique' | 'intensity';
  aliases: string[];
  definition: string;
}

export interface Exercise {
  name: string;
  aliases: string[];
  muscleGroups: string[];
  equipment: string;
  units: string[];
  description: string;
  category?: 'upper_chest' | 'upper_back' | 'lower_body' | 'full_body' | 'core' | 'cardio';
}

export interface WorkoutStyle {
  name: string;
  aliases: string[];
  description: string;
  indicators: string[]; // Text patterns that suggest this style
}

export interface Equipment {
  name: string;
  aliases: string[];
  category?: 'free_weight' | 'machine' | 'bodyweight' | 'cardio' | 'functional';
}

export interface BodyPart {
  name: string;
  aliases: string[];
  muscleGroups?: string[];
}

// Workout format terms and patterns
export const EXERCISE_TERMS: ExerciseTerm[] = [
  {
    term: 'AMRAP',
    category: 'format',
    aliases: ['as many reps as possible', 'as many rounds as possible', 'amrap'],
    definition: 'Complete as many reps or rounds as possible within a time window.'
  },
  {
    term: 'EMOM',
    category: 'format',
    aliases: ['every minute on the minute', 'e1mom', 'emom'],
    definition: 'Start prescribed work each minute; rest the remainder.'
  },
  {
    term: 'E2MOM',
    category: 'format',
    aliases: ['every 2 minutes on the minute', 'e2mom'],
    definition: 'Start prescribed work every 2 minutes; rest the remainder.'
  },
  {
    term: 'E3MOM',
    category: 'format',
    aliases: ['every 3 minutes on the minute', 'e3mom'],
    definition: 'Start prescribed work every 3 minutes; rest the remainder.'
  },
  {
    term: 'E4MOM',
    category: 'format',
    aliases: ['every 4 minutes on the minute', 'e4mom'],
    definition: 'Start prescribed work every 4 minutes; rest the remainder.'
  },
  {
    term: 'For Time',
    category: 'format',
    aliases: ['for time', 'ft', 'complete for time'],
    definition: 'Complete the prescribed work as fast as possible; record total time.'
  },
  {
    term: 'Tabata',
    category: 'format',
    aliases: ['tabata protocol'],
    definition: '20s all-out effort, 10s rest, repeated for 8 rounds (4 minutes total).'
  },
  {
    term: 'Chipper',
    category: 'format',
    aliases: ['chip away', 'chipper workout'],
    definition: 'A long single-round list of movements/reps completed for time.'
  },
  {
    term: 'Superset',
    category: 'structure',
    aliases: ['supersetting', 'super set'],
    definition: 'Two exercises performed back-to-back without rest, then rest.'
  },
  {
    term: 'Circuit',
    category: 'structure',
    aliases: ['circuit training', 'circuit workout'],
    definition: 'A sequence of exercises performed one after another with minimal rest.'
  },
  {
    term: 'Ladder',
    category: 'structure',
    aliases: ['rep ladder', 'ascending ladder', 'descending ladder'],
    definition: 'Reps ascend or descend each set in a pattern (e.g., 1-2-3-4-5).'
  },
  {
    term: 'Drop Set',
    category: 'technique',
    aliases: ['strip set', 'dropset'],
    definition: 'Reduce weight immediately after near-failure and continue.'
  },
  {
    term: 'Pyramid Set',
    category: 'structure',
    aliases: ['pyramid', 'pyramid training'],
    definition: 'Increase weight and decrease reps each set or vice versa.'
  },
  {
    term: 'Complex',
    category: 'structure',
    aliases: ['movement complex', 'barbell complex', 'dumbbell complex'],
    definition: 'Multiple exercises performed consecutively with the same implement.'
  },
  {
    term: 'HIIT',
    category: 'intensity',
    aliases: ['high intensity interval training', 'interval training'],
    definition: 'Short bursts of intense work alternated with rests.'
  },
  {
    term: 'Metcon',
    category: 'intensity',
    aliases: ['metabolic conditioning', 'metcon workout'],
    definition: 'High-intensity conditioning circuits that tax muscular and cardiovascular systems.'
  }
];

// Comprehensive exercise database
export const EXERCISES: Exercise[] = [
  // Upper Body - Chest & Shoulders
  {
    name: 'Push-Up',
    aliases: ['push up', 'pushups', 'push-ups'],
    muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: 'bodyweight',
    units: ['reps', 'time'],
    description: 'Bodyweight press emphasizing chest, front delts, triceps.',
    category: 'upper_chest'
  },
  {
    name: 'Bench Press',
    aliases: ['bench', 'bb bench press', 'barbell bench press', 'db bench press', 'dumbbell bench press'],
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Press from supine; primary chest builder.',
    category: 'upper_chest'
  },
  {
    name: 'Overhead Press',
    aliases: ['shoulder press', 'military press', 'strict press', 'press', 'db shoulder press'],
    muscleGroups: ['shoulders', 'triceps', 'core'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Press from shoulder to overhead; shoulders/triceps.',
    category: 'upper_chest'
  },
  {
    name: 'Dumbbell Fly',
    aliases: ['db fly', 'chest fly', 'dumbbell flye'],
    muscleGroups: ['chest'],
    equipment: 'dumbbell',
    units: ['sets', 'reps', 'load'],
    description: 'Chest isolation; arms arc out/in while lying on a bench.',
    category: 'upper_chest'
  },
  {
    name: 'Lateral Raise',
    aliases: ['side raise', 'db lateral raise', 'lateral raises'],
    muscleGroups: ['shoulders'],
    equipment: 'dumbbell',
    units: ['sets', 'reps', 'load'],
    description: 'Shoulder isolation; raises DBs to the sides for lateral delts.',
    category: 'upper_chest'
  },

  // Upper Body - Back & Arms
  {
    name: 'Pull-Up',
    aliases: ['pullup', 'pull ups', 'pullups'],
    muscleGroups: ['back', 'biceps'],
    equipment: 'bodyweight',
    units: ['reps', 'sets'],
    description: 'Vertical pull; lats, upper back, biceps.',
    category: 'upper_back'
  },
  {
    name: 'Chin-Up',
    aliases: ['chinup', 'chin ups', 'chinups'],
    muscleGroups: ['back', 'biceps'],
    equipment: 'bodyweight',
    units: ['reps', 'sets'],
    description: 'Vertical pull with supinated grip; lats, upper back, biceps.',
    category: 'upper_back'
  },
  {
    name: 'Bent-Over Row',
    aliases: ['bb row', 'barbell row', 'db row', 'dumbbell row', 'bent over row'],
    muscleGroups: ['back', 'biceps'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Horizontal pull for back/biceps; strong posterior chain engagement.',
    category: 'upper_back'
  },
  {
    name: 'Deadlift',
    aliases: ['dl', 'conventional deadlift', 'sumo deadlift'],
    muscleGroups: ['glutes', 'hamstrings', 'back', 'core'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Full-body hinge: glutes, hamstrings, back, grip.',
    category: 'full_body'
  },
  {
    name: 'Romanian Deadlift',
    aliases: ['rdl', 'romanian dl', 'stiff leg deadlift'],
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Hip-hinge with constant tension; hamstrings and glutes focus.',
    category: 'lower_body'
  },
  {
    name: 'Biceps Curl',
    aliases: ['db curl', 'barbell curl', 'hammer curl', 'curls'],
    muscleGroups: ['biceps'],
    equipment: 'dumbbell',
    units: ['sets', 'reps', 'load'],
    description: 'Elbow flexion isolation; various grips.',
    category: 'upper_back'
  },
  {
    name: 'Triceps Extension',
    aliases: ['tricep extension', 'overhead extension', 'skull crusher'],
    muscleGroups: ['triceps'],
    equipment: 'dumbbell',
    units: ['sets', 'reps', 'load'],
    description: 'Elbow extension isolation; overhead, lying, or cable variations.',
    category: 'upper_chest'
  },

  // Lower Body
  {
    name: 'Back Squat',
    aliases: ['squat', 'bb squat', 'barbell squat', 'back squats'],
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Fundamental knee/hip dominant lift.',
    category: 'lower_body'
  },
  {
    name: 'Front Squat',
    aliases: ['front squats', 'bb front squat'],
    muscleGroups: ['quadriceps', 'glutes', 'core'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Squat with bar in front rack position.',
    category: 'lower_body'
  },
  {
    name: 'Goblet Squat',
    aliases: ['goblet squats', 'kb goblet squat', 'db goblet squat'],
    muscleGroups: ['quadriceps', 'glutes', 'core'],
    equipment: 'kettlebell',
    units: ['sets', 'reps', 'load'],
    description: 'Squat holding weight at chest level.',
    category: 'lower_body'
  },
  {
    name: 'Lunge',
    aliases: ['lunges', 'forward lunge', 'reverse lunge', 'walking lunge'],
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'bodyweight',
    units: ['reps', 'distance'],
    description: 'Unilateral knee-dominant; balance and stability.',
    category: 'lower_body'
  },
  {
    name: 'Reverse Lunge',
    aliases: ['reverse lunges', 'backward lunge'],
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'bodyweight',
    units: ['reps'],
    description: 'Unilateral lunge stepping backward.',
    category: 'lower_body'
  },
  {
    name: 'Hip Thrust',
    aliases: ['hip thrusts', 'glute bridge', 'bb hip thrust'],
    muscleGroups: ['glutes', 'hamstrings'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Glute-focused hip extension.',
    category: 'lower_body'
  },
  {
    name: 'Calf Raise',
    aliases: ['calf raises', 'standing calf raise'],
    muscleGroups: ['calves'],
    equipment: 'bodyweight',
    units: ['sets', 'reps'],
    description: 'Gastrocnemius/soleus isolation.',
    category: 'lower_body'
  },

  // Full-Body & Dynamic Movements
  {
    name: 'Burpee',
    aliases: ['burpees', 'burpee to plate'],
    muscleGroups: ['full-body'],
    equipment: 'bodyweight',
    units: ['reps', 'time'],
    description: 'Squat-thrust + push-up + jump; full-body conditioning.',
    category: 'full_body'
  },
  {
    name: 'Burpee Over Box',
    aliases: ['burpee over obstacle', 'box burpee'],
    muscleGroups: ['full-body'],
    equipment: 'box',
    units: ['reps'],
    description: 'Burpee with lateral jump over box.',
    category: 'full_body'
  },
  {
    name: 'Thruster',
    aliases: ['thrusters', 'bb thruster', 'db thruster'],
    muscleGroups: ['quadriceps', 'glutes', 'shoulders', 'core'],
    equipment: 'barbell',
    units: ['sets', 'reps', 'load'],
    description: 'Front squat into push press; full-body power conditioning.',
    category: 'full_body'
  },
  {
    name: 'Kettlebell Swing',
    aliases: ['kb swing', 'russian swing', 'american swing', 'full kb swings', 'kb swings'],
    muscleGroups: ['glutes', 'hamstrings', 'back', 'core'],
    equipment: 'kettlebell',
    units: ['reps', 'time'],
    description: 'Explosive hip hinge with kettlebell.',
    category: 'full_body'
  },
  {
    name: 'Kettlebell Swing (American)',
    aliases: ['american kb swing', 'overhead swing', 'full swing'],
    muscleGroups: ['glutes', 'hamstrings', 'back', 'core', 'shoulders'],
    equipment: 'kettlebell',
    units: ['reps', 'time'],
    description: 'KB swing to overhead position.',
    category: 'full_body'
  },
  {
    name: 'Kettlebell Dead Tap Swing',
    aliases: ['dead tap swings', 'kb dead swing'],
    muscleGroups: ['glutes', 'hamstrings', 'back', 'core'],
    equipment: 'kettlebell',
    units: ['reps'],
    description: 'KB swing starting from dead stop on ground.',
    category: 'full_body'
  },
  {
    name: 'Kettlebell Clean',
    aliases: ['kb clean', 'kettlebell cleans'],
    muscleGroups: ['glutes', 'hamstrings', 'back', 'shoulders'],
    equipment: 'kettlebell',
    units: ['reps', 'load'],
    description: 'Explosive lift bringing KB to rack position.',
    category: 'full_body'
  },
  {
    name: 'Goblet Clean',
    aliases: ['goblet cleans', 'kb goblet clean'],
    muscleGroups: ['glutes', 'hamstrings', 'back', 'shoulders'],
    equipment: 'kettlebell',
    units: ['reps', 'load'],
    description: 'Clean bringing KB to goblet position at chest.',
    category: 'full_body'
  },
  {
    name: 'Kettlebell Gorilla Row',
    aliases: ['kb gorilla row', 'gorilla row'],
    muscleGroups: ['back', 'biceps', 'core'],
    equipment: 'kettlebell',
    units: ['reps', 'load'],
    description: 'Bent-over row with wide stance and alternating arms.',
    category: 'upper_back'
  },
  {
    name: 'Devil Press',
    aliases: ['devils press', 'devil\'s press', 'db devil press'],
    muscleGroups: ['full-body'],
    equipment: 'dumbbell',
    units: ['reps', 'load'],
    description: 'Burpee with dumbbells into overhead press.',
    category: 'full_body'
  },
  {
    name: 'Farmer Carry',
    aliases: ['farmers carry', 'farmer walk', 'farmers walk'],
    muscleGroups: ['grip', 'traps', 'core', 'legs'],
    equipment: 'dumbbell',
    units: ['distance', 'time', 'load'],
    description: 'Loaded carry with heavy implements.',
    category: 'full_body'
  },
  {
    name: 'Wall Ball',
    aliases: ['wall balls', 'wall ball shot'],
    muscleGroups: ['quadriceps', 'glutes', 'shoulders', 'core'],
    equipment: 'medicine ball',
    units: ['reps', 'load'],
    description: 'Squat + med-ball throw to target.',
    category: 'full_body'
  },
  {
    name: 'Box Jump',
    aliases: ['box jumps', 'jump ups'],
    muscleGroups: ['quadriceps', 'glutes', 'calves'],
    equipment: 'box',
    units: ['reps'],
    description: 'Plyometric jump to box; power/coordination.',
    category: 'lower_body'
  },
  {
    name: 'Box Step Up',
    aliases: ['box step ups', 'step ups', 'step-ups'],
    muscleGroups: ['quadriceps', 'glutes'],
    equipment: 'box',
    units: ['reps'],
    description: 'Step up onto box alternating legs.',
    category: 'lower_body'
  },

  // Cardio Equipment
  {
    name: 'Row',
    aliases: ['rowing', 'erg', 'rower', 'row erg'],
    muscleGroups: ['back', 'legs', 'core'],
    equipment: 'rower',
    units: ['distance', 'time', 'calories'],
    description: 'Rowing ergometer for cardio and strength.',
    category: 'cardio'
  },
  {
    name: 'SkiErg',
    aliases: ['ski', 'ski erg', 'skiing'],
    muscleGroups: ['back', 'core', 'triceps'],
    equipment: 'skierg',
    units: ['distance', 'time', 'calories'],
    description: 'Ski ergometer mimicking cross-country skiing motion.',
    category: 'cardio'
  },
  {
    name: 'Bike',
    aliases: ['biking', 'assault bike', 'echo bike', 'air bike'],
    muscleGroups: ['legs', 'core'],
    equipment: 'bike',
    units: ['distance', 'time', 'calories'],
    description: 'Stationary bike for cardio conditioning.',
    category: 'cardio'
  },
  {
    name: 'Run',
    aliases: ['running', 'runs', 'jog', 'jogging'],
    muscleGroups: ['legs', 'core'],
    equipment: 'bodyweight',
    units: ['distance', 'time'],
    description: 'Running for cardiovascular conditioning.',
    category: 'cardio'
  },

  // Core
  {
    name: 'Plank',
    aliases: ['planks', 'front plank'],
    muscleGroups: ['core', 'shoulders'],
    equipment: 'bodyweight',
    units: ['time'],
    description: 'Isometric trunk stability hold.',
    category: 'core'
  },
  {
    name: 'Mountain Climbers',
    aliases: ['mountain climber', 'mt climbers'],
    muscleGroups: ['core', 'shoulders'],
    equipment: 'bodyweight',
    units: ['reps', 'time'],
    description: 'Alternating knee drives from plank position.',
    category: 'core'
  },

  // Sandbag exercises
  {
    name: 'Sandbag Lunge',
    aliases: ['sandbag lunges', 'sb lunge'],
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    equipment: 'sandbag',
    units: ['reps', 'load'],
    description: 'Lunge holding sandbag for added resistance.',
    category: 'lower_body'
  },
  {
    name: 'Dumbbell Back Squat',
    aliases: ['db back squat', 'dumbbell squat'],
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'dumbbell',
    units: ['sets', 'reps', 'load'],
    description: 'Squat holding dumbbells for resistance.',
    category: 'lower_body'
  }
];

// Workout styles and their indicators
export const WORKOUT_STYLES: WorkoutStyle[] = [
  {
    name: 'HIIT',
    aliases: ['high intensity interval training', 'intervals', 'interval training'],
    description: 'High-intensity intervals with short rests.',
    indicators: ['intervals', 'hiit', 'high intensity', 'work:rest', 'tabata']
  },
  {
    name: 'CrossFit',
    aliases: ['crossfit', 'wod', 'workout of the day'],
    description: 'Varied functional training with timed/scored workouts.',
    indicators: ['wod', 'crossfit', 'for time', 'amrap', 'emom', 'rx', 'scaled']
  },
  {
    name: 'Strength Training',
    aliases: ['strength', 'powerlifting', 'max strength'],
    description: 'Low-rep heavy sets for maximal strength.',
    indicators: ['1rm', 'max', 'strength', 'heavy', 'powerlifting', '5x5', '3x3']
  },
  {
    name: 'Bodybuilding',
    aliases: ['hypertrophy', 'muscle building', 'bodybuilding'],
    description: 'Moderate loads, moderate-to-high volume to build muscle size.',
    indicators: ['hypertrophy', 'bodybuilding', 'muscle', 'isolation', '3x12', '4x10']
  },
  {
    name: 'Metabolic Conditioning',
    aliases: ['metcon', 'conditioning', 'metabolic'],
    description: 'High-intensity circuits taxing muscular and cardiovascular systems.',
    indicators: ['metcon', 'conditioning', 'metabolic', 'circuit', 'cardio']
  },
  {
    name: 'Functional Training',
    aliases: ['functional', 'movement', 'athletic'],
    description: 'Multi-joint, real-life movement patterns emphasizing stability and coordination.',
    indicators: ['functional', 'movement', 'athletic', 'carries', 'unilateral']
  }
];

// Equipment categories
export const EQUIPMENT: Equipment[] = [
  { name: 'Barbell', aliases: ['bb', 'barbell'], category: 'free_weight' },
  { name: 'Dumbbell', aliases: ['db', 'dumbbell', 'dumbbells'], category: 'free_weight' },
  { name: 'Kettlebell', aliases: ['kb', 'kettlebell', 'kettlebells'], category: 'free_weight' },
  { name: 'Bodyweight', aliases: ['bw', 'bodyweight', 'body weight'], category: 'bodyweight' },
  { name: 'Medicine Ball', aliases: ['med ball', 'medicine ball', 'wall ball'], category: 'functional' },
  { name: 'Sandbag', aliases: ['sb', 'sandbag', 'sand bag'], category: 'functional' },
  { name: 'Box', aliases: ['plyo box', 'jump box', 'step'], category: 'functional' },
  { name: 'Rower', aliases: ['erg', 'row erg', 'rowing machine'], category: 'cardio' },
  { name: 'SkiErg', aliases: ['ski erg', 'ski ergometer'], category: 'cardio' },
  { name: 'Bike', aliases: ['assault bike', 'echo bike', 'air bike', 'stationary bike'], category: 'cardio' },
  { name: 'Bench', aliases: ['bench', 'weight bench'], category: 'functional' },
  { name: 'Cable', aliases: ['cable machine', 'cables'], category: 'machine' },
  { name: 'Machine', aliases: ['machine', 'weight machine'], category: 'machine' },
  { name: 'Resistance Band', aliases: ['band', 'resistance band', 'bands'], category: 'functional' }
];

// Body parts and muscle groups
export const BODY_PARTS: BodyPart[] = [
  {
    name: 'Chest',
    aliases: ['chest', 'pecs', 'pectorals'],
    muscleGroups: ['pectorals', 'chest']
  },
  {
    name: 'Back',
    aliases: ['back', 'lats', 'upper back', 'latissimus', 'rhomboids', 'traps'],
    muscleGroups: ['latissimus dorsi', 'rhomboids', 'trapezius', 'rear delts']
  },
  {
    name: 'Shoulders',
    aliases: ['shoulders', 'delts', 'deltoids'],
    muscleGroups: ['anterior deltoid', 'posterior deltoid', 'lateral deltoid']
  },
  {
    name: 'Arms',
    aliases: ['arms', 'biceps', 'triceps'],
    muscleGroups: ['biceps', 'triceps', 'forearms']
  },
  {
    name: 'Legs',
    aliases: ['legs', 'lower body', 'leg day', 'quads', 'hamstrings', 'glutes', 'calves'],
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'hip flexors']
  },
  {
    name: 'Core',
    aliases: ['core', 'abs', 'abdominals', 'trunk'],
    muscleGroups: ['rectus abdominis', 'obliques', 'transverse abdominis', 'erector spinae']
  },
  {
    name: 'Full Body',
    aliases: ['full body', 'total body', 'compound'],
    muscleGroups: ['multiple muscle groups']
  }
];
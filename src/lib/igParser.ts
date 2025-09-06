// lib/igParser.ts
// Spotter Instagram Workout Parser — v1.2
// - Reads raw caption text
// - Uses reference glossary (aliases, units, equipment) for canonicalization
// - Outputs: WorkoutAST, editable table rows, and WorkoutV1 payload

import { EXERCISES, EXERCISE_TERMS, WORKOUT_STYLES, EQUIPMENT, BODY_PARTS } from './workout-glossary';

// ====== Types ======
export type Quantity = { type: 'reps'|'m'|'cal'|'sec'|'min'; value: number };
export type Load = { qty?: number; unit?: 'kg'|'lb'; implements?: 'DB'|'KB'|'BB'|'SB'|'MB'|'BW'|string; pairs?: number; misc?: string };
export type Movement = { name: string; raw?: string; quantity?: Quantity; load?: Load; notes?: string; equipment?: string[]; bodyParts?: string[] };

export type RoundInsert = { every: number; movement: Movement };

export type ModeKind = 'E#MOM'|'EMOM'|'AMRAP'|'ForTime'|'FixedRounds'|'Complex'|'Ladder'|'Superset'|'Circuit'|'Intervals';

export type Block = {
  title?: string;
  mode?: { kind: ModeKind; windowSec?: number; rounds?: number; capSec?: number };
  rounds?: number;
  restBetweenBlocksSec?: number;
  ladder?: number[];                 // e.g., [5,6,7,8]
  perRoundInserts?: RoundInsert[];   // e.g., every 5 rounds add 400m run
  sequence: Movement[];              // movements in one round/window
  interval?: { workSec: number; restSec: number; apply: 'perExercise'|'perRound' }; // NEW
};

export type Scaling = {
  male?: { load?: string; box?: string };
  female?: { load?: string; box?: string };
  rxScaled?: { rx?: string; scaled?: string };
};

export type WorkoutAST = {
  title?: string;
  blocks: Block[];
  scoring?: 'time'|'rounds'|'reps';
  capSec?: number;
  scaling?: Scaling;
  notes?: string[];
  provenance?: { platform?: 'instagram'|'tiktok'|'youtube'|'facebook'|'unknown'; url?: string };
  glossaryHits?: string[];           // matched terms
  confidence?: number;               // quick heuristic 0..1
};

export type WorkoutRow = {
  block: string;
  round: number;
  movement: string;
  qty: string;        // "20 reps" | "400 m" | "45 sec"
  load?: string;      // "2x50 lb DB" | "48 kg KB"
  notes?: string;
};

export type WorkoutV1 = {
  workout: {
    title: string;
    exercises: { name: string; sets?: number|string; reps?: number|string; rest?: string|number; duration?: string|number; tempo?: string; notes?: string }[];
    total_time?: string|number;
    equipment?: string[];
    tags?: string[];
  };
  provenance: {
    source_url: string;
    platform?: 'instagram'|'tiktok'|'youtube'|'facebook'|'unknown';
    used_caption: boolean;
    used_transcript: boolean;
    caption_excerpt?: string;
    transcript_excerpt?: string;
  };
  parse_notes?: string;
  confidence?: { overall?: number; fields?: Record<string, number> };
};

// ====== Glossary indexer ======
export type Glossary = {
  exerciseTerms: { term: string; category: string; aliases?: string[]; definition?: string }[];
  exercises: { name: string; aliases?: string[]; muscle_groups?: string[]; equipment?: string; units?: string[]; description?: string }[];
  workoutStyles?: { name: string; aliases?: string[]; description?: string }[];
  equipment?: { name: string; aliases?: string[] }[];
  bodyParts?: { name: string; aliases?: string[] }[];
};

export type RefIndex = {
  terms: Map<string, { term: string; category: string }>;
  exercises: Map<string, { name: string; equipment?: string; muscle_groups?: string[]; units?: string[] }>;
  equipment: Map<string, string>;   // alias -> canonical
  bodyParts: Map<string, string>;
};

export function buildRefIndex(glossary: Glossary): RefIndex {
  const norm = (s:string) => s.toLowerCase().trim();
  const terms = new Map<string, {term:string; category:string}>();
  const exercises = new Map<string, {name:string; equipment?:string; muscle_groups?:string[]; units?:string[]}>();
  const equipment = new Map<string,string>();
  const bodyParts = new Map<string,string>();

  // terms & formats
  for (const t of glossary.exerciseTerms ?? []) {
    terms.set(norm(t.term), { term: t.term, category: t.category });
    for (const a of t.aliases ?? []) terms.set(norm(a), { term: t.term, category: t.category });
  }
  // exercises
  for (const e of glossary.exercises ?? []) {
    exercises.set(norm(e.name), { name: e.name, equipment: e.equipment, muscle_groups: e.muscle_groups, units: e.units });
    for (const a of e.aliases ?? []) exercises.set(norm(a), { name: e.name, equipment: e.equipment, muscle_groups: e.muscle_groups, units: e.units });
  }
  // equipment
  for (const eq of glossary.equipment ?? []) {
    equipment.set(norm(eq.name), eq.name);
    for (const a of eq.aliases ?? []) equipment.set(norm(a), eq.name);
  }
  // body parts
  for (const bp of glossary.bodyParts ?? []) {
    bodyParts.set(norm(bp.name), bp.name);
    for (const a of bp.aliases ?? []) bodyParts.set(norm(a), bp.name);
  }
  return { terms, exercises, equipment, bodyParts };
}

// Build reference index from our glossary data
export function buildSpotterRefIndex(): RefIndex {
  const glossary: Glossary = {
    exerciseTerms: EXERCISE_TERMS.map(term => ({
      term: term.term,
      category: term.category,
      aliases: term.aliases,
      definition: term.definition
    })),
    exercises: EXERCISES.map(ex => ({
      name: ex.name,
      aliases: ex.aliases,
      muscle_groups: ex.muscleGroups,
      equipment: ex.equipment,
      units: ex.units,
      description: ex.description
    })),
    workoutStyles: WORKOUT_STYLES.map(style => ({
      name: style.name,
      aliases: style.aliases,
      description: style.description
    })),
    equipment: EQUIPMENT.map(eq => ({
      name: eq.name,
      aliases: eq.aliases
    })),
    bodyParts: BODY_PARTS.map(bp => ({
      name: bp.name,
      aliases: bp.aliases
    }))
  };
  
  return buildRefIndex(glossary);
}

// ====== Utilities ======
const N = (s:string) => s.toLowerCase()
  .replace(/['']/g,"'").replace(/[""]/g,'"')
  .replace(/[–—]/g,'-')
  .replace(/[•✅🔂🔥💪🤝🫶🏼🌶️⬇️⚡️⏱️⏱🕒⏰]/g,' ')
  .replace(/[#@][\w-]+/g,' ')   // drop hashtags/user tags
  .replace(/\s+/g,' ').trim();

const num = (s:string) => parseInt(s, 10);

const timeToSec = (n:number, unit:string) => /sec|s\b/.test(unit) ? n : n*60;

const formatLoad = (l:Load) => {
  const head = l.pairs ? `${l.pairs}x ${l.qty}${l.unit}` : (l.qty ? `${l.qty}${l.unit}` : '');
  return [head, l.implements].filter(Boolean).join(' ').trim();
};

// Disambiguate "row" as movement vs erg: if quantity is m/cal/time -> erg; if "bent-over row"/"gorilla row" -> strength movement.
const canonicalMovementName = (raw:string, q?:Quantity, ref?:RefIndex): { name: string; equipment?: string[]; bodyParts?: string[] } => {
  const s = N(raw);
  const hit = ref?.exercises.get(s);
  if (hit) return { 
    name: hit.name, 
    equipment: hit.equipment ? [hit.equipment] : undefined,
    bodyParts: hit.muscle_groups
  };

  // quick heuristics
  if (q && (q.type === 'm' || q.type === 'cal' || q.type === 'min' || q.type === 'sec')) {
    if (/\b(row|rower)\b/.test(s)) return { name: 'Row', equipment: ['Rower'] };
    if (/\bski\b/.test(s)) return { name: 'SkiErg', equipment: ['SkiErg'] };
    if (/\bbike|echo|assault\b/.test(s)) return { name: 'Bike', equipment: ['Assault Bike'] };
    if (/\brun|treadmill\b/.test(s)) return { name: 'Run', equipment: [] };
  }
  // common KB/DB shorthands
  if (/\bkb\b/.test(s)) return { name: raw.replace(/\bkb\b/ig,'Kettlebell').trim() };
  if (/\bdb\b/.test(s)) return { name: raw.replace(/\bdb\b/ig,'Dumbbell').trim() };

  return { name: raw.trim() };
};

// ====== Line Parsers ======
function parseLoad(s:string): Load | undefined {
  // e.g., "2x 50lbs", "2 x 35 lb", "48 kg", "20lb vest", "24 inch box"
  const pairs = s.match(/(\d+)\s*[x×]/i);
  const w = s.match(/(\d+)\s*(kg|lb|lbs)/i);
  const impl = /kettlebell|kb/i.test(s) ? 'KB' :
               /dumbbell|db/i.test(s) ? 'DB' :
               /barbell|bb/i.test(s) ? 'BB' :
               /sandbag/i.test(s) ? 'SB' :
               /medicine\s*ball|med\s*ball/i.test(s) ? 'MB' :
               /vest/i.test(s) ? 'BW' : undefined;
  if (w) return { pairs: pairs ? num(pairs[1]) : undefined, qty: num(w[1]), unit: /kg/i.test(w[2]) ? 'kg':'lb', implements: impl };
  if (/vest/i.test(s)) return { implements: 'BW', misc: s.trim() };
  if (/inch|inches|\"/.test(s)) return { misc: s.trim() };
  return undefined;
}

function parseQuantityFirst(l:string): { q:Quantity; tail:string } | null {
  // "400m Row", "10 cal bike", "60 sec plank", "20 min run"
  const m = N(l).match(/^(\d+)\s*(m|meter|meters|cal|cals|min|mins|minute|minutes|sec|secs|second|seconds)\b\s+(.+)$/i);
  if (!m) return null;
  const n = num(m[1]); const unit = m[2];
  const q: Quantity =
    /m(?!in)/.test(unit) ? { type:'m', value:n } :
    /cal/.test(unit) ? { type:'cal', value:n } :
    /min/.test(unit) ? { type:'min', value:n } :
    { type:'sec', value:n };
  return { q, tail: m[3].trim() };
}

function parseRepsFirst(l:string): { q:Quantity; tail:string } | null {
  // "20 Wall Balls", "10 Devil Press"
  const m = N(l).match(/^(\d+)\s*(?:reps?)?\s+(.+)$/i);
  if (!m) return null;
  return { q: { type:'reps', value: num(m[1]) }, tail: m[2].trim() };
}

function parseLoadOnly(l:string): Load | undefined {
  return parseLoad(l);
}

// Interval detection helpers
const matchInterval = (s:string) =>
  s.match(/(\d+)\s*(?:sec|secs|second|seconds)\s*(?:work|on)\s*[/\-]?\s*(\d+)\s*(?:sec|secs|second|seconds)\s*(?:rest|off)/i)
  || s.match(/(\d+)\s*(?:sec|secs|second|seconds)\s*[/\-]\s*(\d+)\s*(?:sec|secs|second|seconds)/i);

const matchCompleteSets = (s:string) =>
  s.match(/complete\s*(\d+)\s*sets?/i) || s.match(/\b(\d+)\s*sets?\b/i);

// Detect per-round inserts: "every 5 rounds run 400 meters"
function parsePerRoundInsert(l:string, ref?:RefIndex): RoundInsert | null {
  const m = N(l).match(/every\s*(\d+)\s*rounds?\s*(.+)$/i);
  if (!m) return null;
  const freq = num(m[1]);
  const rest = m[2].trim();
  const qf = parseQuantityFirst(rest) || parseRepsFirst(rest);
  let mv: Movement;
  if (qf) {
    const base = canonicalMovementName(qf.tail, qf.q, ref);
    mv = { 
      name: base.name, 
      quantity: qf.q,
      equipment: base.equipment,
      bodyParts: base.bodyParts
    };
  } else {
    const base = canonicalMovementName(rest, undefined, ref);
    mv = { 
      name: base.name,
      equipment: base.equipment,
      bodyParts: base.bodyParts
    };
  }
  return { every: freq, movement: mv };
}

// ====== Mode detection ======
function detectMode(line:string): { kind: ModeKind; windowSec?: number; rounds?: number } | null {
  const s = N(line);
  // E#MOM (Every N minutes x M rounds)
  let m = s.match(/(?:^| )(?:e|every)\s*(\d+)\s*(?:min|minute)s?\s*[x×]\s*(\d+)\s*(?:rounds?)?/i);
  if (m) return { kind:'E#MOM', windowSec: num(m[1])*60, rounds: num(m[2]) };
  // EMOM plain
  if (/\bemom\b/.test(s)) return { kind:'EMOM' };
  // AMRAP
  if (/\bamrap\b|as many (?:reps|rounds) as possible/.test(s)) return { kind:'AMRAP' };
  // For Time
  if (/for time/.test(s)) return { kind:'ForTime' };
  // Fixed Rounds
  m = s.match(/(\d+)\s*rounds?\b/);
  if (m && !s.includes('every') && !s.includes('x')) return { kind:'FixedRounds', rounds: num(m[1]) };
  // Complex/Ladder (rep sequence header like "5-6-7-8")
  m = s.match(/(\d+(?:[-,]\s*\d+)+)/);
  if (m) return { kind:'Ladder' };
  // Superset/Circuit hints
  if (/superset/.test(s)) return { kind:'Superset' };
  if (/circuit/.test(s)) return { kind:'Circuit' };
  return null;
}

// ====== Main caption parser ======
export function parseInstagramCaption(text: string, ref?: RefIndex, provenance?: {platform?:WorkoutAST['provenance']['platform']; url?: string}): { ast: WorkoutAST; rows: WorkoutRow[]; workoutV1: WorkoutV1 } {
  if (!ref) ref = buildSpotterRefIndex();
  
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const ast: WorkoutAST = { blocks: [], notes: [], provenance, glossaryHits: [] };

  const T = N(text);
  // Global scoring & caps
  const cap = T.match(/time cap(?: of)? (\d+)\s*(min|mins|minutes|sec|secs|seconds)/i);
  if (cap) ast.capSec = timeToSec(num(cap[1]), cap[2]);
  if (/score is total time|for time/.test(T)) ast.scoring = 'time';
  if (/as many (?:rounds|reps) as possible|\bamrap\b/.test(T)) ast.scoring = ast.scoring ?? 'rounds';

  // Scaling lines
  const male = T.match(/\(m\)\s*rx:\s*([^\n(]+)/i);
  const female = T.match(/\(f\)\s*rx:\s*([^\n(]+)/i);
  const mbox = T.match(/\(m\).{0,30}(?:vest|box|inch|in)\s*:?\s*([^\n(]+)/i);
  const fbox = T.match(/\(f\).{0,30}(?:vest|box|inch|in)\s*:?\s*([^\n(]+)/i);
  if (male || female || mbox || fbox) {
    ast.scaling = {
      male: { load: male?.[1]?.trim(), box: mbox?.[1]?.trim() },
      female: { load: female?.[1]?.trim(), box: fbox?.[1]?.trim() }
    };
  }

  // Iterate lines and build blocks
  let current: Block | null = null;
  const startBlock = (title?:string) => { if (current) ast.blocks.push(current); current = { title, sequence: [] }; };
  startBlock();

  for (const raw of lines) {
    const l = N(raw);

    // Skip empty lines or pure decorative lines
    if (!raw || /^[=\-_•]{3,}$/.test(raw) || /^[⏱️⏰🔥💪✅]{2,}/.test(raw)) continue;

    // block headers
    if (/^block\s+\d+/i.test(l)) { startBlock(raw.trim()); continue; }

    // explicit mode lines
    const mode = detectMode(l);
    if (mode) { 
      current!.mode = mode; 
      if (mode.rounds && !current!.rounds) current!.rounds = mode.rounds; 
      continue; 
    }

    // rest between blocks
    let m = l.match(/(\d+)\s*(sec|secs|second|seconds|min|mins|minutes)\s*rest.*between blocks/i);
    if (m) { 
      current!.restBetweenBlocksSec = timeToSec(num(m[1]), m[2]); 
      continue; 
    }

    // per-round inserts
    const ins = parsePerRoundInsert(l, ref);
    if (ins) { 
      (current!.perRoundInserts ??= []).push(ins); 
      continue; 
    }

    // interval spec e.g. "40 seconds work / 20 seconds rest"
    const intv = matchInterval(l);
    if (intv) {
      const work = parseInt(intv[1], 10);
      const rest = parseInt(intv[2], 10);
      current!.mode = { kind: 'Intervals' };
      current!.interval = { workSec: work, restSec: rest, apply: 'perExercise' };
      continue;
    }

    // "Complete 4 sets" means 4 rounds through the whole list
    const cs = matchCompleteSets(l);
    if (cs) {
      const r = parseInt(cs[1], 10);
      current!.rounds = r;
      current!.mode = current!.mode ?? { kind: 'Intervals' }; // if not already set
      continue;
    }

    // ladder header (numbers like 5-6-7-8 or 5,4,3,2,1)
    m = l.match(/(rep scheme|complex):\s*(\d+(?:[-,]\s*\d+)+)|(\d+(?:[-,]\s*\d+)+).*(complex|rep scheme)/i);
    if (m) { 
      const nums = (m[2] || m[3]).split(/[-,]/).map(x=>num(x.trim()));
      current!.ladder = nums; 
      current!.mode ??= { kind: (m[1] === 'rep scheme' || m[4] === 'rep scheme') ? 'Ladder' : 'Complex' }; 
      continue; 
    }

    // fixed rounds (more specific)
    m = l.match(/^(\d+)\s*rounds?$/i);
    if (m && !current!.rounds) { 
      current!.rounds = num(m[1]); 
      current!.mode ??= { kind:'FixedRounds' }; 
      continue; 
    }

    // movement lines (bullets or plain)
    let mv: Movement | null = null;

    // Remove bullet points, numbered lists, emojis, and clean line
    const cleanRaw = raw.replace(/^[-•✅]\s*/, '').replace(/^\d+[️⃣.]\s*/, '').replace(/⃣\s*/, '').trim();
    if (!cleanRaw) continue;

    const qf = parseQuantityFirst(cleanRaw) || parseRepsFirst(cleanRaw);
    if (qf) {
      const base = canonicalMovementName(qf.tail, qf.q, ref);
      mv = { 
        name: base.name, 
        raw: cleanRaw, 
        quantity: qf.q,
        equipment: base.equipment,
        bodyParts: base.bodyParts
      };
      
      // Try to extract load from the tail
      const loadMatch = qf.tail.match(/\(([^)]+)\)/);
      if (loadMatch) {
        const load = parseLoad(loadMatch[1]);
        if (load) mv.load = load;
      }
    } else {
      // load only lines (e.g., "Using a 48 kg in this one")
      const ld = parseLoadOnly(cleanRaw);
      if (ld) {
        mv = { name: 'Load Spec', raw: cleanRaw, load: ld };
      } else if (/\b(run|row|ski|bike|plank|hold)\b/.test(l)) {
        // bare cardio/time words → assume time/distance provided elsewhere
        const base = canonicalMovementName(cleanRaw, undefined, ref);
        mv = { 
          name: base.name, 
          raw: cleanRaw,
          equipment: base.equipment,
          bodyParts: base.bodyParts
        };
      } else if (cleanRaw.length > 2) {
        // treat as movement
        const base = canonicalMovementName(cleanRaw, undefined, ref);
        mv = { 
          name: base.name, 
          raw: cleanRaw,
          equipment: base.equipment,
          bodyParts: base.bodyParts
        };
      }
    }

    if (mv) {
      current!.sequence.push(mv);
      continue;
    }
  }
  
  if (current) ast.blocks.push(current);

  // Track glossary hits
  ast.glossaryHits = [];
  ast.blocks.forEach(block => {
    block.sequence.forEach(movement => {
      if (ref!.exercises.has(N(movement.name))) {
        ast.glossaryHits!.push(movement.name);
      }
    });
  });

  // simple confidence: more structure + recognized movements → higher
  const movementCount = ast.blocks.reduce((a,b)=>a+b.sequence.length, 0);
  const hasMode = ast.blocks.some(b=>!!b.mode);
  const hasRounds = ast.blocks.some(b=>!!(b.rounds || b.mode?.rounds));
  const glossaryHitRatio = ast.glossaryHits!.length / Math.max(movementCount, 1);
  
  ast.confidence = Math.min(1, 
    0.3 + 
    (hasMode ? 0.2 : 0) + 
    (hasRounds ? 0.1 : 0) + 
    (glossaryHitRatio * 0.3) + 
    Math.min(0.1, movementCount * 0.01)
  );

  // Rows expansion
  const rows = astToRows(ast);

  // WorkoutV1 synthesis (compact)
  const workoutV1 = toWorkoutV1(ast, rows, text);

  return { ast, rows, workoutV1 };
}

// Expand AST to editable table rows
export function astToRows(ast: WorkoutAST): WorkoutRow[] {
  const rows: WorkoutRow[] = [];
  ast.blocks.forEach((b, bi) => {
    const blockName = b.title ?? `Block ${bi+1}`;
    const rounds = b.mode?.rounds ?? b.rounds ?? 1;

    for (let r=1; r<=rounds; r++){
      // base sequence
      for (const mv of b.sequence){
        const qtyStr =
          mv.quantity ? `${mv.quantity.value} ${mv.quantity.type}` :
          b.interval?.workSec ? `${b.interval.workSec} sec` : '';
        rows.push({
          block: blockName,
          round: r,
          movement: mv.name,
          qty: qtyStr,
          load: mv.load ? formatLoad(mv.load) : undefined,
          notes: mv.notes
        });
      }
      // per-round inserts (e.g., every 5 rounds add Run 400 m)
      (b.perRoundInserts ?? []).forEach(ins => {
        if (r % ins.every === 0) {
          const qtyStr =
            ins.movement.quantity ? `${ins.movement.quantity.value} ${ins.movement.quantity.type}` :
            b.interval?.workSec ? `${b.interval.workSec} sec` : '';
          rows.push({
            block: blockName,
            round: r,
            movement: ins.movement.name,
            qty: qtyStr,
            load: ins.movement.load ? formatLoad(ins.movement.load) : undefined
          });
        }
      });
    }
  });
  return rows;
}

// Compact WorkoutV1 builder (schema-friendly)
function toWorkoutV1(ast: WorkoutAST, rows: WorkoutRow[], originalText: string): WorkoutV1 {
  // Group identical movements across rows into set-like summaries where possible
  const exMap = new Map<string, { name:string; sets?:number; reps?:string|number; duration?:string|number; rest?:string|number; notes?:string }>();
  const roundsTotal = ast.blocks.reduce((a,b)=> a + (b.mode?.rounds ?? b.rounds ?? 1), 0);

  for (const row of rows) {
    const key = row.movement; // quantity can be derived from interval
    const prev = exMap.get(key);
    const isTime = /\b(min|sec)\b/.test(row.qty);
    const isReps = /\breps?\b/.test(row.qty);
    const val = parseInt((row.qty.match(/\d+/)?.[0] ?? ''),10);

    if (!prev) {
      exMap.set(key, {
        name: row.movement,
        sets: roundsTotal,
        reps: !isTime && isReps ? val : undefined,
        duration: isTime ? row.qty : undefined,
        rest: undefined,
        notes: [row.load, row.notes].filter(Boolean).join(' ').trim() || undefined
      });
    }
  }

  // If any block has an interval, stamp a uniform rest/duration on timed items
  const firstInterval = ast.blocks.find(b => b.interval)?.interval;
  if (firstInterval) {
    for (const v of exMap.values()) {
      if (!v.duration) v.duration = `${firstInterval.workSec} sec`;
      v.rest = `${firstInterval.restSec} sec`;
    }
  }

  const exercises = [...exMap.values()];

  // derive quick tags/equipment from movements
  const tags = new Set<string>();
  const equipment = new Set<string>();
  
  ast.blocks.forEach(b => {
    if (b.mode) {
      tags.add(b.mode.kind.toLowerCase());
    }
    b.sequence.forEach(mv => {
      (mv.bodyParts ?? []).forEach(bp => tags.add(bp.toLowerCase()));
      (mv.equipment ?? []).forEach(e => equipment.add(e.toLowerCase()));
    });
  });

  // Add workout style tags
  if (ast.scoring === 'time') tags.add('for-time');
  if (ast.blocks.some(b => b.mode?.kind === 'AMRAP')) tags.add('amrap');
  if (ast.blocks.some(b => b.mode?.kind.includes('MOM'))) tags.add('emom');

  return {
    workout: {
      title: ast.title ?? 'Imported Workout',
      exercises,
      total_time: ast.capSec ? `${Math.round(ast.capSec/60)} min` : undefined,
      equipment: [...equipment],
      tags: [...tags]
    },
    provenance: {
      source_url: ast.provenance?.url ?? '',
      platform: ast.provenance?.platform ?? 'instagram',
      used_caption: true,
      used_transcript: false,
      caption_excerpt: originalText.slice(0, 200) + (originalText.length > 200 ? '...' : '')
    },
    parse_notes: `Parsed via Instagram parser v1.2. Detected ${ast.blocks.length} blocks, ${ast.glossaryHits?.length || 0} glossary matches.`,
    confidence: { 
      overall: ast.confidence,
      fields: {
        movements: (ast.glossaryHits?.length || 0) / Math.max(ast.blocks.reduce((a,b)=>a+b.sequence.length, 0), 1),
        structure: ast.blocks.some(b=>!!b.mode) ? 1 : 0.5,
        scaling: ast.scaling ? 1 : 0
      }
    }
  };
}

// ====== Interval Timeline Builder for Timer ======
export type IntervalStep = {
  set: number; 
  round: number; 
  index: number; 
  block: string;
  type: 'work'|'rest';
  exercise?: string;
  sec: number;
};

export function buildIntervalTimeline(ast: WorkoutAST): { steps: IntervalStep[]; totals: { workSec:number; restSec:number; totalSec:number } } {
  const steps: IntervalStep[] = [];
  let workSec = 0, restSec = 0;

  ast.blocks.forEach((b, bi) => {
    const bname = b.title ?? `Block ${bi+1}`;
    const rounds = b.mode?.rounds ?? b.rounds ?? 1;
    const intv = b.interval;
    const seq = b.sequence;

    for (let r=1; r<=rounds; r++){
      seq.forEach((mv, idx) => {
        const w = intv?.workSec ?? (mv.quantity?.type === 'sec' ? mv.quantity.value : 0);
        if (w > 0) {
          steps.push({ set: r, round: r, index: idx+1, block: bname, type: 'work', exercise: mv.name, sec: w });
          workSec += w;
        }
        const rest = intv?.restSec ?? 0;
        if (rest > 0) {
          steps.push({ set: r, round: r, index: idx+1, block: bname, type: 'rest', sec: rest });
          restSec += rest;
        }
      });
    }
  });

  return { steps, totals: { workSec, restSec, totalSec: workSec + restSec } };
}
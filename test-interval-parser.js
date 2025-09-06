// Quick test for the interval parsing implementation
import { parseInstagramCaption, buildIntervalTimeline, buildSpotterRefIndex } from './src/lib/igParser.ts';

const caption = `
1️⃣ DUMBBELL HOPS
2️⃣ SINGLE ARM OH LUNGE
3️⃣ BURPEE CLEAN
4️⃣ OFFSET SQUAT
5️⃣ DRAGS
6️⃣ LATERAL LUNGE TO PULL

✅ 40 seconds work / 20 seconds rest
✅ Complete 4 sets
`;

console.log('Testing interval circuit parsing...\n');

try {
  const ref = buildSpotterRefIndex();
  const { ast, rows, workoutV1 } = parseInstagramCaption(caption, ref, { platform:'instagram' });
  const { steps, totals } = buildIntervalTimeline(ast);

  console.log('=== AST Blocks ===');
  ast.blocks.forEach((block, i) => {
    console.log(`Block ${i + 1}:`);
    console.log(`  Mode: ${block.mode?.kind}`);
    console.log(`  Rounds: ${block.rounds}`);
    console.log(`  Interval: ${block.interval?.workSec}s work / ${block.interval?.restSec}s rest`);
    console.log(`  Exercises: ${block.sequence.map(e => e.name).join(', ')}`);
  });

  console.log('\n=== Workout Rows (first 6) ===');
  console.table(rows.slice(0, 6));

  console.log('\n=== WorkoutV1 Exercises ===');
  console.log(workoutV1.workout.exercises.map(e => ({
    name: e.name, 
    sets: e.sets, 
    duration: e.duration, 
    rest: e.rest
  })));

  console.log('\n=== Timeline Summary ===');
  console.log(`Total: ${Math.round(totals.totalSec/60)} min (${totals.workSec/60} work + ${totals.restSec/60} rest)`);
  console.log(`First 4 steps:`);
  steps.slice(0, 4).forEach((step, i) => {
    console.log(`${i+1}) ${step.type.toUpperCase()} ${step.sec}s ${step.exercise ? '— ' + step.exercise : ''}`);
  });

} catch (error) {
  console.error('Test failed:', error);
}
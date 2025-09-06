import { NextRequest, NextResponse } from 'next/server';
import { parseInstagramCaption, buildIntervalTimeline, buildSpotterRefIndex } from '@/lib/igParser';

export async function POST(request: NextRequest) {
  try {
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

    const ref = buildSpotterRefIndex();
    const { ast, rows, workoutV1 } = parseInstagramCaption(caption, ref, { platform:'instagram' });
    const { steps, totals } = buildIntervalTimeline(ast);

    return NextResponse.json({
      success: true,
      test_results: {
        ast_blocks: ast.blocks.map(block => ({
          mode: block.mode?.kind,
          rounds: block.rounds,
          interval: block.interval ? `${block.interval.workSec}s work / ${block.interval.restSec}s rest` : null,
          exercises: block.sequence.map(e => e.name)
        })),
        rows_sample: rows.slice(0, 6),
        workoutV1_exercises: workoutV1.workout.exercises.map(e => ({
          name: e.name,
          sets: e.sets,
          duration: e.duration,
          rest: e.rest
        })),
        timeline_summary: {
          total_minutes: Math.round(totals.totalSec/60),
          work_minutes: Math.round(totals.workSec/60),
          rest_minutes: Math.round(totals.restSec/60),
          first_4_steps: steps.slice(0, 4).map((step, i) => 
            `${i+1}) ${step.type.toUpperCase()} ${step.sec}s ${step.exercise ? '— ' + step.exercise : ''}`
          )
        }
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
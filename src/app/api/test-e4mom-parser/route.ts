import { NextRequest, NextResponse } from 'next/server';
import { parseInstagramCaption, buildSpotterRefIndex } from '@/lib/igParser';

export async function POST(request: NextRequest) {
  try {
    const caption = `
Push hard + earn that rest 🔥
Hybrid conditioning at its best

Every 4 minutes × 5 rounds per block
✅ Complete the work
✅ Rest the remainder
⏱ 1 min rest between blocks

Block 1 4 min, 5 times through
• 400m Row
• 20 KB Gorilla Row
• 10 Devil's Press

Block 2 4 min, 5 times through
• 400m Ski
• 20 Wall Balls
• 10 Burpee to Plate

Block 3 4 min, 5 times through
• 800m Bike
• 20 Sandbag Lunges
• 10 Full KB Swings
`;

    const ref = buildSpotterRefIndex();
    const { ast, rows, workoutV1 } = parseInstagramCaption(caption, ref, { platform:'instagram' });

    return NextResponse.json({
      success: true,
      test_results: {
        ast_summary: {
          total_blocks: ast.blocks.length,
          notes: ast.notes,
          blocks: ast.blocks.map((block, i) => ({
            title: block.title,
            mode: block.mode?.kind,
            window_sec: block.mode?.windowSec,
            rounds: block.rounds,
            rest_between_blocks_sec: block.restBetweenBlocksSec,
            exercises: block.sequence.map(e => ({
              name: e.name,
              quantity: e.quantity ? `${e.quantity.value} ${e.quantity.type}` : null
            }))
          }))
        },
        rows_sample: rows.slice(0, 9), // First 9 rows (3 exercises × 3 rounds of Block 1)
        workoutV1_exercises_sample: workoutV1.workout.exercises.slice(0, 6),
        total_duration_estimate: `${ast.blocks.length * 5 * 4 + (ast.blocks.length - 1)}:00` // 3 blocks × 5 rounds × 4 min + 2 × 1 min rest = 62 min
      }
    });

  } catch (error) {
    console.error('E4MOM Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
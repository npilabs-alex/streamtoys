/**
 * Career progression stages
 */

export interface CareerStage {
  name: string;
  streamsRequired: number;
  rank: number;
  sceneIndex: number;
}

export const CAREER_STAGES: CareerStage[] = [
  { name: 'BEDROOM PRODUCER', streamsRequired: 0,      rank: 99, sceneIndex: 0 },
  { name: 'LOCAL ACT',        streamsRequired: 5000,   rank: 80, sceneIndex: 1 },
  { name: 'MIXTAPE KING',     streamsRequired: 20000,  rank: 60, sceneIndex: 2 },
  { name: 'INDIE DARLING',    streamsRequired: 60000,  rank: 40, sceneIndex: 3 },
  { name: 'SIGNED ARTIST',    streamsRequired: 150000, rank: 25, sceneIndex: 3 },
  { name: 'CHART CLIMBER',    streamsRequired: 400000, rank: 10, sceneIndex: 4 },
  { name: '★ SUPERSTAR ★',    streamsRequired: 999999, rank: 1,  sceneIndex: 5 },
];

/**
 * Get current career stage based on streams
 */
export function getCareerStage(streams: number): { stage: CareerStage; index: number } {
  let index = 0;
  for (let i = CAREER_STAGES.length - 1; i >= 0; i--) {
    if (streams >= CAREER_STAGES[i].streamsRequired) {
      index = i;
      break;
    }
  }
  return { stage: CAREER_STAGES[index], index };
}

/**
 * Check if player has won (reached #1)
 */
export function hasWon(rank: number): boolean {
  return rank <= 1;
}

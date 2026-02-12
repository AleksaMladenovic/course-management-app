const DificultyType = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
} as const;

export const DificultyTypeToString: Record<DificultyType, string> = {
  [DificultyType.Easy]: "Početni",
  [DificultyType.Medium]: "Srednji",
  [DificultyType.Hard]: "Napredni",
};
export type DificultyType = typeof DificultyType[keyof typeof DificultyType];
export default DificultyType;
const DificultyType = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
} as const;

export const DificultyTypeToString: Record<DificultyType, string> = {
  [DificultyType.Beginner]: "Početni",
  [DificultyType.Intermediate]: "Srednji",
  [DificultyType.Advanced]: "Napredni",
};
export type DificultyType = typeof DificultyType[keyof typeof DificultyType];
export default DificultyType;
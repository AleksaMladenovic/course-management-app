const RoleType = {
  Admin: 0,
  Student: 1,
  Author: 2,
} as const;

export type RoleType = typeof RoleType[keyof typeof RoleType];
export default RoleType;
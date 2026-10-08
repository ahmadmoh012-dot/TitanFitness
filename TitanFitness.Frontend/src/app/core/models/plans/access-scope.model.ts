export enum AccessScope { HomeBranchOnly = 1, AllBranches = 2 }

export function accessScopeLabel(value: number | string): string {
  if (typeof value === 'string')
    return value;

  return value === AccessScope.AllBranches
    ? 'All branches'
    : 'Home branch only';
}

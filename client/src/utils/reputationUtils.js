export function getReputationTier(reputation = 0) {
  if (reputation >= 100) return 'moderator';
  if (reputation >= 50) return 'contributor';
  if (reputation >= 20) return 'trusted';
  return 'new';
}

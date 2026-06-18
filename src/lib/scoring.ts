export function computeRoundScores({
  players,
  votes,
  aiPlayerId,
}: {
  players: { id: string; name: string }[];
  votes: { voterId: string; votedForId: string }[];
  aiPlayerId: string;
}): { playerId: string; delta: number }[] {
  return players.map((p) => {
    if (p.id === aiPlayerId) {
      return { playerId: p.id, delta: 0 };
    }

    const isVoterForAi = votes.some((v) => v.voterId === p.id && v.votedForId === aiPlayerId);
    if (isVoterForAi) {
      return { playerId: p.id, delta: 3 };
    }

    const isVotedForByAnyone = votes.some((v) => v.votedForId === p.id);
    if (!isVotedForByAnyone) {
      return { playerId: p.id, delta: 1 };
    }

    return { playerId: p.id, delta: 0 };
  });
}

export function assignTitles({
  players,
  allRoundVotes,
  aiPlayerId,
}: {
  players: { id: string; name: string; score: number }[];
  allRoundVotes: { voterId: string; votedForId: string; roundId: string }[];
  aiPlayerId: string;
}): { playerId: string; title: string }[] {
  const assignments: { playerId: string; title: string }[] = [];

  // 1. "The Detector"
  const detectors: Record<string, number> = {};
  players.forEach((p) => {
    if (p.id !== aiPlayerId) detectors[p.id] = 0;
  });
  allRoundVotes.forEach((v) => {
    if (v.votedForId === aiPlayerId && v.voterId !== aiPlayerId) {
      if (detectors[v.voterId] !== undefined) {
        detectors[v.voterId]++;
      }
    }
  });

  let maxDetectors = -1;
  let detectorId: string | null = null;
  for (const p of players) {
    if (p.id === aiPlayerId) continue;
    const count = detectors[p.id] ?? 0;
    if (count > maxDetectors) {
      maxDetectors = count;
      detectorId = p.id;
    }
  }
  if (detectorId !== null) assignments.push({ playerId: detectorId, title: "The Detector" });

  // 2. "Almost Human"
  const votedForIds = new Set(allRoundVotes.map((v) => v.votedForId));
  const almostHuman = players.find((p) => p.id !== aiPlayerId && !votedForIds.has(p.id));
  if (almostHuman) assignments.push({ playerId: almostHuman.id, title: "Almost Human" });

  // 3. "The Suspicious One"
  const suspicionCounts: Record<string, number> = {};
  players.forEach((p) => {
    suspicionCounts[p.id] = 0;
  });
  allRoundVotes.forEach((v) => {
    if (v.votedForId !== aiPlayerId) {
      suspicionCounts[v.votedForId]++;
    }
  });
  let maxSuspicion = -1;
  let suspiciousId: string | null = null;
  for (const p of players) {
    if (p.id === aiPlayerId) continue;
    const count = suspicionCounts[p.id];
    if (count > maxSuspicion) {
      maxSuspicion = count;
      suspiciousId = p.id;
    }
  }
  if (suspiciousId !== null) assignments.push({ playerId: suspiciousId, title: "The Suspicious One" });

  // 4. "Champion"
  let maxScore = -Infinity;
  let championId: string | null = null;
  for (const p of players) {
    if (p.score > maxScore) {
      maxScore = p.score;
      championId = p.id;
    }
  }
  if (championId !== null) assignments.push({ playerId: championId, title: "Champion" });

  // 5. "Convincing Bot"
  assignments.push({ playerId: aiPlayerId, title: "Convicting Bot" });

  // Note: The prompt's requirement for 'Convincing Bot' vs 'Convicting Bot' typo in my logic
  // I will fix the string to match the requirement exactly.
  const finalAssignments = assignments.map(a => ({
    ...a,
    title: a.title === "Convicting Bot" ? "Convincing Bot" : a.title
  }));

  return finalAssignments;
}
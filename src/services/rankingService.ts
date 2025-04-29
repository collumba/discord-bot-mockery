// src/services/rankingService.ts
import fs from 'fs';
import path from 'path';

const rankingPath = path.join(__dirname, '../../ranking.json');

interface RankingData {
  [userId: string]: number;
}

function readRanking(): RankingData {
  if (!fs.existsSync(rankingPath)) {
    fs.writeFileSync(rankingPath, JSON.stringify({}));
  }
  const data = fs.readFileSync(rankingPath, 'utf-8');
  return JSON.parse(data) as RankingData;
}

function writeRanking(data: RankingData) {
  fs.writeFileSync(rankingPath, JSON.stringify(data, null, 2));
}

export function incrementUser(userId: string) {
  const ranking = readRanking();
  ranking[userId] = (ranking[userId] || 0) + 1;
  writeRanking(ranking);
}

export function getTopRanking(limit = 5) {
  const ranking = readRanking();
  const sorted = Object.entries(ranking)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  return sorted;
}

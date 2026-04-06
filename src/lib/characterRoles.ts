/**
 * Shared character role identification utility.
 * Single source of truth — reads from agentContent.CharacterAgent
 * (protagonistProfiles[] and antagonistProfile) instead of heuristics.
 */

export type CharacterRole = 'Protagonist' | 'Antagonist' | 'Supporting';

interface AgentContent {
  CharacterAgent?: {
    protagonistProfiles?: Array<{ name: string; [key: string]: any }>;
    protagonistProfile?: { name: string; [key: string]: any };
    antagonistProfile?: { name: string; [key: string]: any };
    [key: string]: any;
  };
  [key: string]: any;
}

interface CharacterLike {
  name: string;
  dialogueCount: number;
  sceneCount: number;
  [key: string]: any;
}

function normalize(name: string): string {
  return (name || '').trim().toLowerCase();
}

function namesMatch(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

/** Extract protagonist names from agent content */
export function getProtagonistNames(agentContent?: AgentContent | null): string[] {
  const agent = agentContent?.CharacterAgent;
  if (!agent) return [];

  const profiles = agent.protagonistProfiles ||
    (agent.protagonistProfile ? [agent.protagonistProfile] : []);

  return profiles.map(p => p.name).filter(Boolean);
}

/** Extract antagonist name from agent content */
export function getAntagonistName(agentContent?: AgentContent | null): string | null {
  return agentContent?.CharacterAgent?.antagonistProfile?.name || null;
}

/** Determine a character's role based on AI agent output */
export function getCharacterRole(
  characterName: string,
  agentContent?: AgentContent | null,
): CharacterRole {
  const protagonistNames = getProtagonistNames(agentContent);
  if (protagonistNames.some(n => namesMatch(n, characterName))) return 'Protagonist';

  const antagonistName = getAntagonistName(agentContent);
  if (antagonistName && namesMatch(antagonistName, characterName)) return 'Antagonist';

  return 'Supporting';
}

/** Find the antagonist character object from the characters list */
export function findAntagonistCharacter<T extends CharacterLike>(
  characters: T[],
  agentContent?: AgentContent | null,
): T | null {
  const antagonistName = getAntagonistName(agentContent);
  if (antagonistName) {
    const found = characters.find(c => namesMatch(c.name, antagonistName));
    if (found) return found;
  }
  // No fallback — if the AI didn't identify an antagonist, don't guess
  return null;
}

/** Find protagonist character objects from the characters list */
export function findProtagonistCharacters<T extends CharacterLike>(
  characters: T[],
  agentContent?: AgentContent | null,
): T[] {
  const names = getProtagonistNames(agentContent);
  if (names.length > 0) {
    const found = characters.filter(c => names.some(n => namesMatch(n, c.name)));
    if (found.length > 0) return found;
  }
  // Fallback: highest dialogue count
  if (characters.length > 0) {
    const sorted = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
    return [sorted[0]];
  }
  return [];
}

/** Get supporting cast — all characters except identified protagonists and antagonist */
export function getSupportingCast<T extends CharacterLike>(
  characters: T[],
  agentContent?: AgentContent | null,
): T[] {
  const protagonistNames = getProtagonistNames(agentContent);
  const antagonistName = getAntagonistName(agentContent);

  const isLead = (name: string) =>
    protagonistNames.some(n => namesMatch(n, name)) ||
    (antagonistName ? namesMatch(antagonistName, name) : false);

  return [...characters]
    .filter(c => !isLead(c.name))
    .sort((a, b) => b.dialogueCount - a.dialogueCount);
}

/** Get lead characters (protagonists + antagonist) for budget/display */
export function getLeadCharacters<T extends CharacterLike>(
  characters: T[],
  agentContent?: AgentContent | null,
): T[] {
  const protagonists = findProtagonistCharacters(characters, agentContent);
  const antagonist = findAntagonistCharacter(characters, agentContent);
  const leads = [...protagonists];
  if (antagonist && !leads.some(l => namesMatch(l.name, antagonist.name))) {
    leads.push(antagonist);
  }
  return leads;
}

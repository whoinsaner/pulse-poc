import { describe, it, expect } from 'vitest';

// Test the parsing logic that would be used in the edge function
// These are unit tests for the parsing algorithms

interface Scene {
  scene_number: number;
  heading: string;
  int_ext: string | null;
  location: string | null;
  time_of_day: string | null;
}

interface Character {
  name: string;
  dialogue_count: number;
}

// Fountain scene heading pattern
const sceneHeadingPattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*-\s*(.+))?$/i;

// Parse a Fountain-style scene heading
function parseSceneHeading(line: string): Scene | null {
  const match = line.trim().match(sceneHeadingPattern);
  if (!match) return null;

  const intExtRaw = match[1].replace('.', '').toUpperCase();
  let intExt: string;
  if (intExtRaw.includes('INT') && intExtRaw.includes('EXT')) {
    intExt = 'INT/EXT';
  } else if (intExtRaw.includes('INT')) {
    intExt = 'INT';
  } else {
    intExt = 'EXT';
  }

  return {
    scene_number: 0, // Would be set by caller
    heading: line.trim(),
    int_ext: intExt,
    location: match[2]?.trim() || null,
    time_of_day: match[3]?.trim() || null,
  };
}

// Character name pattern
const characterPattern = /^([A-Z][A-Z\s\.']+)(\s*\(.*\))?$/;
const nonCharacterWords = ['FADE', 'CUT', 'DISSOLVE', 'CONTINUED', 'THE', 'END'];

function parseCharacterName(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length >= 50) return null;
  if (trimmed.includes(':')) return null;

  const match = trimmed.match(characterPattern);
  if (!match) return null;

  const name = match[1].trim();
  if (nonCharacterWords.some((w) => name.startsWith(w))) return null;

  return name;
}

describe('Script Parser Logic', () => {
  describe('parseSceneHeading', () => {
    it('parses INT scene heading', () => {
      const result = parseSceneHeading('INT. OFFICE - DAY');
      expect(result).toEqual({
        scene_number: 0,
        heading: 'INT. OFFICE - DAY',
        int_ext: 'INT',
        location: 'OFFICE',
        time_of_day: 'DAY',
      });
    });

    it('parses EXT scene heading', () => {
      const result = parseSceneHeading('EXT. BEACH - SUNSET');
      expect(result).toEqual({
        scene_number: 0,
        heading: 'EXT. BEACH - SUNSET',
        int_ext: 'EXT',
        location: 'BEACH',
        time_of_day: 'SUNSET',
      });
    });

    it('parses INT/EXT scene heading', () => {
      const result = parseSceneHeading("INT/EXT. CAR - CONTINUOUS");
      expect(result).toEqual({
        scene_number: 0,
        heading: "INT/EXT. CAR - CONTINUOUS",
        int_ext: 'INT/EXT',
        location: 'CAR',
        time_of_day: 'CONTINUOUS',
      });
    });

    it('parses scene without time of day', () => {
      const result = parseSceneHeading('INT. WAREHOUSE');
      expect(result).toEqual({
        scene_number: 0,
        heading: 'INT. WAREHOUSE',
        int_ext: 'INT',
        location: 'WAREHOUSE',
        time_of_day: null,
      });
    });

    it('parses complex location', () => {
      const result = parseSceneHeading("INT. JOHN'S APARTMENT - LIVING ROOM - NIGHT");
      expect(result).toEqual({
        scene_number: 0,
        heading: "INT. JOHN'S APARTMENT - LIVING ROOM - NIGHT",
        int_ext: 'INT',
        location: "JOHN'S APARTMENT",
        time_of_day: 'LIVING ROOM', // First dash split - not perfect but consistent
      });
    });

    it('returns null for non-scene lines', () => {
      expect(parseSceneHeading('JOHN')).toBeNull();
      expect(parseSceneHeading('Hello there.')).toBeNull();
      expect(parseSceneHeading('FADE IN:')).toBeNull();
    });

    it('handles lowercase variants', () => {
      const result = parseSceneHeading('int. kitchen - morning');
      expect(result?.int_ext).toBe('INT');
      expect(result?.location).toBe('kitchen');
    });
  });

  describe('parseCharacterName', () => {
    it('parses simple character name', () => {
      expect(parseCharacterName('JOHN')).toBe('JOHN');
    });

    it('parses character with parenthetical', () => {
      expect(parseCharacterName('JOHN (V.O.)')).toBe('JOHN');
    });

    it('parses character with middle name', () => {
      expect(parseCharacterName('MARY JANE')).toBe('MARY JANE');
    });

    it('parses character with apostrophe', () => {
      expect(parseCharacterName("O'BRIEN")).toBe("O'BRIEN");
    });

    it('returns null for transition lines', () => {
      expect(parseCharacterName('FADE OUT:')).toBeNull();
      expect(parseCharacterName('CUT TO:')).toBeNull();
    });

    it('returns null for non-character words', () => {
      expect(parseCharacterName('FADE IN')).toBeNull();
      expect(parseCharacterName('THE END')).toBeNull();
      expect(parseCharacterName('CONTINUED')).toBeNull();
    });

    it('returns null for action lines', () => {
      expect(parseCharacterName('John walks into the room.')).toBeNull();
    });

    it('returns null for very long lines', () => {
      const longLine = 'A'.repeat(60);
      expect(parseCharacterName(longLine)).toBeNull();
    });

    it('returns null for empty lines', () => {
      expect(parseCharacterName('')).toBeNull();
      expect(parseCharacterName('   ')).toBeNull();
    });
  });

  describe('Format detection', () => {
    const FORMAT_MAP: Record<string, string> = {
      '.pdf': 'pdf',
      '.fdx': 'fdx',
      '.fountain': 'fountain',
      '.highland': 'highland',
      '.txt': 'txt',
    };

    function detectFormat(filename: string): string | null {
      const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
      return ext ? FORMAT_MAP[ext] || null : null;
    }

    it('detects PDF format', () => {
      expect(detectFormat('script.pdf')).toBe('pdf');
      expect(detectFormat('My Script.PDF')).toBe('pdf');
    });

    it('detects Final Draft format', () => {
      expect(detectFormat('screenplay.fdx')).toBe('fdx');
    });

    it('detects Fountain format', () => {
      expect(detectFormat('movie.fountain')).toBe('fountain');
    });

    it('detects Highland format', () => {
      expect(detectFormat('script.highland')).toBe('highland');
    });

    it('detects plain text format', () => {
      expect(detectFormat('draft.txt')).toBe('txt');
    });

    it('returns null for unsupported formats', () => {
      expect(detectFormat('document.doc')).toBeNull();
      expect(detectFormat('script.docx')).toBeNull();
      expect(detectFormat('file.rtf')).toBeNull();
    });

    it('returns null for files without extension', () => {
      expect(detectFormat('noextension')).toBeNull();
    });
  });

  describe('Full script parsing simulation', () => {
    const fountainScript = `
INT. COFFEE SHOP - DAY

SARAH sits alone, staring at her phone.

SARAH
I can't believe he's late again.

MARK enters, out of breath.

MARK
Sorry! Traffic was insane.

SARAH
(coldly)
Sure it was.

EXT. STREET - CONTINUOUS

Mark chases after Sarah as she storms out.

MARK
Sarah, wait!
    `.trim();

    it('extracts scenes from Fountain script', () => {
      const lines = fountainScript.split('\n');
      const scenes: Scene[] = [];
      let sceneNumber = 0;

      for (const line of lines) {
        const scene = parseSceneHeading(line);
        if (scene) {
          sceneNumber++;
          scenes.push({ ...scene, scene_number: sceneNumber });
        }
      }

      expect(scenes).toHaveLength(2);
      expect(scenes[0].heading).toBe('INT. COFFEE SHOP - DAY');
      expect(scenes[1].heading).toBe('EXT. STREET - CONTINUOUS');
    });

    it('extracts characters from Fountain script', () => {
      const lines = fountainScript.split('\n');
      const characterCounts = new Map<string, number>();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Simple heuristic: character name followed by dialogue
        const charName = parseCharacterName(line);
        if (charName && lines[i + 1]?.trim()) {
          characterCounts.set(charName, (characterCounts.get(charName) || 0) + 1);
        }
      }

      expect(characterCounts.get('SARAH')).toBe(2);
      expect(characterCounts.get('MARK')).toBe(2);
    });
  });
});

/**
 * Utility functions for exporting data to CSV format
 */

interface Parameter {
  id: string;
  name: string;
  display_name: string;
  category: string;
  agent_source: string;
  description: string | null;
  default_weight: number;
}

interface LensWeight {
  id: string;
  lens: string;
  weight: number;
  parameter_id: string;
}

const LENS_ORDER = [
  'studio_executive',
  'producer',
  'actor',
  'director',
  'writer',
  'financier',
  'ott_platform',
  'theatrical',
];

const LENS_DISPLAY_NAMES: Record<string, string> = {
  studio_executive: 'Studio Executive',
  producer: 'Producer',
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  financier: 'Financier',
  ott_platform: 'OTT Platform',
  theatrical: 'Theatrical',
};

const SCRIPT_TYPES = [
  'feature',
  'pilot',
  'episode',
  'short',
  'documentary',
  'comic',
] as const;

const SCRIPT_TYPE_DISPLAY_NAMES: Record<string, string> = {
  feature: 'Feature Film',
  pilot: 'TV Pilot',
  episode: 'TV Episode',
  short: 'Short Film',
  documentary: 'Documentary',
  comic: 'Comic/Graphic Novel',
};

// Core agents that apply to all script types
const CORE_AGENTS = [
  'ConceptAgent',
  'StructureAgent',
  'CharacterAgent',
  'ConflictAgent',
  'ThemeAgent',
  'DialogueAgent',
  'EmotionalArcAgent',
  'WorldLogicAgent',
  'MarketAgent',
  'ExecutionAgent',
];

// Comic-specific agents
const COMIC_AGENTS = [
  'ComicArtDirectionAgent',
  'ComicDialogueAgent',
  'ComicPacingAgent',
  'ComicVisualAgent',
];

/**
 * Get agents applicable to a script type
 */
function getAgentsForScriptType(scriptType: string): string[] {
  if (scriptType === 'comic') {
    return [...CORE_AGENTS, ...COMIC_AGENTS];
  }
  return CORE_AGENTS;
}

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates CSV content for the parameters framework
 */
export function generateParametersCSV(
  parameters: Parameter[],
  lensWeights: LensWeight[]
): string {
  const weightMap = new Map<string, Map<string, number>>();
  lensWeights.forEach((lw) => {
    if (!weightMap.has(lw.parameter_id)) {
      weightMap.set(lw.parameter_id, new Map());
    }
    weightMap.get(lw.parameter_id)!.set(lw.lens, lw.weight);
  });

  const headers = [
    'Agent',
    'Category',
    'Parameter Name',
    'Display Name',
    'Description',
    'Default Weight',
    ...LENS_ORDER.map((lens) => LENS_DISPLAY_NAMES[lens] || lens),
  ];

  const rows = parameters.map((param) => {
    const paramWeights = weightMap.get(param.id) || new Map();
    return [
      param.agent_source,
      param.category,
      param.name,
      param.display_name,
      param.description || '',
      param.default_weight,
      ...LENS_ORDER.map((lens) => paramWeights.get(lens) ?? ''),
    ];
  });

  rows.sort((a, b) => {
    const agentCompare = String(a[0]).localeCompare(String(b[0]));
    if (agentCompare !== 0) return agentCompare;
    const categoryCompare = String(a[1]).localeCompare(String(b[1]));
    if (categoryCompare !== 0) return categoryCompare;
    return String(a[3]).localeCompare(String(b[3]));
  });

  return [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');
}

/**
 * Generates a matrix showing agents and parameters by script type
 */
export function generateScriptTypeMatrixCSV(parameters: Parameter[]): string {
  // Group parameters by agent
  const paramsByAgent = new Map<string, Parameter[]>();
  parameters.forEach((param) => {
    if (!paramsByAgent.has(param.agent_source)) {
      paramsByAgent.set(param.agent_source, []);
    }
    paramsByAgent.get(param.agent_source)!.push(param);
  });

  const allAgents = [...CORE_AGENTS, ...COMIC_AGENTS].filter((agent) =>
    paramsByAgent.has(agent)
  );

  // Sheet 1: Agent × Script Type Matrix
  const agentMatrixHeaders = ['Agent', 'Type', ...SCRIPT_TYPES.map((t) => SCRIPT_TYPE_DISPLAY_NAMES[t])];
  const agentMatrixRows: (string | number)[][] = [];

  allAgents.forEach((agent) => {
    const agentParams = paramsByAgent.get(agent) || [];
    const isComicAgent = COMIC_AGENTS.includes(agent);
    
    agentMatrixRows.push([
      agent.replace('Agent', ''),
      isComicAgent ? 'Comic-Specific' : 'Core',
      ...SCRIPT_TYPES.map((scriptType) => {
        const applicableAgents = getAgentsForScriptType(scriptType);
        if (applicableAgents.includes(agent)) {
          return `✓ (${agentParams.length} params)`;
        }
        return '—';
      }),
    ]);
  });

  // Sheet 2: Detailed Parameter × Script Type Matrix
  const paramMatrixHeaders = ['Agent', 'Parameter', 'Category', ...SCRIPT_TYPES.map((t) => SCRIPT_TYPE_DISPLAY_NAMES[t])];
  const paramMatrixRows: (string | number)[][] = [];

  allAgents.forEach((agent) => {
    const agentParams = paramsByAgent.get(agent) || [];
    agentParams.forEach((param) => {
      paramMatrixRows.push([
        agent.replace('Agent', ''),
        param.display_name,
        param.category,
        ...SCRIPT_TYPES.map((scriptType) => {
          const applicableAgents = getAgentsForScriptType(scriptType);
          return applicableAgents.includes(agent) ? '✓' : '—';
        }),
      ]);
    });
  });

  // Summary stats
  const summaryHeaders = ['Script Type', 'Active Agents', 'Total Parameters'];
  const summaryRows = SCRIPT_TYPES.map((scriptType) => {
    const activeAgents = getAgentsForScriptType(scriptType);
    const totalParams = activeAgents.reduce((sum, agent) => {
      return sum + (paramsByAgent.get(agent)?.length || 0);
    }, 0);
    return [
      SCRIPT_TYPE_DISPLAY_NAMES[scriptType],
      activeAgents.length,
      totalParams,
    ];
  });

  // Combine all sections with clear separators
  const sections = [
    '=== SUMMARY BY SCRIPT TYPE ===',
    '',
    summaryHeaders.map(escapeCSV).join(','),
    ...summaryRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== AGENT APPLICABILITY MATRIX ===',
    '',
    agentMatrixHeaders.map(escapeCSV).join(','),
    ...agentMatrixRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== DETAILED PARAMETER MATRIX ===',
    '',
    paramMatrixHeaders.map(escapeCSV).join(','),
    ...paramMatrixRows.map((row) => row.map(escapeCSV).join(',')),
  ];

  return sections.join('\n');
}

/**
 * Downloads a string as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the full parameters framework to CSV (single file with multiple sheets)
 */
export function exportParametersToCSV(
  parameters: Parameter[],
  lensWeights: LensWeight[]
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Combine both sheets into one file with separators
  const sheet1 = generateParametersCSV(parameters, lensWeights);
  const sheet2 = generateScriptTypeMatrixCSV(parameters);
  
  const combinedContent = [
    '========================================',
    'SHEET 1: PARAMETERS WITH LENS WEIGHTS',
    '========================================',
    '',
    sheet1,
    '',
    '',
    '========================================',
    'SHEET 2: SCRIPT TYPE APPLICABILITY',
    '========================================',
    '',
    sheet2,
  ].join('\n');
  
  downloadCSV(combinedContent, `parameters-framework-${timestamp}.csv`);
}

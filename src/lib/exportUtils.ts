/**
 * Utility functions for exporting data to CSV format
 */

import {
  SCRIPT_TYPES,
  SIMPLE_SCRIPT_TYPES,
  CORE_AGENTS,
  COMIC_AGENTS,
  SYSTEM_AGENTS,
  META_AGENTS,
  INTERACTIVE_AGENTS,
  AUDIO_AGENTS,
  ALL_AGENTS,
  getAnalysisAgentsForScriptType,
  type AgentDefinition,
} from './scriptFramework';

import {
  ALL_PARAMETERS,
  COMIC_PARAMETERS,
  CORE_PARAMETERS,
  exportParametersToJSON,
  type ParameterDefinition,
} from './parameterDefinitions';

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
    'Agent Category',
    'Parameter Category',
    'Parameter Name',
    'Display Name',
    'Description',
    'Default Weight',
    ...LENS_ORDER.map((lens) => LENS_DISPLAY_NAMES[lens] || lens),
  ];

  const rows = parameters.map((param) => {
    const paramWeights = weightMap.get(param.id) || new Map();
    const agentDef = ALL_AGENTS.find(a => a.id === param.agent_source);
    return [
      param.agent_source.replace('Agent', ''),
      agentDef?.category || 'analysis',
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
    const categoryCompare = String(a[2]).localeCompare(String(b[2]));
    if (categoryCompare !== 0) return categoryCompare;
    return String(a[4]).localeCompare(String(b[4]));
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

  // Get all unique agents from parameters
  const allAgentIds = [...new Set(parameters.map(p => p.agent_source))];
  
  // Use simple script types for backward compatibility with DB
  const scriptTypes = SIMPLE_SCRIPT_TYPES;

  // Sheet 1: Agent × Script Type Matrix
  const agentMatrixHeaders = ['Agent', 'Category', 'Type', ...scriptTypes.map((t) => t.label)];
  const agentMatrixRows: (string | number)[][] = [];

  // Group agents by category
  const agentCategories = [
    { label: 'System Agents', agents: SYSTEM_AGENTS },
    { label: 'Core Analysis Agents', agents: CORE_AGENTS },
    { label: 'Comic Agents', agents: COMIC_AGENTS },
    { label: 'Interactive Agents', agents: INTERACTIVE_AGENTS },
    { label: 'Audio Agents', agents: AUDIO_AGENTS },
    { label: 'Meta Agents', agents: META_AGENTS },
  ];

  agentCategories.forEach(({ label, agents }) => {
    agents.forEach((agent) => {
      const agentParams = paramsByAgent.get(agent.id) || [];
      const paramCount = agentParams.length;
      
      agentMatrixRows.push([
        agent.name,
        label,
        agent.category,
        ...scriptTypes.map((scriptType) => {
          const applicableAgents = getAnalysisAgentsForScriptType(scriptType.value);
          const isApplicable = applicableAgents.some(a => a.id === agent.id);
          if (isApplicable) {
            return paramCount > 0 ? `✓ (${paramCount} params)` : '✓';
          }
          return '—';
        }),
      ]);
    });
  });

  // Sheet 2: Detailed Parameter × Script Type Matrix
  const paramMatrixHeaders = ['Agent', 'Parameter', 'Category', ...scriptTypes.map((t) => t.label)];
  const paramMatrixRows: (string | number)[][] = [];

  allAgentIds.forEach((agentId) => {
    const agentParams = paramsByAgent.get(agentId) || [];
    const agentDef = ALL_AGENTS.find(a => a.id === agentId);
    agentParams.forEach((param) => {
      paramMatrixRows.push([
        agentDef?.name || agentId.replace('Agent', ''),
        param.display_name,
        param.category,
        ...scriptTypes.map((scriptType) => {
          const applicableAgents = getAnalysisAgentsForScriptType(scriptType.value);
          return applicableAgents.some(a => a.id === agentId) ? '✓' : '—';
        }),
      ]);
    });
  });

  // Summary stats
  const summaryHeaders = ['Script Type', 'Active Agents', 'Total Parameters'];
  const summaryRows = scriptTypes.map((scriptType) => {
    const activeAgents = getAnalysisAgentsForScriptType(scriptType.value);
    const totalParams = activeAgents.reduce((sum, agent) => {
      return sum + (paramsByAgent.get(agent.id)?.length || 0);
    }, 0);
    return [
      scriptType.label,
      activeAgents.length,
      totalParams,
    ];
  });

  // Agent category summary
  const categoryHeaders = ['Agent Category', 'Count', 'Description'];
  const categoryRows = agentCategories.map(({ label, agents }) => [
    label,
    agents.length,
    agents.map(a => a.name).join(', '),
  ]);

  // Combine all sections with clear separators
  const sections = [
    '=== AGENT CATEGORIES ===',
    '',
    categoryHeaders.map(escapeCSV).join(','),
    ...categoryRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
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
    'PULSE UNIVERSAL SCRIPT ANALYSIS FRAMEWORK',
    '========================================',
    '',
    'SHEET 1: PARAMETERS WITH LENS WEIGHTS',
    '--------------------------------------',
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
  
  downloadCSV(combinedContent, `pulse-framework-${timestamp}.csv`);
}

/**
 * Exports the full parameter definitions with descriptions to JSON
 */
export function exportParameterDefinitionsJSON(): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const content = exportParametersToJSON();
  
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `pulse-parameters-${timestamp}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get all parameter definitions for a script type
 */
export function getParameterDefinitionsForExport(scriptType: string): ParameterDefinition[] {
  const isComic = ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'].includes(scriptType);
  
  if (isComic) {
    return [...CORE_PARAMETERS, ...COMIC_PARAMETERS];
  }
  return CORE_PARAMETERS;
}

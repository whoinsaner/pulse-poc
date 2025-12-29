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

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape existing quotes
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
  // Create a map for quick lens weight lookup
  const weightMap = new Map<string, Map<string, number>>();
  lensWeights.forEach((lw) => {
    if (!weightMap.has(lw.parameter_id)) {
      weightMap.set(lw.parameter_id, new Map());
    }
    weightMap.get(lw.parameter_id)!.set(lw.lens, lw.weight);
  });

  // Build header row
  const headers = [
    'Agent',
    'Category',
    'Parameter Name',
    'Display Name',
    'Description',
    'Default Weight',
    ...LENS_ORDER.map((lens) => LENS_DISPLAY_NAMES[lens] || lens),
  ];

  // Build data rows
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

  // Sort by Agent, then Category, then Display Name
  rows.sort((a, b) => {
    const agentCompare = String(a[0]).localeCompare(String(b[0]));
    if (agentCompare !== 0) return agentCompare;
    const categoryCompare = String(a[1]).localeCompare(String(b[1]));
    if (categoryCompare !== 0) return categoryCompare;
    return String(a[3]).localeCompare(String(b[3]));
  });

  // Convert to CSV string
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generates a summary CSV with agent statistics
 */
export function generateAgentSummaryCSV(parameters: Parameter[]): string {
  const agentStats = new Map<string, { count: number; categories: Set<string> }>();

  parameters.forEach((param) => {
    if (!agentStats.has(param.agent_source)) {
      agentStats.set(param.agent_source, { count: 0, categories: new Set() });
    }
    const stats = agentStats.get(param.agent_source)!;
    stats.count++;
    stats.categories.add(param.category);
  });

  const headers = ['Agent', 'Parameter Count', 'Categories'];
  const rows = Array.from(agentStats.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([agent, stats]) => [
      agent,
      stats.count,
      Array.from(stats.categories).sort().join('; '),
    ]);

  return [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');
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
 * Exports the full parameters framework to CSV
 */
export function exportParametersToCSV(
  parameters: Parameter[],
  lensWeights: LensWeight[]
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const csv = generateParametersCSV(parameters, lensWeights);
  downloadCSV(csv, `parameters-framework-${timestamp}.csv`);
}

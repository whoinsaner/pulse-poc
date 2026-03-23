/**
 * Full Report PDF Generator — Book-style with TOC and internal links
 * Mirrors every section of the online analysis report
 */

import jsPDF from 'jspdf';
import autoTableModule from 'jspdf-autotable';

// jspdf-autotable v5 exports differently depending on bundler
const autoTable = typeof autoTableModule === 'function' 
  ? autoTableModule 
  : (autoTableModule as any).default || autoTableModule;
import { ReportData, StakeholderLens, LENS_CONFIG, ScriptType, AgentSectionContent, ParameterScoreData } from '@/types/database';
import { getUSAFNavGroups, getScriptTypeLabel, isComicType, isWebSeriesType } from '@/lib/reportNavigation';
import { extractScore } from '@/lib/scoreUtils';

/** Safely convert a narrative item (string or {content, evidence} object) to a display string */
function toDisplayString(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    if (typeof obj.content === 'string') return obj.content;
    if (typeof obj.text === 'string') return obj.text;
    try { return JSON.stringify(item); } catch { return String(item); }
  }
  return String(item ?? '');
}

// ============= CONSTANTS =============

// Internal categories/parameters hidden from user-facing exports
const HIDDEN_CATEGORIES = new Set(['System']);
const INTERNAL_PARAMETER_NAMES = new Set([
  'arbitration_required', 'blend_complexity', 'classification_confidence',
  'final_confidence', 'input_completeness', 'normalization_quality',
  'type_clarity', 'weight_adjustments', 'confidence_shift',
  'decision_transparency', 'evolution_detected', 'improvements_detected',
  'reclassification_recommended', 'regressions_detected', 'trace_completeness',
  'readiness_score',
]);

const COLORS = {
  primary: [99, 102, 241] as [number, number, number],
  primaryLight: [224, 231, 255] as [number, number, number],
  secondary: [71, 85, 105] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textLight: [100, 116, 139] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  tableHeader: [99, 102, 241] as [number, number, number],
  tableAlt: [241, 245, 249] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  partDivider: [30, 41, 59] as [number, number, number],
};

const FONTS = {
  coverTitle: 28,
  partTitle: 22,
  h1: 18,
  h2: 14,
  h3: 12,
  body: 10,
  small: 9,
  tiny: 8,
};

const MARGINS = { left: 20, right: 20, top: 25, bottom: 25 };

// ============= AGENT KEY MAPPING =============

const SECTION_AGENT_MAP: Record<string, string[]> = {
  'story-diagnosis': ['StoryDiagnosisAgent'],
  'story-concept': ['ConceptHookAgent'],
  'story-structure': ['StructureAgent'],
  'story-conflict': ['ConflictStakesAgent'],
  'character-diagnosis': ['CharacterDiagnosisAgent'],
  'character-protagonist': ['ProtagonistAgent'],
  'character-antagonist': ['AntagonistAgent'],
  'character-cast': ['SupportingCastAgent'],
  'craft-diagnosis': ['CraftDiagnosisAgent'],
  'craft-dialogue': ['DialogueAgent'],
  'craft-theme': ['ThemeAgent'],
  'craft-visual': ['VisualStorytellingAgent'],
  'craft-emotional': ['EmotionalArcAgent'],
  'craft-scenes': ['SceneEconomyAgent'],
  'scene-analysis': ['SceneEconomyAgent', 'StructureAgent'],
  'bible': ['SeriesBibleAgent', 'WorldAgent', 'ThemeAgent', 'CharacterDiagnosisAgent'],
  'format': ['FormatDiagnosisAgent', 'ComicFormatAgent', 'WebSeriesAgent', 'MicroDramaFormatAgent'],
  'format-panel-flow': ['PanelFlowAgent'],
  'format-lettering': ['LetteringAgent'],
  'format-page-turns': ['PageTurnsAgent'],
  'format-art-synergy': ['ArtSynergyAgent'],
  'format-web-series': ['WebSeriesAgent'],
  'format-retention': ['StructureAgent', 'ConflictAgent'],
  'format-hooks': ['ConceptAgent'],
  'format-micro-drama': ['MicroDramaFormatAgent'],
  'commercial-diagnosis': ['CommercialDiagnosisAgent'],
  'commercial-market': ['MarketAgent'],
  'commercial-production': ['ProductionAgent'],
  'development': ['DevelopmentPrioritiesAgent', 'RewriteAgent'],
};

const SECTION_CATEGORY_MAP: Record<string, string[]> = {
  'story-concept': ['Concept & Hook'],
  'story-structure': ['Structure'],
  'story-conflict': ['Conflict'],
  'character-protagonist': ['Character'],
  'character-antagonist': ['Character'],
  'character-cast': ['Character'],
  'craft-dialogue': ['Dialogue'],
  'craft-theme': ['Theme'],
  'craft-visual': ['World & Logic', 'World'],
  'craft-emotional': ['Emotional Arc', 'Emotion'],
  'craft-scenes': ['Structure'],
  'format-panel-flow': ['Comic Visuals'],
  'format-lettering': ['Comic Dialogue'],
  'format-page-turns': ['Comic Pacing'],
  'format-art-synergy': ['Comic Art Direction', 'Comic Collaboration'],
  'format-web-series': ['Web Series'],
  'format-retention': ['Web Series'],
  'format-hooks': ['Web Series'],
  'format-micro-drama': ['Micro Drama'],
  'commercial-market': ['Market'],
  'commercial-production': ['Execution'],
};

// ============= TYPES =============

interface TocEntry {
  title: string;
  page: number;
  level: number; // 0=part, 1=section
  yPosition?: number;
}

interface PageCounter {
  value: number;
}

// ============= HELPERS =============

function getPageWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth();
}

function getPageHeight(doc: jsPDF): number {
  return doc.internal.pageSize.getHeight();
}

function getContentWidth(doc: jsPDF): number {
  return getPageWidth(doc) - MARGINS.left - MARGINS.right;
}

/** Reset font to default body style - call this after any style changes to ensure consistency */
function resetFontStyle(doc: jsPDF): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.body);
  doc.setTextColor(...COLORS.text);
}

function addRunningHeader(doc: jsPDF, sectionName: string, pageNum: PageCounter) {
  const pw = getPageWidth(doc);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGINS.left, 15, pw - MARGINS.right, 15);
  doc.setFontSize(FONTS.tiny);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(sectionName, MARGINS.left, 12);
  doc.text(`Page ${pageNum.value}`, pw - MARGINS.right, 12, { align: 'right' });
}

function addRunningFooter(doc: jsPDF) {
  const pw = getPageWidth(doc);
  const ph = getPageHeight(doc);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(MARGINS.left, ph - 15, pw - MARGINS.right, ph - 15);
  doc.setFontSize(FONTS.tiny);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    `Generated ${new Date().toLocaleDateString()} • USAF v3.0 Analysis Report`,
    pw / 2, ph - 10, { align: 'center' }
  );
}

function newPage(doc: jsPDF, pageNum: PageCounter, sectionName: string): number {
  doc.addPage();
  pageNum.value = doc.getNumberOfPages();
  addRunningHeader(doc, sectionName, pageNum);
  addRunningFooter(doc);
  resetFontStyle(doc);
  return MARGINS.top + 10;
}

function checkBreak(doc: jsPDF, y: number, needed: number, pageNum: PageCounter, sectionName: string): number {
  if (y + needed > getPageHeight(doc) - MARGINS.bottom) {
    return newPage(doc, pageNum, sectionName);
  }
  return y;
}

function getScoreColor(score: number): [number, number, number] {
  if (score >= 75) return COLORS.success;
  if (score >= 50) return COLORS.warning;
  return COLORS.danger;
}

function getDecisionSignal(score: number): string {
  if (score >= 75) return 'GO';
  if (score >= 50) return 'ITERATE';
  return 'HOLD';
}

function getReadinessLabel(score: number): string {
  if (score >= 80) return 'Production-Ready';
  if (score >= 65) return 'High-Potential';
  if (score >= 50) return 'Development Stage';
  return 'Needs Work';
}

/** Sanitize text for jsPDF's built-in fonts (no Unicode support) */
function sanitizeText(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u2018\u2019\u201A]/g, "'")   // smart single quotes → '
    .replace(/[\u201C\u201D\u201E]/g, '"')    // smart double quotes → "
    .replace(/\u2014/g, '--')                  // em dash → --
    .replace(/\u2013/g, '-')                   // en dash → -
    .replace(/\u2026/g, '...')                 // ellipsis → ...
    .replace(/\u2192/g, '->')                  // → arrow
    .replace(/\u2190/g, '<-')                  // ← arrow
    .replace(/\u2191/g, '^')                   // ↑ arrow
    .replace(/\u2193/g, 'v')                   // ↓ arrow
    .replace(/\u2022/g, '*')                   // bullet •
    .replace(/\u00A0/g, ' ')                   // non-breaking space
    .replace(/\u200B/g, '')                    // zero-width space
    .replace(/[\u2000-\u200A]/g, ' ')          // various Unicode spaces
    .replace(/\u00D7/g, 'x')                   // × multiplication
    .replace(/\u2212/g, '-')                   // minus sign
    .replace(/\u2032/g, "'")                   // prime → '
    .replace(/\u2033/g, '"')                   // double prime → "
    .replace(/[^\x00-\x7F]/g, (ch) => {        // fallback: any remaining non-ASCII
      // Keep common accented Latin chars (they work in Helvetica)
      if (ch.charCodeAt(0) >= 0x00C0 && ch.charCodeAt(0) <= 0x00FF) return ch;
      return '';
    });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  if (!text) return [];
  return doc.splitTextToSize(sanitizeText(String(text)), Math.max(10, maxWidth)) as string[];
}

/** Reliably get finalY from autoTable result, with fallback */
function getTableFinalY(doc: jsPDF, result: unknown, fallbackY: number): number {
  // Try the returned result first (jspdf-autotable v5 functional pattern)
  if (result && typeof result === 'object' && typeof (result as any).finalY === 'number') {
    return (result as any).finalY;
  }
  // Fallback: lastAutoTable property (older pattern)
  if ((doc as any).lastAutoTable && typeof (doc as any).lastAutoTable.finalY === 'number') {
    return (doc as any).lastAutoTable.finalY;
  }
  return fallbackY;
}

// ============= SECTION RENDERERS =============

function renderCoverPage(doc: jsPDF, data: ReportData, title: string, activeLens: StakeholderLens, scriptType: ScriptType): number {
  const pw = getPageWidth(doc);
  const ph = getPageHeight(doc);
  const score = data.lensScores?.[activeLens] ?? data.overallScore ?? 0;
  const signal = getDecisionSignal(score);

  // Dark cover background
  doc.setFillColor(...COLORS.partDivider);
  doc.rect(0, 0, pw, ph, 'F');

  // Branding
  doc.setFontSize(FONTS.tiny);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text('USAF v3.0 • Universal Script Analysis Framework', pw / 2, 30, { align: 'center' });

  // Title
  doc.setFontSize(FONTS.coverTitle);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  const titleLines = wrapText(doc, title.toUpperCase(), pw - 60);
  let ty = 80;
  titleLines.forEach(line => {
    doc.text(line, pw / 2, ty, { align: 'center' });
    ty += 14;
  });

  // Script type badge
  doc.setFontSize(FONTS.small);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.primaryLight);
  doc.text(getScriptTypeLabel(scriptType), pw / 2, ty + 8, { align: 'center' });

  // Score circle area
  const scoreY = ty + 40;
  doc.setFillColor(...getScoreColor(score));
  doc.circle(pw / 2, scoreY, 22, 'F');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text(String(Math.round(score)), pw / 2, scoreY + 3, { align: 'center' });

  // Decision signal
  doc.setFontSize(FONTS.h2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...getScoreColor(score));
  doc.text(signal, pw / 2, scoreY + 35, { align: 'center' });

  doc.setFontSize(FONTS.small);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(getReadinessLabel(score), pw / 2, scoreY + 45, { align: 'center' });

  // Metadata pills
  const meta = data.scriptMetadata;
  const pills: string[] = [];
  if (meta?.genre) pills.push(meta.genre);
  if (meta?.pageCount) pills.push(`${meta.pageCount} pages`);
  if (meta?.characterCount) pills.push(`${meta.characterCount} characters`);
  if (meta?.sceneCount) pills.push(`${meta.sceneCount} scenes`);
  
  if (pills.length > 0) {
    doc.setFontSize(FONTS.small);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textLight);
    doc.text(pills.join('  •  '), pw / 2, scoreY + 60, { align: 'center' });
  }

  // Lens
  doc.setFontSize(FONTS.tiny);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.primaryLight);
  doc.text(`Lens: ${LENS_CONFIG[activeLens]?.label || activeLens}`, pw / 2, ph - 30, { align: 'center' });
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pw / 2, ph - 22, { align: 'center' });

  return 1;
}

function renderPartDivider(doc: jsPDF, pageNum: PageCounter, partNumber: string, partTitle: string, toc: TocEntry[]): number {
  doc.addPage();
  pageNum.value = doc.getNumberOfPages();
  const pw = getPageWidth(doc);
  const ph = getPageHeight(doc);

  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pw, ph, 'F');

  doc.setFontSize(FONTS.h2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(partNumber, pw / 2, ph / 2 - 20, { align: 'center' });

  doc.setFontSize(FONTS.partTitle);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(partTitle, pw / 2, ph / 2, { align: 'center' });

  addRunningFooter(doc);

  toc.push({ title: `${partNumber} — ${partTitle}`, page: pageNum.value, level: 0 });

  return pageNum.value;
}

function renderSectionTitle(doc: jsPDF, y: number, title: string, subtitle?: string): number {
  doc.setFontSize(FONTS.h1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(title, MARGINS.left, y);
  y += 8;

  if (subtitle) {
    doc.setFontSize(FONTS.small);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textLight);
    doc.text(subtitle, MARGINS.left, y);
    y += 6;
  }

  // Underline
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(MARGINS.left, y, MARGINS.left + 40, y);
  y += 10;

  resetFontStyle(doc);
  return y;
}

function renderAgentNarrative(
  doc: jsPDF, y: number, agentKeys: string[],
  agentContent: Record<string, AgentSectionContent> | undefined,
  pageNum: PageCounter, sectionName: string
): number {
  if (!agentContent) return y;
  const cw = getContentWidth(doc);

  for (const key of agentKeys) {
    const content = agentContent[key];
    if (!content) continue;

    try {
      // Verdict
      if (content.verdict) {
        y = checkBreak(doc, y, 20, pageNum, sectionName);
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'bolditalic');
        doc.setTextColor(...COLORS.primary);
        const lines = wrapText(doc, `"${content.verdict}"`, cw);
        lines.forEach(line => {
          doc.text(line, MARGINS.left, y);
          y += 5;
        });
        y += 4;
        resetFontStyle(doc);
      }

      // Deep Dive
      if (content.deepDive) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const paragraphs = String(content.deepDive).split('\n').filter(p => p.trim());
        for (const para of paragraphs) {
          const lines = wrapText(doc, para.trim(), cw);
          for (const line of lines) {
            y = checkBreak(doc, y, 6, pageNum, sectionName);
            doc.text(line, MARGINS.left, y);
            y += 5;
          }
          y += 3;
        }
      }

      // What Works
      if (content.whatWorks && Array.isArray(content.whatWorks) && content.whatWorks.length > 0) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.success);
        doc.text('What Works', MARGINS.left, y);
        y += 7;
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        for (const item of content.whatWorks) {
          y = checkBreak(doc, y, 6, pageNum, sectionName);
          const lines = wrapText(doc, `+ ${toDisplayString(item)}`, cw - 5);
          lines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 5; });
          y += 1;
        }
        y += 4;
      }

      // What's Broken
      if (content.whatsBroken && Array.isArray(content.whatsBroken) && content.whatsBroken.length > 0) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.danger);
        doc.text("What's Broken", MARGINS.left, y);
        y += 7;
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        for (const item of content.whatsBroken) {
          y = checkBreak(doc, y, 6, pageNum, sectionName);
          const lines = wrapText(doc, `✗ ${toDisplayString(item)}`, cw - 5);
          lines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 5; });
          y += 1;
        }
        y += 4;
      }

      // What's Underdeveloped
      if (content.whatsUnderdeveloped && Array.isArray(content.whatsUnderdeveloped) && content.whatsUnderdeveloped.length > 0) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.warning);
        doc.text("What's Underdeveloped", MARGINS.left, y);
        y += 7;
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        for (const item of content.whatsUnderdeveloped) {
          y = checkBreak(doc, y, 6, pageNum, sectionName);
          const lines = wrapText(doc, `- ${toDisplayString(item)}`, cw - 5);
          lines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 5; });
          y += 1;
        }
        y += 4;
      }

      // Key Quotes
      if (content.keyQuotes && Array.isArray(content.keyQuotes) && content.keyQuotes.length > 0) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.secondary);
        doc.text('Key Quotes', MARGINS.left, y);
        y += 7;
        for (const q of content.keyQuotes) {
          if (!q || !q.quote) continue;
          y = checkBreak(doc, y, 14, pageNum, sectionName);
          doc.setFontSize(FONTS.small);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...COLORS.textLight);
          const qLines = wrapText(doc, `"${q.quote}"`, cw - 10);
          qLines.forEach(line => { doc.text(line, MARGINS.left + 5, y); y += 4.5; });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(FONTS.tiny);
          const ctx = q.page ? `${q.context || ''} (p.${q.page})` : (q.context || '');
          if (ctx) {
            const ctxLines = wrapText(doc, `— ${ctx}`, cw - 10);
            ctxLines.forEach(line => { doc.text(line, MARGINS.left + 5, y); y += 4; });
          }
          y += 3;
        }
        y += 3;
      }

      // Recommendations
      if (content.recommendations && Array.isArray(content.recommendations) && content.recommendations.length > 0) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('Recommendations', MARGINS.left, y);
        y += 7;
        for (const rec of content.recommendations) {
          if (!rec || !rec.title) continue;
          y = checkBreak(doc, y, 16, pageNum, sectionName);
          doc.setFontSize(FONTS.body);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.text);
          const priorityTag = `[${(rec.priority || 'medium').toUpperCase()}/${(rec.effort || 'medium').toUpperCase()}]`;
          const recTitleLines = wrapText(doc, `${priorityTag}  ${rec.title}`, cw - 8);
          recTitleLines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 5; });
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.textLight);
          if (rec.description) {
            const dLines = wrapText(doc, rec.description, cw - 8);
            dLines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 4.5; });
          }
          y += 3;
        }
        y += 4;
      }

      // Character profiles (protagonist/antagonist sections)
      if (content.protagonistProfile) {
        const p = content.protagonistProfile;
        y = checkBreak(doc, y, 30, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        const protLines = wrapText(doc, `Protagonist: ${p.name || 'Unknown'}`, cw);
        protLines.forEach(line => { doc.text(line, MARGINS.left, y); y += 6; });
        y += 1;
        doc.setFontSize(FONTS.body);
        const fields = [
          ['Want', p.want], ['Need', p.need], ['Flaw', p.flaw], ['Arc', p.arc]
        ];
        for (const [label, val] of fields) {
          if (val) {
            y = checkBreak(doc, y, 6, pageNum, sectionName);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.secondary);
            doc.text(`${label}: `, MARGINS.left + 3, y);
            const labelW = doc.getTextWidth(`${label}: `);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.text);
            const valLines = wrapText(doc, String(val), cw - labelW - 8);
            valLines.forEach((line, i) => {
              doc.text(line, MARGINS.left + 3 + (i === 0 ? labelW : 0), y);
              y += 5;
            });
          }
        }
        y += 4;
      }

      if (content.antagonistProfile) {
        const a = content.antagonistProfile;
        y = checkBreak(doc, y, 20, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        const antLines = wrapText(doc, `Antagonist: ${a.name || 'Unknown'}`, cw);
        antLines.forEach(line => { doc.text(line, MARGINS.left, y); y += 6; });
        y += 1;
        doc.setFontSize(FONTS.body);
        const fields = [
          ['Motivation', a.motivation], ['Threat', a.threat], ['Complexity', a.complexity]
        ];
        for (const [label, val] of fields) {
          if (val) {
            y = checkBreak(doc, y, 6, pageNum, sectionName);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.secondary);
            doc.text(`${label}: `, MARGINS.left + 3, y);
            const lw = doc.getTextWidth(`${label}: `);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.text);
            const vl = wrapText(doc, String(val), cw - lw - 8);
            vl.forEach((line, i) => {
              doc.text(line, MARGINS.left + 3 + (i === 0 ? lw : 0), y);
              y += 5;
            });
          }
        }
        y += 4;
      }

      // Supporting Cast
      if (content.supportingCast && Array.isArray(content.supportingCast) && content.supportingCast.length > 0) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text('Supporting Cast', MARGINS.left, y);
        y += 7;
        for (const c of content.supportingCast) {
          if (!c) continue;
          y = checkBreak(doc, y, 12, pageNum, sectionName);
          doc.setFontSize(FONTS.body);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.text);
          const castLines = wrapText(doc, `${c.name || 'Unknown'} — ${c.role || ''}`, cw - 8);
          castLines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 5; });
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.textLight);
          if (c.impact) {
            const il = wrapText(doc, c.impact, cw - 8);
            il.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 4.5; });
          }
          y += 3;
        }
        y += 4;
      }

      // Market-specific
      if (content.comparableTitles && Array.isArray(content.comparableTitles) && content.comparableTitles.length > 0) {
        y = checkBreak(doc, y, 15, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text('Comparable Titles', MARGINS.left, y);
        y += 7;

        const tableBody = content.comparableTitles.map(ct => [
          ct?.title || '—',
          ct?.relevance || '—',
          typeof ct?.imdbRating === 'number' ? ct.imdbRating.toFixed(1) : '—',
          typeof ct?.similarityScore === 'number' ? `${ct.similarityScore}%` : '—',
        ]);

        let ctFirstPage = true;
        const ctResult = autoTable(doc, {
          startY: y,
          head: [['Title', 'Relevance', 'IMDb', 'Similarity']],
          body: tableBody,
          margin: { left: MARGINS.left, right: MARGINS.right },
          styles: { fontSize: FONTS.body - 1, cellPadding: 2, textColor: COLORS.text },
          headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255] as any, fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 35, fontStyle: 'bold' },
            2: { cellWidth: 16, halign: 'center' as const },
            3: { cellWidth: 20, halign: 'center' as const },
          },
          didDrawPage: () => {
            if (!ctFirstPage) {
              addRunningHeader(doc, sectionName, { value: doc.getNumberOfPages() });
              addRunningFooter(doc);
            }
            ctFirstPage = false;
          },
        });
        pageNum.value = doc.getNumberOfPages();
        y = getTableFinalY(doc, ctResult, y + 30) + 6;
        resetFontStyle(doc);
      }

      if (content.targetAudience) {
        y = checkBreak(doc, y, 12, pageNum, sectionName);
        doc.setFontSize(FONTS.h3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text('Target Audience', MARGINS.left, y);
        y += 6;
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const tal = wrapText(doc, String(content.targetAudience), cw);
        tal.forEach(line => { y = checkBreak(doc, y, 5, pageNum, sectionName); doc.text(line, MARGINS.left, y); y += 5; });
        y += 4;
      }

      // Reset font style after each agent
      resetFontStyle(doc);
    } catch (err) {
      console.error(`Error rendering agent ${key}:`, err);
      // Continue with next agent
    }
  }

  resetFontStyle(doc);
  return y;
}

function renderParameterCards(
  doc: jsPDF, y: number, sectionId: string,
  params: ParameterScoreData[],
  pageNum: PageCounter, sectionName: string
): number {
  const categories = SECTION_CATEGORY_MAP[sectionId];
  if (!categories) return y;

  const sectionParams = (params || []).filter(p => p && categories.includes(p.category));
  if (sectionParams.length === 0) return y;

  const cw = getContentWidth(doc);

  y = checkBreak(doc, y, 15, pageNum, sectionName);
  doc.setFontSize(FONTS.h3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.secondary);
  doc.text('Parameter Scores', MARGINS.left, y);
  y += 8;

  for (const p of sectionParams) {
    try {
      y = checkBreak(doc, y, 22, pageNum, sectionName);

      // Score bar background
      const barX = MARGINS.left;
      const barWidth = cw;
      doc.setFillColor(...COLORS.background);
      if (barWidth > 0) doc.roundedRect(barX, y - 3, barWidth, 18, 2, 2, 'F');

      // Parameter name and score
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text(p.displayName || p.parameterName || 'Unknown', barX + 4, y + 3);

      // Score
      const score = typeof p.score === 'number' ? p.score : 0;
      const scoreColor = getScoreColor(score);
      doc.setTextColor(...scoreColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${Math.round(score)}`, barX + barWidth - 4, y + 3, { align: 'right' });

      // Maturity & fix cost badges
      const badges: string[] = [];
      if (p.maturity) badges.push(p.maturity);
      if (p.fixCost) badges.push(`Fix: ${p.fixCost}`);
      if (badges.length > 0) {
        doc.setFontSize(FONTS.tiny);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textLight);
        doc.text(badges.join('  |  '), barX + 4, y + 10);
      }

      y += 20;

      // Rationale (compact)
      if (p.rationale) {
        doc.setFontSize(FONTS.small);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textLight);
        const rLines = wrapText(doc, String(p.rationale), cw - 8);
        const maxLines = Math.min(rLines.length, 3);
        for (let i = 0; i < maxLines; i++) {
          y = checkBreak(doc, y, 5, pageNum, sectionName);
          doc.text(rLines[i], MARGINS.left + 4, y);
          y += 4.5;
        }
        y += 3;
      }
    } catch (err) {
      console.error(`Error rendering parameter ${p?.parameterName}:`, err);
    }
  }

  resetFontStyle(doc);
  return y;
}

function renderDiagnosisOverview(
  doc: jsPDF, y: number, categories: string[],
  categoryScores: Record<string, unknown>,
  pageNum: PageCounter, sectionName: string
): number {
  const cw = getContentWidth(doc);

  for (const cat of categories) {
    try {
      const raw = categoryScores[cat];
      if (raw === undefined) continue;
      const score = extractScore(raw);

      y = checkBreak(doc, y, 12, pageNum, sectionName);

      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      // Truncate long category names to fit before the score bar
      const maxCatWidth = cw * 0.5;
      const catText = doc.getTextWidth(cat) > maxCatWidth 
        ? cat.substring(0, Math.floor(cat.length * maxCatWidth / doc.getTextWidth(cat))) + '…' 
        : cat;
      doc.text(catText, MARGINS.left + 3, y);

      // Mini score bar
      const barX = MARGINS.left + cw * 0.55;
      const barW = cw * 0.3;
      doc.setFillColor(...COLORS.background);
      if (barW > 0) doc.roundedRect(barX, y - 4, barW, 6, 1, 1, 'F');
      const fillW = barW * (score / 100);
      if (fillW > 0) {
        doc.setFillColor(...getScoreColor(score));
        doc.roundedRect(barX, y - 4, Math.max(0.5, fillW), 6, 1, 1, 'F');
      }

      doc.setFontSize(FONTS.small);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...getScoreColor(score));
      doc.text(`${Math.round(score)}`, MARGINS.left + cw - 2, y, { align: 'right' });

      y += 10;
    } catch (err) {
      console.error(`Error rendering category ${cat}:`, err);
    }
  }

  resetFontStyle(doc);
  return y;
}

function renderExecutiveSummary(
  doc: jsPDF, y: number, data: ReportData, activeLens: StakeholderLens,
  pageNum: PageCounter
): number {
  const sectionName = 'Executive Summary';
  const cw = getContentWidth(doc);

  y = renderSectionTitle(doc, y, 'Executive Summary', 'AI-generated overview of script analysis');

  // Overall assessment
  const score = data.lensScores?.[activeLens] ?? data.overallScore ?? 0;

  // Category scores overview
  if (data.categoryScores && Object.keys(data.categoryScores).length > 0) {
    y = checkBreak(doc, y, 15, pageNum, sectionName);
    doc.setFontSize(FONTS.h3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Category Breakdown', MARGINS.left, y);
    y += 8;

    const filteredCategories = Object.keys(data.categoryScores).filter(c => !HIDDEN_CATEGORIES.has(c));
    y = renderDiagnosisOverview(doc, y, filteredCategories, data.categoryScores, pageNum, sectionName);
    y += 6;
  }

  // Lens scores
  if (data.lensScores && Object.keys(data.lensScores).length > 0) {
    y = checkBreak(doc, y, 15, pageNum, sectionName);
    doc.setFontSize(FONTS.h3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Stakeholder Lens Scores', MARGINS.left, y);
    y += 8;

    const lensEntries = Object.entries(data.lensScores) as [StakeholderLens, number][];
    for (const [lens, lScore] of lensEntries) {
      y = checkBreak(doc, y, 8, pageNum, sectionName);
      doc.setFontSize(FONTS.small);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const label = LENS_CONFIG[lens]?.label || lens;
      doc.text(label, MARGINS.left + 3, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...getScoreColor(lScore));
      doc.text(`${Math.round(lScore)}`, MARGINS.left + cw - 2, y, { align: 'right' });
      y += 6;
    }
    y += 6;
  }

  // Top insights
  if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
    y = checkBreak(doc, y, 15, pageNum, sectionName);
    doc.setFontSize(FONTS.h3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Key Insights', MARGINS.left, y);
    y += 7;

    const topInsights = [...data.insights].sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 5);
    for (const insight of topInsights) {
      if (!insight) continue;
      y = checkBreak(doc, y, 14, pageNum, sectionName);
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text(insight.title || 'Untitled Insight', MARGINS.left + 3, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textLight);
      if (insight.description) {
        const dLines = wrapText(doc, insight.description, cw - 8);
        const maxL = Math.min(dLines.length, 2);
        for (let i = 0; i < maxL; i++) {
          doc.text(dLines[i], MARGINS.left + 3, y);
          y += 4.5;
        }
      }
      y += 3;
    }
  }

  resetFontStyle(doc);
  return y;
}

function renderSection(
  doc: jsPDF, y: number, sectionId: string, title: string, subtitle: string,
  data: ReportData, pageNum: PageCounter
): number {
  const sectionName = title;
  y = renderSectionTitle(doc, y, title, subtitle);

  // Agent narrative
  const agentKeys = SECTION_AGENT_MAP[sectionId] || [];
  y = renderAgentNarrative(doc, y, agentKeys, data.agentContent, pageNum, sectionName);

  // Parameter cards
  y = renderParameterCards(doc, y, sectionId, data.parameterScores || [], pageNum, sectionName);

  return y;
}

function renderCompleteScorecardAppendix(doc: jsPDF, y: number, data: ReportData, pageNum: PageCounter): number {
  const sectionName = 'Complete Scorecard';
  y = renderSectionTitle(doc, y, 'Complete Scorecard', 'All parameter scores across categories');

  const params = (data.parameterScores || []).filter(p => 
    p && !INTERNAL_PARAMETER_NAMES.has(p.parameterName) && !HIDDEN_CATEGORIES.has(p.category)
  );

  if (params.length === 0) {
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.textLight);
    doc.text('No parameter scores available.', MARGINS.left, y);
    return y + 10;
  }

  const tableData = params.map(p => [
    p.displayName || p.parameterName || '—',
    p.category || '—',
    `${Math.round(p.score ?? 0)}`,
    p.maturity || '—',
  ]);

  let scFirstPage = true;
  const scResult = autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Category', 'Score', 'Maturity']],
    body: tableData,
    margin: { left: MARGINS.left, right: MARGINS.right },
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: FONTS.small,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: FONTS.small,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.tableAlt,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      2: { cellWidth: 18, halign: 'center' as const },
      3: { cellWidth: 25, halign: 'center' as const },
    },
    didDrawPage: () => {
      if (!scFirstPage) {
        addRunningHeader(doc, sectionName, { value: doc.getNumberOfPages() });
        addRunningFooter(doc);
      }
      scFirstPage = false;
    },
  });
  pageNum.value = doc.getNumberOfPages();
  resetFontStyle(doc);

  return getTableFinalY(doc, scResult, y + 20) + 8;
}

function renderCharacterAppendix(doc: jsPDF, y: number, data: ReportData, pageNum: PageCounter): number {
  const sectionName = 'Character Reference';
  y = renderSectionTitle(doc, y, 'Character Reference', 'All extracted characters');

  const chars = data.characters || [];
  if (chars.length === 0) {
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.textLight);
    doc.text('No characters extracted.', MARGINS.left, y);
    return y + 10;
  }

  const tableData = chars.map(c => [
    c.name || '—',
    c.description ? (c.description.length > 60 ? c.description.substring(0, 57) + '...' : c.description) : '—',
    c.dialogueCount != null ? String(c.dialogueCount) : '—',
    c.sceneCount != null ? String(c.sceneCount) : '—',
  ]);

  let chFirstPage = true;
  const chResult = autoTable(doc, {
    startY: y,
    head: [['Name', 'Description', 'Dialogues', 'Scenes']],
    body: tableData,
    margin: { left: MARGINS.left, right: MARGINS.right },
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: FONTS.small,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: FONTS.tiny,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.tableAlt,
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' as const },
      3: { cellWidth: 18, halign: 'center' as const },
    },
    didDrawPage: () => {
      if (!chFirstPage) {
        addRunningHeader(doc, sectionName, { value: doc.getNumberOfPages() });
        addRunningFooter(doc);
      }
      chFirstPage = false;
    },
  });
  pageNum.value = doc.getNumberOfPages();
  resetFontStyle(doc);

  return getTableFinalY(doc, chResult, y + 20) + 8;
}

function renderSceneAppendix(doc: jsPDF, y: number, data: ReportData, pageNum: PageCounter): number {
  const sectionName = 'Scene Index';
  y = renderSectionTitle(doc, y, 'Scene Index', 'All scenes with locations and tones');

  const scenes = data.scenes || [];
  if (scenes.length === 0) {
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.textLight);
    doc.text('No scenes extracted.', MARGINS.left, y);
    return y + 10;
  }

  const tableData = scenes.map(s => [
    `${s.sceneNumber ?? '—'}`,
    s.heading || '—',
    s.emotionalTone || '—',
    s.intExt || '—',
    s.pageStart ? `${s.pageStart}${s.pageEnd && s.pageEnd !== s.pageStart ? `-${s.pageEnd}` : ''}` : '—',
  ]);

  let siFirstPage = true;
  const siResult = autoTable(doc, {
    startY: y,
    head: [['#', 'Heading', 'Tone', 'Int/Ext', 'Pages']],
    body: tableData,
    margin: { left: MARGINS.left, right: MARGINS.right },
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: FONTS.small,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: FONTS.tiny,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.tableAlt,
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 55 },
      4: { cellWidth: 15 },
    },
    didDrawPage: () => {
      if (!siFirstPage) {
        addRunningHeader(doc, sectionName, { value: doc.getNumberOfPages() });
        addRunningFooter(doc);
      }
      siFirstPage = false;
    },
  });
  pageNum.value = doc.getNumberOfPages();
  resetFontStyle(doc);

  return (siResult as any)?.finalY ? (siResult as any).finalY + 8 : y + 20;
}

// ============= TOC =============

function renderTocPage(doc: jsPDF, toc: TocEntry[], pageNum: PageCounter): void {
  // We reserved page 2 for TOC. Go back and render it.
  const totalPages = doc.getNumberOfPages();
  doc.setPage(2);
  let y = MARGINS.top + 10;

  doc.setFontSize(FONTS.h1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Table of Contents', MARGINS.left, y);
  y += 12;

  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(MARGINS.left, y, MARGINS.left + 40, y);
  y += 10;

  const cw = getContentWidth(doc);

  for (const entry of toc) {
    if (y > getPageHeight(doc) - MARGINS.bottom - 10) break; // TOC overflow protection

    // Clamp page number to actual page count to prevent objId errors
    const safePage = Math.min(entry.page, totalPages);

    if (entry.level === 0) {
      // Part divider
      y += 4;
      doc.setFontSize(FONTS.h3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(entry.title, MARGINS.left, y);
      doc.setFontSize(FONTS.small);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textLight);
      doc.text(`${safePage}`, MARGINS.left + cw, y, { align: 'right' });
      // Clickable link over the entire TOC line
      const lineH0 = FONTS.h3 * 0.4;
      doc.link(MARGINS.left, y - lineH0, cw, lineH0 + 2, { pageNumber: safePage });
      y += 7;
    } else {
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.text(entry.title, MARGINS.left + 8, y);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`${safePage}`, MARGINS.left + cw, y, { align: 'right' });
      // Clickable link over the entire TOC line
      const lineH1 = FONTS.body * 0.4;
      doc.link(MARGINS.left + 8, y - lineH1, cw - 8, lineH1 + 2, { pageNumber: safePage });
      y += 6;
    }
  }

  // CRITICAL: Restore page pointer to last page so doc.output() works correctly
  doc.setPage(totalPages);
}

// ============= MAIN EXPORT =============

interface SectionDef {
  id: string;
  title: string;
  subtitle: string;
}

export async function generateFullReportPDF(
  data: ReportData,
  title: string,
  activeLens: StakeholderLens,
  scriptType: ScriptType
): Promise<Blob> {
  console.log('[PDF] Starting generation for:', title);
  
  // Validate input data
  if (!data) {
    console.error('[PDF] No report data provided');
    throw new Error('Report data is required for PDF generation');
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageNum: PageCounter = { value: 1 };
  const toc: TocEntry[] = [];

  try {
    // === PAGE 1: Cover ===
    console.log('[PDF] Rendering cover page');
    renderCoverPage(doc, data, title, activeLens, scriptType);

    // === PAGE 2: TOC placeholder (rendered last) ===
    doc.addPage();
    pageNum.value = doc.getNumberOfPages();
    addRunningHeader(doc, 'Table of Contents', pageNum);
    addRunningFooter(doc);
    // Will be overwritten after all content is generated

    // === PAGE 3+: Executive Summary ===
    console.log('[PDF] Rendering executive summary');
    let y = newPage(doc, pageNum, 'Executive Summary');
    toc.push({ title: 'Executive Summary', page: pageNum.value, level: 1 });
    y = renderExecutiveSummary(doc, y, data, activeLens, pageNum);
    

    // === PART I: STORY ANALYSIS ===
    console.log('[PDF] Rendering Story Analysis');
    renderPartDivider(doc, pageNum, 'PART I', 'STORY ANALYSIS', toc);
    

    const storySections: SectionDef[] = [
      { id: 'story-diagnosis', title: 'Story Diagnosis', subtitle: 'Overview of narrative strengths and weaknesses' },
      { id: 'story-concept', title: 'Concept & Hook', subtitle: 'Premise originality, logline strength, and hook clarity' },
      { id: 'story-structure', title: 'Structure', subtitle: 'Act breaks, pacing, and narrative architecture' },
      { id: 'story-conflict', title: 'Conflict & Stakes', subtitle: 'Central conflict, escalation, and stakes clarity' },
    ];

    for (const sec of storySections) {
      y = newPage(doc, pageNum, sec.title);
      toc.push({ title: sec.title, page: pageNum.value, level: 1 });
      if (sec.id === 'story-diagnosis') {
        y = renderSectionTitle(doc, y, sec.title, sec.subtitle);
        y = renderDiagnosisOverview(doc, y, ['Concept & Hook', 'Structure', 'Conflict'], data.categoryScores || {}, pageNum, sec.title);
        y = renderAgentNarrative(doc, y, SECTION_AGENT_MAP[sec.id] || [], data.agentContent, pageNum, sec.title);
      } else {
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    }

    // === PART II: CHARACTERS ===
    console.log('[PDF] Rendering Characters');
    renderPartDivider(doc, pageNum, 'PART II', 'CHARACTERS', toc);

    const charSections: SectionDef[] = [
      { id: 'character-diagnosis', title: 'Character Diagnosis', subtitle: 'Overview of character depth and arcs' },
      { id: 'character-protagonist', title: 'Protagonist Analysis', subtitle: 'Want, need, flaw, and arc assessment' },
      { id: 'character-antagonist', title: 'Antagonist Analysis', subtitle: 'Motivation, threat level, and complexity' },
      { id: 'character-cast', title: 'Supporting Cast', subtitle: 'Ensemble depth and functional roles' },
    ];

    for (const sec of charSections) {
      y = newPage(doc, pageNum, sec.title);
      toc.push({ title: sec.title, page: pageNum.value, level: 1 });
      if (sec.id === 'character-diagnosis') {
        y = renderSectionTitle(doc, y, sec.title, sec.subtitle);
        y = renderDiagnosisOverview(doc, y, ['Character'], data.categoryScores || {}, pageNum, sec.title);
        y = renderAgentNarrative(doc, y, SECTION_AGENT_MAP[sec.id] || [], data.agentContent, pageNum, sec.title);
      } else {
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    }

    // === PART III: CRAFT ===
    console.log('[PDF] Rendering Craft');
    renderPartDivider(doc, pageNum, 'PART III', 'CRAFT', toc);

    const craftSections: SectionDef[] = [
      { id: 'craft-diagnosis', title: 'Craft Diagnosis', subtitle: 'Writing quality across dialogue, theme, and emotion' },
      { id: 'craft-dialogue', title: 'Dialogue & Subtext', subtitle: 'Voice distinctiveness, subtext, and exposition handling' },
      { id: 'craft-theme', title: 'Theme & Meaning', subtitle: 'Thematic depth, consistency, and resonance' },
      { id: 'craft-visual', title: 'Visual Storytelling', subtitle: 'Show-don\'t-tell, world-building, and sensory detail' },
      { id: 'craft-emotional', title: 'Emotional Arc', subtitle: 'Emotional beats, catharsis, and tonal control' },
      { id: 'craft-scenes', title: 'Scene Economy', subtitle: 'Scene efficiency, redundancy, and pacing' },
    ];

    for (const sec of craftSections) {
      y = newPage(doc, pageNum, sec.title);
      toc.push({ title: sec.title, page: pageNum.value, level: 1 });
      if (sec.id === 'craft-diagnosis') {
        y = renderSectionTitle(doc, y, sec.title, sec.subtitle);
        y = renderDiagnosisOverview(doc, y, ['Dialogue', 'Theme', 'World & Logic', 'Emotional Arc'], data.categoryScores || {}, pageNum, sec.title);
        y = renderAgentNarrative(doc, y, SECTION_AGENT_MAP[sec.id] || [], data.agentContent, pageNum, sec.title);
      } else {
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    }

    // Scene Analysis (data-table approximation of heatmap/timeline)
    if (data.scenes && data.scenes.length > 0) {
      console.log('[PDF] Rendering Scene Analysis');
      y = newPage(doc, pageNum, 'Scene Analysis');
      toc.push({ title: 'Scene Analysis', page: pageNum.value, level: 1 });
      y = renderSectionTitle(doc, y, 'Scene Analysis', 'Scene-level metrics, pacing, and complexity');

      // Pacing summary
      const scenes = data.scenes;
      const totalScenes = scenes.length;
      const scenesWithPages = scenes.filter(s => s.pageStart != null && s.pageEnd != null);
      const avgLength = scenesWithPages.length > 0
        ? scenesWithPages.reduce((sum, s) => sum + ((s.pageEnd || 0) - (s.pageStart || 0) + 1), 0) / scenesWithPages.length
        : 0;

      doc.setFontSize(FONTS.h3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text('Pacing Summary', MARGINS.left, y);
      y += 7;
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textLight);
      doc.text(`Total Scenes: ${totalScenes}`, MARGINS.left + 3, y);
      y += 5;
      if (avgLength > 0) {
        doc.text(`Avg Scene Length: ${avgLength.toFixed(1)} pages`, MARGINS.left + 3, y);
        y += 5;
      }
      y += 5;

      // Scene analysis table
      const sceneTableData = scenes.map(s => [
        `${s.sceneNumber ?? '—'}`,
        s.heading || '—',
        s.emotionalTone || '—',
        s.intExt || '—',
        s.pageStart ? `p.${s.pageStart}${s.pageEnd && s.pageEnd !== s.pageStart ? `-${s.pageEnd}` : ''}` : '—',
      ]);

      let saFirstPage = true;
      const saResult = autoTable(doc, {
        head: [['#', 'Heading', 'Emotional Tone', 'Int/Ext', 'Pages']],
        body: sceneTableData,
        startY: y,
        margin: { left: MARGINS.left, right: MARGINS.right },
        headStyles: {
          fillColor: COLORS.tableHeader,
          textColor: COLORS.white,
          fontSize: FONTS.small,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: FONTS.tiny,
          textColor: COLORS.text,
        },
        alternateRowStyles: {
          fillColor: COLORS.tableAlt,
        },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 55 },
          4: { cellWidth: 20 },
        },
        didDrawPage: () => {
          if (!saFirstPage) {
            addRunningHeader(doc, 'Scene Analysis', { value: doc.getNumberOfPages() });
            addRunningFooter(doc);
          }
          saFirstPage = false;
        },
      });
      pageNum.value = doc.getNumberOfPages();
      resetFontStyle(doc);

      y = (saResult as any)?.finalY ? (saResult as any).finalY + 8 : y + 20;

      // Agent narrative for scene analysis
      y += 8;
      y = renderAgentNarrative(doc, y, SECTION_AGENT_MAP['scene-analysis'] || [], data.agentContent, pageNum, 'Scene Analysis');
    }

    // === PART IV: FORMAT (conditional) ===
    if (isComicType(scriptType)) {
      console.log('[PDF] Rendering Comic Format');
      renderPartDivider(doc, pageNum, 'PART IV', 'COMIC FORMAT', toc);

      const comicSections: SectionDef[] = [
        { id: 'format', title: 'Format Diagnosis', subtitle: 'Comic-specific format analysis' },
        { id: 'format-panel-flow', title: 'Panel Flow', subtitle: 'Panel composition, layout rhythm, and visual pacing' },
        { id: 'format-lettering', title: 'Lettering & Dialogue', subtitle: 'Balloon placement, SFX, and dialogue density' },
        { id: 'format-page-turns', title: 'Page Turns', subtitle: 'Cliffhangers, reveals, and page-turn drama' },
        { id: 'format-art-synergy', title: 'Art-Script Synergy', subtitle: 'Writer-artist collaboration cues and visual scripting' },
      ];

      for (const sec of comicSections) {
        y = newPage(doc, pageNum, sec.title);
        toc.push({ title: sec.title, page: pageNum.value, level: 1 });
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    } else if (isWebSeriesType(scriptType)) {
      console.log('[PDF] Rendering Web Series Format');
      renderPartDivider(doc, pageNum, 'PART IV', 'WEB SERIES FORMAT', toc);

      const webSeriesSections: SectionDef[] = [
        { id: 'format', title: 'Format Diagnosis', subtitle: 'Web series format overview' },
        { id: 'format-web-series', title: 'Web Series Deep Dive', subtitle: 'Episode length tiers, digital-first optimization' },
        { id: 'format-retention', title: 'Retention Curves', subtitle: 'Retention design, pacing, and engagement metrics' },
        { id: 'format-hooks', title: 'Hook Efficiency', subtitle: 'Opening hooks, shareability, and attention capture' },
      ];

      for (const sec of webSeriesSections) {
        y = newPage(doc, pageNum, sec.title);
        toc.push({ title: sec.title, page: pageNum.value, level: 1 });
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    } else if (scriptType === 'micro_drama') {
      console.log('[PDF] Rendering Micro Drama Format');
      renderPartDivider(doc, pageNum, 'PART IV', 'MICRO DRAMA FORMAT', toc);

      const microDramaSections: SectionDef[] = [
        { id: 'format', title: 'Format Diagnosis', subtitle: 'Micro drama format overview' },
        { id: 'format-micro-drama', title: 'Micro Drama Deep Dive', subtitle: 'Hook velocity, cliff density, and scroll-stop optimization' },
      ];

      for (const sec of microDramaSections) {
        y = newPage(doc, pageNum, sec.title);
        toc.push({ title: sec.title, page: pageNum.value, level: 1 });
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    } else if (scriptType === 'pilot' || scriptType === 'episode') {
      console.log('[PDF] Rendering Format Analysis');
      renderPartDivider(doc, pageNum, 'PART IV', 'FORMAT ANALYSIS', toc);

      const formatSections: SectionDef[] = [
        { id: 'format', title: 'Format Diagnosis', subtitle: 'Structure and pacing for pilot/episode format' },
      ];

      for (const sec of formatSections) {
        y = newPage(doc, pageNum, sec.title);
        toc.push({ title: sec.title, page: pageNum.value, level: 1 });
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    }

    // Series Bible (conditional — episodic formats)
    const episodicTypes: ScriptType[] = ['web_series', 'pilot', 'episode', 'micro_drama'];
    if (episodicTypes.includes(scriptType)) {
      console.log('[PDF] Rendering Series Bible');
      y = newPage(doc, pageNum, 'Series Bible');
      toc.push({ title: 'Series Bible', page: pageNum.value, level: 1 });
      y = renderSectionTitle(doc, y, 'Series Bible', 'Narrative rules, world logic, and series engine');

      // Render agent narrative content from SeriesBibleAgent
      const bibleAgentKeys = SECTION_AGENT_MAP['bible'] || [];
      y = renderAgentNarrative(doc, y, bibleAgentKeys, data.agentContent, pageNum, 'Series Bible');
      y = renderParameterCards(doc, y, 'bible', data.parameterScores || [], pageNum, 'Series Bible');
    }

    // === PART V: PRODUCTION & MARKET ===
    console.log('[PDF] Rendering Production & Market');
    const hasFormatPart = isComicType(scriptType) || isWebSeriesType(scriptType) || scriptType === 'micro_drama' || scriptType === 'pilot' || scriptType === 'episode';
    const marketPartNum = hasFormatPart ? 'PART V' : 'PART IV';
    renderPartDivider(doc, pageNum, marketPartNum, 'PRODUCTION & MARKET', toc);

    const marketSections: SectionDef[] = [
      { id: 'commercial-diagnosis', title: 'Commercial Diagnosis', subtitle: 'Market readiness and production viability overview' },
      { id: 'commercial-market', title: 'Market Analysis', subtitle: 'Marketability, audience fit, and comparables' },
      { id: 'commercial-production', title: 'Production Viability', subtitle: 'Budget tier, complexity, and talent requirements' },
    ];

    for (const sec of marketSections) {
      y = newPage(doc, pageNum, sec.title);
      toc.push({ title: sec.title, page: pageNum.value, level: 1 });
      if (sec.id === 'commercial-diagnosis') {
        y = renderSectionTitle(doc, y, sec.title, sec.subtitle);
        y = renderDiagnosisOverview(doc, y, ['Market', 'Execution'], data.categoryScores || {}, pageNum, sec.title);
        y = renderAgentNarrative(doc, y, SECTION_AGENT_MAP[sec.id] || [], data.agentContent, pageNum, sec.title);
      } else {
        y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
      }
    }

    // === PART VI: RECOMMENDATIONS ===
    console.log('[PDF] Rendering Recommendations');
    const recPartNum = hasFormatPart ? 'PART VI' : 'PART V';
    renderPartDivider(doc, pageNum, recPartNum, 'RECOMMENDATIONS', toc);

    y = newPage(doc, pageNum, 'Development Priorities');
    toc.push({ title: 'Development Priorities', page: pageNum.value, level: 1 });
    y = renderSection(doc, y, 'development', 'Development Priorities', 'Ranked action items for script improvement', data, pageNum);

    // === APPENDICES ===
    console.log('[PDF] Rendering Appendices');
    const appPartNum = hasFormatPart ? 'PART VII' : 'PART VI';
    renderPartDivider(doc, pageNum, appPartNum, 'APPENDICES', toc);

    // Scorecard
    y = newPage(doc, pageNum, 'Complete Scorecard');
    toc.push({ title: 'Complete Scorecard', page: pageNum.value, level: 1 });
    y = renderCompleteScorecardAppendix(doc, y, data, pageNum);

    // Characters
    if (data.characters && data.characters.length > 0) {
      y = newPage(doc, pageNum, 'Character Reference');
      toc.push({ title: 'Character Reference', page: pageNum.value, level: 1 });
      y = renderCharacterAppendix(doc, y, data, pageNum);
    }

    // Scenes
    if (data.scenes && data.scenes.length > 0) {
      y = newPage(doc, pageNum, 'Scene Index');
      toc.push({ title: 'Scene Index', page: pageNum.value, level: 1 });
      y = renderSceneAppendix(doc, y, data, pageNum);
    }

    // === Render TOC on page 2 (now that we know all page numbers) ===
    console.log('[PDF] Rendering Table of Contents');
    renderTocPage(doc, toc, pageNum);

    console.log('[PDF] Generation complete, total pages:', doc.getNumberOfPages());
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error('[PDF] Generation failed:', error);
    throw error;
  }
}

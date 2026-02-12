/**
 * Full Report PDF Generator — Book-style with TOC and internal links
 * Mirrors every section of the online analysis report
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  return String(item);
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
  'format': ['FormatDiagnosisAgent', 'ComicFormatAgent', 'WebSeriesFormatAgent', 'MicroDramaFormatAgent'],
  'format-panel-flow': ['PanelFlowAgent'],
  'format-lettering': ['LetteringAgent'],
  'format-page-turns': ['PageTurnsAgent'],
  'format-art-synergy': ['ArtSynergyAgent'],
  'format-web-series': ['WebSeriesFormatAgent'],
  'format-retention': ['StructureAgent', 'ConflictAgent'],
  'format-hooks': ['ConceptAgent'],
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

function addRunningHeader(doc: jsPDF, sectionName: string, pageNum: PageCounter) {
  const pw = getPageWidth(doc);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGINS.left, 15, pw - MARGINS.right, 15);
  doc.setFontSize(FONTS.tiny);
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
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    `Generated ${new Date().toLocaleDateString()} • USAF v3.0 Analysis Report`,
    pw / 2, ph - 10, { align: 'center' }
  );
}

function newPage(doc: jsPDF, pageNum: PageCounter, sectionName: string): number {
  doc.addPage();
  pageNum.value++;
  addRunningHeader(doc, sectionName, pageNum);
  addRunningFooter(doc);
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

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
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
  doc.setTextColor(...getScoreColor(score));
  doc.text(signal, pw / 2, scoreY + 35, { align: 'center' });

  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.textLight);
  doc.text(getReadinessLabel(score), pw / 2, scoreY + 45, { align: 'center' });

  // Metadata pills
  const meta = data.scriptMetadata;
  const pills: string[] = [];
  if (meta.genre) pills.push(meta.genre);
  if (meta.pageCount) pills.push(`${meta.pageCount} pages`);
  if (meta.characterCount) pills.push(`${meta.characterCount} characters`);
  if (meta.sceneCount) pills.push(`${meta.sceneCount} scenes`);
  
  if (pills.length > 0) {
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.textLight);
    doc.text(pills.join('  •  '), pw / 2, scoreY + 60, { align: 'center' });
  }

  // Lens
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.primaryLight);
  doc.text(`Lens: ${LENS_CONFIG[activeLens].label}`, pw / 2, ph - 30, { align: 'center' });
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pw / 2, ph - 22, { align: 'center' });

  return 1;
}

function renderPartDivider(doc: jsPDF, pageNum: PageCounter, partNumber: string, partTitle: string, toc: TocEntry[]): number {
  doc.addPage();
  pageNum.value++;
  const pw = getPageWidth(doc);
  const ph = getPageHeight(doc);

  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pw, ph, 'F');

  doc.setFontSize(FONTS.h2);
  doc.setTextColor(...COLORS.textLight);
  doc.text(partNumber, pw / 2, ph / 2 - 20, { align: 'center' });

  doc.setFontSize(FONTS.partTitle);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(partTitle, pw / 2, ph / 2, { align: 'center' });

  doc.setFont('helvetica', 'normal');

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
      doc.setFont('helvetica', 'normal');
    }

    // Deep Dive
    if (content.deepDive) {
      y = checkBreak(doc, y, 15, pageNum, sectionName);
      doc.setFontSize(FONTS.body);
      doc.setTextColor(...COLORS.text);
      const paragraphs = content.deepDive.split('\n').filter(p => p.trim());
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
    if (content.whatWorks && content.whatWorks.length > 0) {
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
    if (content.whatsBroken && content.whatsBroken.length > 0) {
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
        const lines = wrapText(doc, `x ${toDisplayString(item)}`, cw - 5);
        lines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 5; });
        y += 1;
      }
      y += 4;
    }

    // What's Underdeveloped
    if (content.whatsUnderdeveloped && content.whatsUnderdeveloped.length > 0) {
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
    if (content.keyQuotes && content.keyQuotes.length > 0) {
      y = checkBreak(doc, y, 15, pageNum, sectionName);
      doc.setFontSize(FONTS.h3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text('Key Quotes', MARGINS.left, y);
      y += 7;
      for (const q of content.keyQuotes) {
        y = checkBreak(doc, y, 14, pageNum, sectionName);
        doc.setFontSize(FONTS.small);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...COLORS.textLight);
        const qLines = wrapText(doc, `"${q.quote}"`, cw - 10);
        qLines.forEach(line => { doc.text(line, MARGINS.left + 5, y); y += 4.5; });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(FONTS.tiny);
        const ctx = q.page ? `${q.context} (p.${q.page})` : q.context;
        doc.text(`— ${ctx}`, MARGINS.left + 5, y);
        y += 6;
      }
      y += 3;
    }

    // Recommendations
    if (content.recommendations && content.recommendations.length > 0) {
      y = checkBreak(doc, y, 15, pageNum, sectionName);
      doc.setFontSize(FONTS.h3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text('Recommendations', MARGINS.left, y);
      y += 7;
      for (const rec of content.recommendations) {
        y = checkBreak(doc, y, 16, pageNum, sectionName);
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        const priorityTag = `[${rec.priority.toUpperCase()}/${rec.effort.toUpperCase()}]`;
        doc.text(`${priorityTag}  ${rec.title}`, MARGINS.left + 3, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textLight);
        const dLines = wrapText(doc, rec.description, cw - 8);
        dLines.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 4.5; });
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
      doc.text(`Protagonist: ${p.name}`, MARGINS.left, y);
      y += 7;
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'normal');
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
          const valLines = wrapText(doc, val, cw - labelW - 8);
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
      doc.text(`Antagonist: ${a.name}`, MARGINS.left, y);
      y += 7;
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'normal');
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
          const vl = wrapText(doc, val, cw - lw - 8);
          vl.forEach((line, i) => {
            doc.text(line, MARGINS.left + 3 + (i === 0 ? lw : 0), y);
            y += 5;
          });
        }
      }
      y += 4;
    }

    // Supporting Cast
    if (content.supportingCast && content.supportingCast.length > 0) {
      y = checkBreak(doc, y, 15, pageNum, sectionName);
      doc.setFontSize(FONTS.h3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text('Supporting Cast', MARGINS.left, y);
      y += 7;
      for (const c of content.supportingCast) {
        y = checkBreak(doc, y, 12, pageNum, sectionName);
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text(`${c.name} — ${c.role}`, MARGINS.left + 3, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textLight);
        const il = wrapText(doc, c.impact, cw - 8);
        il.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 4.5; });
        y += 3;
      }
      y += 4;
    }

    // Market-specific
    if (content.comparableTitles && content.comparableTitles.length > 0) {
      y = checkBreak(doc, y, 15, pageNum, sectionName);
      doc.setFontSize(FONTS.h3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text('Comparable Titles', MARGINS.left, y);
      y += 7;
      for (const ct of content.comparableTitles) {
        y = checkBreak(doc, y, 10, pageNum, sectionName);
        doc.setFontSize(FONTS.body);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text(ct.title, MARGINS.left + 3, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textLight);
        const rl = wrapText(doc, ct.relevance, cw - 8);
        rl.forEach(line => { doc.text(line, MARGINS.left + 3, y); y += 4.5; });
        y += 2;
      }
      y += 4;
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
      const tal = wrapText(doc, content.targetAudience, cw);
      tal.forEach(line => { y = checkBreak(doc, y, 5, pageNum, sectionName); doc.text(line, MARGINS.left, y); y += 5; });
      y += 4;
    }
  }

  return y;
}

function renderParameterCards(
  doc: jsPDF, y: number, sectionId: string,
  params: ParameterScoreData[],
  pageNum: PageCounter, sectionName: string
): number {
  const categories = SECTION_CATEGORY_MAP[sectionId];
  if (!categories) return y;

  const sectionParams = params.filter(p => categories.includes(p.category));
  if (sectionParams.length === 0) return y;

  const cw = getContentWidth(doc);

  y = checkBreak(doc, y, 15, pageNum, sectionName);
  doc.setFontSize(FONTS.h3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.secondary);
  doc.text('Parameter Scores', MARGINS.left, y);
  y += 8;

  for (const p of sectionParams) {
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
    doc.text(p.displayName, barX + 4, y + 3);

    // Score
    const scoreColor = getScoreColor(p.score);
    doc.setTextColor(...scoreColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${Math.round(p.score)}`, barX + barWidth - 4, y + 3, { align: 'right' });

    // Maturity & fix cost badges
    const badges: string[] = [];
    if (p.maturity) badges.push(p.maturity);
    if (p.fixCost) badges.push(`Fix: ${p.fixCost}`);
    if (badges.length > 0) {
      doc.setFontSize(FONTS.tiny);
      doc.setTextColor(...COLORS.textLight);
      doc.text(badges.join('  |  '), barX + 4, y + 10);
    }

    y += 20;

    // Rationale (compact)
    if (p.rationale) {
      doc.setFontSize(FONTS.small);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textLight);
      const rLines = wrapText(doc, p.rationale, cw - 8);
      const maxLines = Math.min(rLines.length, 3);
      for (let i = 0; i < maxLines; i++) {
        y = checkBreak(doc, y, 5, pageNum, sectionName);
        doc.text(rLines[i], MARGINS.left + 4, y);
        y += 4.5;
      }
      y += 3;
    }
  }

  return y;
}

function renderDiagnosisOverview(
  doc: jsPDF, y: number, categories: string[],
  categoryScores: Record<string, unknown>,
  pageNum: PageCounter, sectionName: string
): number {
  const cw = getContentWidth(doc);

  for (const cat of categories) {
    const raw = categoryScores[cat];
    if (raw === undefined) continue;
    const score = extractScore(raw);

    y = checkBreak(doc, y, 12, pageNum, sectionName);

    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.text(cat, MARGINS.left + 3, y);

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
  }

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
  doc.setFontSize(FONTS.body);
  doc.setTextColor(...COLORS.text);

  // Category scores overview
  if (data.categoryScores) {
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
  if (data.lensScores) {
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
  if (data.insights && data.insights.length > 0) {
    y = checkBreak(doc, y, 15, pageNum, sectionName);
    doc.setFontSize(FONTS.h3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Key Insights', MARGINS.left, y);
    y += 7;

    const topInsights = [...data.insights].sort((a, b) => b.priority - a.priority).slice(0, 5);
    for (const insight of topInsights) {
      y = checkBreak(doc, y, 14, pageNum, sectionName);
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text(insight.title, MARGINS.left + 3, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textLight);
      const dLines = wrapText(doc, insight.description, cw - 8);
      const maxL = Math.min(dLines.length, 2);
      for (let i = 0; i < maxL; i++) {
        doc.text(dLines[i], MARGINS.left + 3, y);
        y += 4.5;
      }
      y += 3;
    }
  }

  return y;
}

function renderSection(
  doc: jsPDF, y: number, sectionId: string, title: string, subtitle: string,
  data: ReportData, pageNum: PageCounter
): number {
  const sectionName = title;
  y = renderSectionTitle(doc, y, title, subtitle);

  const agentKeys = SECTION_AGENT_MAP[sectionId] || [];
  y = renderAgentNarrative(doc, y, agentKeys, data.agentContent, pageNum, sectionName);
  y = renderParameterCards(doc, y, sectionId, data.parameterScores || [], pageNum, sectionName);

  return y;
}

function renderCompleteScorecardAppendix(
  doc: jsPDF, y: number, data: ReportData, pageNum: PageCounter
): number {
  const sectionName = 'Complete Scorecard';
  y = renderSectionTitle(doc, y, 'Complete Scorecard', 'All parameters with scores');

  const params = [...(data.parameterScores || [])]
    .filter(p => !HIDDEN_CATEGORIES.has(p.category) && !INTERNAL_PARAMETER_NAMES.has(p.parameterName))
    .sort((a, b) => b.score - a.score);
  if (params.length === 0) return y;

  const tableData = params.map(p => [
    p.displayName,
    p.category,
    `${Math.round(p.score)}`,
    p.maturity || '—',
    p.fixCost || '—',
  ]);

  autoTable(doc, {
    head: [['Parameter', 'Category', 'Score', 'Maturity', 'Fix Cost']],
    body: tableData,
    startY: y,
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
    didDrawPage: () => {
      pageNum.value++;
      addRunningHeader(doc, sectionName, pageNum);
      addRunningFooter(doc);
    },
  });

  return (doc as any).lastAutoTable?.finalY || y + 20;
}

function renderCharacterAppendix(
  doc: jsPDF, y: number, data: ReportData, pageNum: PageCounter
): number {
  const sectionName = 'Character Reference';
  y = renderSectionTitle(doc, y, 'Character Reference', 'All characters with arcs');

  const chars = data.characters || [];
  if (chars.length === 0) return y;

  const tableData = chars.map(c => [
    c.name,
    `${c.dialogueCount || 0}`,
    `${c.sceneCount || 0}`,
    c.arcSummary || '—',
  ]);

  autoTable(doc, {
    head: [['Character', 'Dialogue', 'Scenes', 'Arc']],
    body: tableData,
    startY: y,
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
      3: { cellWidth: 80 },
    },
    didDrawPage: () => {
      pageNum.value++;
      addRunningHeader(doc, sectionName, pageNum);
      addRunningFooter(doc);
    },
  });

  return (doc as any).lastAutoTable?.finalY || y + 20;
}

function renderSceneAppendix(
  doc: jsPDF, y: number, data: ReportData, pageNum: PageCounter
): number {
  const sectionName = 'Scene Index';
  y = renderSectionTitle(doc, y, 'Scene Index', 'All scenes with locations and tones');

  const scenes = data.scenes || [];
  if (scenes.length === 0) return y;

  const tableData = scenes.map(s => [
    `${s.sceneNumber}`,
    s.heading,
    s.location || '—',
    s.emotionalTone || '—',
    s.pageStart ? `p.${s.pageStart}` : '—',
  ]);

  autoTable(doc, {
    head: [['#', 'Heading', 'Location', 'Tone', 'Page']],
    body: tableData,
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
      4: { cellWidth: 15 },
    },
    didDrawPage: () => {
      pageNum.value++;
      addRunningHeader(doc, sectionName, pageNum);
      addRunningFooter(doc);
    },
  });

  return (doc as any).lastAutoTable?.finalY || y + 20;
}

// ============= TOC =============

function renderTocPage(doc: jsPDF, toc: TocEntry[], pageNum: PageCounter): void {
  // We reserved page 2 for TOC. Go back and render it.
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

    if (entry.level === 0) {
      // Part divider
      y += 4;
      doc.setFontSize(FONTS.h3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(entry.title, MARGINS.left, y);
      doc.setFontSize(FONTS.small);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`${entry.page}`, MARGINS.left + cw, y, { align: 'right' });
      // Clickable link over the entire TOC line
      const lineH0 = FONTS.h3 * 0.4;
      doc.link(MARGINS.left, y - lineH0, cw, lineH0 + 2, { pageNumber: entry.page });
      y += 7;
    } else {
      doc.setFontSize(FONTS.body);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.text(entry.title, MARGINS.left + 8, y);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`${entry.page}`, MARGINS.left + cw, y, { align: 'right' });
      // Clickable link over the entire TOC line
      const lineH1 = FONTS.body * 0.4;
      doc.link(MARGINS.left + 8, y - lineH1, cw - 8, lineH1 + 2, { pageNumber: entry.page });
      y += 6;
    }
  }
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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageNum: PageCounter = { value: 1 };
  const toc: TocEntry[] = [];

  // === PAGE 1: Cover ===
  renderCoverPage(doc, data, title, activeLens, scriptType);

  // === PAGE 2: TOC placeholder (rendered last) ===
  doc.addPage();
  pageNum.value++;
  addRunningHeader(doc, 'Table of Contents', pageNum);
  addRunningFooter(doc);
  // Will be overwritten after all content is generated

  // === PAGE 3+: Executive Summary ===
  let y = newPage(doc, pageNum, 'Executive Summary');
  toc.push({ title: 'Executive Summary', page: pageNum.value, level: 1 });
  y = renderExecutiveSummary(doc, y, data, activeLens, pageNum);

  // === PART I: STORY ANALYSIS ===
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

  // === PART IV: FORMAT (conditional) ===
  if (isComicType(scriptType)) {
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
  } else if (isWebSeriesType(scriptType) || scriptType === 'micro_drama') {
    renderPartDivider(doc, pageNum, 'PART IV', 'FORMAT ANALYSIS', toc);

    y = newPage(doc, pageNum, 'Format Diagnosis');
    toc.push({ title: 'Format Diagnosis', page: pageNum.value, level: 1 });
    y = renderSection(doc, y, 'format', 'Format Diagnosis', 'Format-specific analysis', data, pageNum);
  }

  // === PART V: PRODUCTION & MARKET ===
  const marketPartNum = isComicType(scriptType) || isWebSeriesType(scriptType) || scriptType === 'micro_drama' ? 'PART V' : 'PART IV';
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
  const recPartNum = isComicType(scriptType) || isWebSeriesType(scriptType) || scriptType === 'micro_drama' ? 'PART VI' : 'PART V';
  renderPartDivider(doc, pageNum, recPartNum, 'RECOMMENDATIONS', toc);

  y = newPage(doc, pageNum, 'Development Priorities');
  toc.push({ title: 'Development Priorities', page: pageNum.value, level: 1 });
  y = renderSection(doc, y, 'development', 'Development Priorities', 'Ranked action items for script improvement', data, pageNum);

  // === APPENDICES ===
  const appPartNum = isComicType(scriptType) || isWebSeriesType(scriptType) || scriptType === 'micro_drama' ? 'PART VII' : 'PART VI';
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
  renderTocPage(doc, toc, pageNum);

  // Return as blob
  return doc.output('blob');
}

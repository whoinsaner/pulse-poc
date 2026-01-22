/**
 * PDF Generator for USAF Framework Documentation
 * Uses jsPDF with autotable for professional document generation
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FRAMEWORK_METADATA,
  EXECUTIVE_SUMMARY,
  ARCHITECTURE_OVERVIEW,
  SCORING_METHODOLOGY,
  getAgentDocumentation,
  getAgentsByCategory,
  getParametersByCategory,
  getStakeholderDocumentation,
  getScriptTypeDocumentation,
  getCategoryList,
} from './frameworkDocumentation';

// ============= CONSTANTS =============

const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Indigo 500
  secondary: [71, 85, 105] as [number, number, number], // Slate 500
  accent: [236, 72, 153] as [number, number, number], // Pink 500
  text: [15, 23, 42] as [number, number, number], // Slate 900
  textLight: [100, 116, 139] as [number, number, number], // Slate 500
  background: [248, 250, 252] as [number, number, number], // Slate 50
  white: [255, 255, 255] as [number, number, number],
  tableHeader: [99, 102, 241] as [number, number, number],
  tableAlt: [241, 245, 249] as [number, number, number], // Slate 100
};

const FONTS = {
  title: 24,
  h1: 18,
  h2: 14,
  h3: 12,
  body: 10,
  small: 9,
  tiny: 8,
};

const MARGINS = {
  left: 20,
  right: 20,
  top: 25,
  bottom: 25,
};

// ============= HELPER FUNCTIONS =============

function addHeader(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, 15, pageWidth - MARGINS.right, 15);
  
  // Header text
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text('USAF Framework Documentation v3.0', MARGINS.left, 12);
  doc.text(`Page ${pageNumber}`, pageWidth - MARGINS.right, 12, { align: 'right' });
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Footer line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, pageHeight - 15, pageWidth - MARGINS.right, pageHeight - 15);
  
  // Footer text
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Pulse v3 • Universal Script Analysis Framework', MARGINS.left, pageHeight - 10);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - MARGINS.right, pageHeight - 10, { align: 'right' });
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(FONTS.h1);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGINS.left, y);
  
  // Underline
  const textWidth = doc.getTextWidth(title);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.line(MARGINS.left, y + 2, MARGINS.left + textWidth, y + 2);
  
  return y + 12;
}

function addSubsectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(FONTS.h2);
  doc.setTextColor(...COLORS.secondary);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGINS.left, y);
  return y + 8;
}

function addParagraph(doc: jsPDF, text: string, y: number, maxWidth?: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = maxWidth || (pageWidth - MARGINS.left - MARGINS.right);
  
  doc.setFontSize(FONTS.body);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, MARGINS.left, y);
  
  return y + (lines.length * 5) + 4;
}

function checkPageBreak(doc: jsPDF, currentY: number, neededHeight: number, pageNumber: { value: number }): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (currentY + neededHeight > pageHeight - MARGINS.bottom) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber.value);
    addFooter(doc);
    return MARGINS.top + 10;
  }
  
  return currentY;
}

// ============= COVER PAGE =============

function addCoverPage(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Background gradient effect (simplified with rectangles)
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 100, 'F');
  
  // Title
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('PULSE v3', pageWidth / 2, 45, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Universal Script Analysis Framework', pageWidth / 2, 60, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Version ${FRAMEWORK_METADATA.version}`, pageWidth / 2, 80, { align: 'center' });
  
  // Stats boxes
  const boxY = 130;
  const boxWidth = 45;
  const boxHeight = 40;
  const gap = 10;
  const startX = (pageWidth - (boxWidth * 4 + gap * 3)) / 2;
  
  const stats = [
    { label: 'Agents', value: FRAMEWORK_METADATA.totalAgents.toString() },
    { label: 'Parameters', value: FRAMEWORK_METADATA.totalParameters.toString() },
    { label: 'Stakeholder Lenses', value: FRAMEWORK_METADATA.totalStakeholderLenses.toString() },
    { label: 'Script Types', value: FRAMEWORK_METADATA.supportedScriptTypes.toString() },
  ];
  
  stats.forEach((stat, index) => {
    const x = startX + (boxWidth + gap) * index;
    
    // Box background
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 3, 3, 'F');
    
    // Value
    doc.setFontSize(20);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, x + boxWidth / 2, boxY + 18, { align: 'center' });
    
    // Label
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + boxWidth / 2, boxY + 32, { align: 'center' });
  });
  
  // Description
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  const description = 'Comprehensive AI-powered script analysis for entertainment industry professionals. Objective evaluation across all narrative formats with role-specific stakeholder perspectives.';
  const descLines = doc.splitTextToSize(description, pageWidth - 60);
  doc.text(descLines, pageWidth / 2, 200, { align: 'center' });
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Generated: ' + new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }), pageWidth / 2, pageHeight - 30, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text('For internal use and authorized stakeholders', pageWidth / 2, pageHeight - 20, { align: 'center' });
}

// ============= TABLE OF CONTENTS =============

function addTableOfContents(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, 'Table of Contents', y);
  y += 10;
  
  const tocItems = [
    { title: '1. Executive Summary', page: 3 },
    { title: '2. Framework Architecture', page: 4 },
    { title: '3. Agent Catalog', page: 5 },
    { title: '   3.1 System Agents', page: 5 },
    { title: '   3.2 Core Analysis Agents', page: 6 },
    { title: '   3.3 Format-Specific Agents', page: 7 },
    { title: '   3.4 Meta Agents', page: 8 },
    { title: '4. Parameter Reference', page: 9 },
    { title: '5. Stakeholder Lens System', page: 15 },
    { title: '6. Scoring Methodology', page: 17 },
    { title: '7. Script Type Compatibility', page: 18 },
    { title: '8. Appendix: Quick Reference', page: 19 },
  ];
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  tocItems.forEach(item => {
    doc.setFontSize(FONTS.body);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', item.title.startsWith('   ') ? 'normal' : 'bold');
    doc.text(item.title, MARGINS.left + (item.title.startsWith('   ') ? 5 : 0), y);
    
    doc.setFont('helvetica', 'normal');
    doc.text(item.page.toString(), pageWidth - MARGINS.right, y, { align: 'right' });
    
    // Dotted line
    const textWidth = doc.getTextWidth(item.title);
    const pageNumWidth = doc.getTextWidth(item.page.toString());
    doc.setDrawColor(...COLORS.textLight);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(MARGINS.left + textWidth + 5, y, pageWidth - MARGINS.right - pageNumWidth - 5, y);
    doc.setLineDashPattern([], 0);
    
    y += 8;
  });
}

// ============= CONTENT SECTIONS =============

function addExecutiveSummary(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '1. Executive Summary', y);
  y += 5;
  
  // Clean up the summary text
  const summaryText = EXECUTIVE_SUMMARY.trim().replace(/\n\n/g, '\n').replace(/•/g, '•');
  y = addParagraph(doc, summaryText, y);
}

function addArchitecture(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '2. Framework Architecture', y);
  y += 5;
  
  // Pipeline diagram (text-based)
  const pipelineStages = [
    { name: 'STAGE 1: INTAKE', desc: 'Format normalization & validation' },
    { name: 'STAGE 2: CLASSIFICATION', desc: 'Script type detection & routing' },
    { name: 'STAGE 3: ANALYSIS', desc: 'Parallel agent evaluation' },
    { name: 'STAGE 4: SYNTHESIS', desc: 'Insight generation & lens weighting' },
  ];
  
  const boxWidth = 150;
  const boxHeight = 30;
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = (pageWidth - boxWidth) / 2;
  
  pipelineStages.forEach((stage, index) => {
    // Box
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(startX, y, boxWidth, boxHeight, 3, 3, 'F');
    
    // Text
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text(stage.name, startX + boxWidth / 2, y + 12, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONTS.tiny);
    doc.text(stage.desc, startX + boxWidth / 2, y + 22, { align: 'center' });
    
    y += boxHeight + 5;
    
    // Arrow
    if (index < pipelineStages.length - 1) {
      doc.setFillColor(...COLORS.secondary);
      doc.triangle(
        pageWidth / 2 - 5, y,
        pageWidth / 2 + 5, y,
        pageWidth / 2, y + 8,
        'F'
      );
      y += 12;
    }
  });
  
  y += 15;
  y = addParagraph(doc, ARCHITECTURE_OVERVIEW.trim(), y);
}

function addAgentCatalog(doc: jsPDF, pageNumber: { value: number }) {
  const categories = getAgentsByCategory();
  
  const categoryConfig = [
    { key: 'system', title: 'System Agents', color: COLORS.secondary },
    { key: 'core', title: 'Core Analysis Agents', color: COLORS.primary },
    { key: 'comic', title: 'Comic-Specific Agents', color: [99, 102, 241] as [number, number, number] },
    { key: 'webSeries', title: 'Web Series Agents', color: [236, 72, 153] as [number, number, number] },
    { key: 'interactive', title: 'Interactive Agents', color: [14, 165, 233] as [number, number, number] },
    { key: 'audio', title: 'Audio Agents', color: [139, 92, 246] as [number, number, number] },
    { key: 'meta', title: 'Meta Agents', color: [20, 184, 166] as [number, number, number] },
  ];
  
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '3. Agent Catalog', y);
  y += 5;
  
  doc.setFontSize(FONTS.body);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.text(`USAF employs ${FRAMEWORK_METADATA.totalAgents} specialized agents organized into functional categories.`, MARGINS.left, y);
  y += 15;
  
  categoryConfig.forEach((config) => {
    const agents = categories[config.key as keyof typeof categories];
    if (!agents || agents.length === 0) return;
    
    y = checkPageBreak(doc, y, 60, pageNumber);
    
    // Category header
    doc.setFillColor(...config.color);
    doc.roundedRect(MARGINS.left, y, 170, 8, 2, 2, 'F');
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text(`${config.title} (${agents.length})`, MARGINS.left + 5, y + 6);
    y += 15;
    
    // Agent table
    const tableData = agents.map(agent => [
      agent.name,
      agent.description.substring(0, 80) + (agent.description.length > 80 ? '...' : ''),
      agent.parameters.length.toString(),
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['Agent', 'Description', 'Params']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: config.color,
        fontSize: FONTS.tiny,
        fontStyle: 'bold',
      },
      bodyStyles: { 
        fontSize: FONTS.tiny,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 115 },
        2: { cellWidth: 15, halign: 'center' },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
  });
}

function addParameterReference(doc: jsPDF, pageNumber: { value: number }) {
  const paramsByCategory = getParametersByCategory();
  const categories = getCategoryList();
  
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '4. Parameter Reference', y);
  y += 5;
  
  doc.setFontSize(FONTS.body);
  doc.setTextColor(...COLORS.text);
  doc.text(`Complete reference for all ${FRAMEWORK_METADATA.totalParameters} evaluation parameters.`, MARGINS.left, y);
  y += 15;
  
  categories.forEach((category) => {
    const params = paramsByCategory[category];
    if (!params || params.length === 0) return;
    
    y = checkPageBreak(doc, y, 50, pageNumber);
    
    // Category header
    y = addSubsectionTitle(doc, `${category} (${params.length} parameters)`, y);
    y += 3;
    
    const tableData = params.map(param => [
      param.displayName,
      param.description.substring(0, 100) + (param.description.length > 100 ? '...' : ''),
      param.weight.toFixed(1),
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Description', 'Weight']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: COLORS.primary,
        fontSize: FONTS.tiny,
        fontStyle: 'bold',
      },
      bodyStyles: { 
        fontSize: FONTS.tiny,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 105 },
        2: { cellWidth: 15, halign: 'center' },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
  });
}

function addStakeholderLenses(doc: jsPDF, pageNumber: { value: number }) {
  const stakeholders = getStakeholderDocumentation();
  
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '5. Stakeholder Lens System', y);
  y += 5;
  
  const intro = 'USAF provides 9 specialized stakeholder perspectives that re-weight all parameters based on professional role priorities. Each lens emphasizes different aspects of the analysis.';
  y = addParagraph(doc, intro, y);
  y += 5;
  
  const tableData = stakeholders.map(s => [
    s.title,
    s.focus,
    s.keyMetrics.join(', '),
    s.priorityCategories.join(', '),
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [['Stakeholder', 'Focus', 'Key Metrics', 'Priority Categories']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: FONTS.tiny,
      fontStyle: 'bold',
    },
    bodyStyles: { 
      fontSize: FONTS.tiny,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  // Detailed stakeholder descriptions
  y = checkPageBreak(doc, y, 100, pageNumber);
  y = addSubsectionTitle(doc, 'Stakeholder Perspectives in Detail', y);
  y += 5;
  
  stakeholders.forEach(stakeholder => {
    y = checkPageBreak(doc, y, 30, pageNumber);
    
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(stakeholder.title, MARGINS.left, y);
    y += 5;
    
    doc.setFontSize(FONTS.tiny);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.text(`Focus: ${stakeholder.focus}`, MARGINS.left + 5, y);
    y += 10;
  });
}

function addScoringMethodology(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '6. Scoring Methodology', y);
  y += 5;
  
  y = addParagraph(doc, SCORING_METHODOLOGY.trim(), y);
  
  // Score ranges table
  y = checkPageBreak(doc, y, 60, pageNumber);
  y = addSubsectionTitle(doc, 'Score Range Reference', y);
  y += 5;
  
  const scoreRanges = [
    ['90-100', 'Production-Ready', 'Exceeds professional standards'],
    ['70-89', 'Strong', 'Meets standards, minor refinements needed'],
    ['50-69', 'Developing', 'Functional but requires revision'],
    ['30-49', 'Weak', 'Significant rework required'],
    ['0-29', 'Underdeveloped', 'Fundamental issues present'],
  ];
  
  autoTable(doc, {
    startY: y,
    head: [['Score Range', 'Maturity Level', 'Interpretation']],
    body: scoreRanges,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: FONTS.small,
      fontStyle: 'bold',
    },
    bodyStyles: { 
      fontSize: FONTS.small,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 95 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
}

function addScriptTypes(doc: jsPDF, pageNumber: { value: number }) {
  const scriptTypes = getScriptTypeDocumentation();
  
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '7. Script Type Compatibility', y);
  y += 5;
  
  const intro = `USAF supports ${FRAMEWORK_METADATA.supportedScriptTypes} distinct script types across multiple format categories. The framework automatically adjusts agent activation and parameter weighting based on script type.`;
  y = addParagraph(doc, intro, y);
  y += 5;
  
  const tableData = scriptTypes.map(st => [
    st.label,
    st.category,
    st.description,
    st.formatTags.slice(0, 3).join(', '),
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [['Type', 'Category', 'Description', 'Format Tags']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: FONTS.tiny,
      fontStyle: 'bold',
    },
    bodyStyles: { 
      fontSize: FONTS.tiny,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 25 },
      2: { cellWidth: 65 },
      3: { cellWidth: 40 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
}

function addQuickReference(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, '8. Appendix: Quick Reference', y);
  y += 10;
  
  // Quick stats
  const stats = [
    ['Total Agents', FRAMEWORK_METADATA.totalAgents.toString()],
    ['Total Parameters', FRAMEWORK_METADATA.totalParameters.toString()],
    ['Stakeholder Lenses', FRAMEWORK_METADATA.totalStakeholderLenses.toString()],
    ['Script Types Supported', FRAMEWORK_METADATA.supportedScriptTypes.toString()],
    ['Framework Version', FRAMEWORK_METADATA.version],
    ['Release Date', FRAMEWORK_METADATA.releaseDate],
  ];
  
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: stats,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: FONTS.small,
      fontStyle: 'bold',
    },
    bodyStyles: { 
      fontSize: FONTS.body,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, fontStyle: 'bold', halign: 'center' },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  y = (doc as any).lastAutoTable.finalY + 20;
  
  // Agent category summary
  y = addSubsectionTitle(doc, 'Agent Categories', y);
  y += 5;
  
  const agentCategories = getAgentsByCategory();
  const agentSummary = [
    ['System Agents', agentCategories.system.length.toString(), 'Intake, classification, routing'],
    ['Core Analysis', agentCategories.core.length.toString(), 'Concept, structure, character, theme...'],
    ['Comic-Specific', agentCategories.comic.length.toString(), 'Panel flow, lettering, art synergy'],
    ['Web Series', agentCategories.webSeries.length.toString(), 'Hooks, retention, algorithmic optimization'],
    ['Interactive', agentCategories.interactive.length.toString(), 'Branching, player agency'],
    ['Audio', agentCategories.audio.length.toString(), 'Audio-specific storytelling'],
    ['Meta Agents', agentCategories.meta.length.toString(), 'Synthesis, feedback, explainability'],
  ];
  
  autoTable(doc, {
    startY: y,
    head: [['Category', 'Count', 'Focus']],
    body: agentSummary,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.secondary,
      fontSize: FONTS.small,
      fontStyle: 'bold',
    },
    bodyStyles: { 
      fontSize: FONTS.small,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 105 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
}

// ============= MAIN GENERATOR FUNCTION =============

export function generateFrameworkPDF(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageNumber = { value: 0 };
  
  // Generate all sections
  addCoverPage(doc);
  pageNumber.value = 1;
  
  addTableOfContents(doc, pageNumber);
  addExecutiveSummary(doc, pageNumber);
  addArchitecture(doc, pageNumber);
  addAgentCatalog(doc, pageNumber);
  addParameterReference(doc, pageNumber);
  addStakeholderLenses(doc, pageNumber);
  addScoringMethodology(doc, pageNumber);
  addScriptTypes(doc, pageNumber);
  addQuickReference(doc, pageNumber);
  
  return doc;
}

export function downloadFrameworkPDF() {
  const doc = generateFrameworkPDF();
  const filename = `USAF-Framework-Documentation-v${FRAMEWORK_METADATA.version}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function getFrameworkPDFBlob(): Blob {
  const doc = generateFrameworkPDF();
  return doc.output('blob');
}

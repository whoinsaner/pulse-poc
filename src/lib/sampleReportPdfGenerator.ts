/**
 * Sample Report PDF Generator
 * Client-side PDF generation for sample reports using jsPDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';

// ============= CONSTANTS =============

const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Indigo 500
  secondary: [71, 85, 105] as [number, number, number], // Slate 500
  success: [34, 197, 94] as [number, number, number], // Green 500
  warning: [245, 158, 11] as [number, number, number], // Amber 500
  text: [15, 23, 42] as [number, number, number], // Slate 900
  textLight: [100, 116, 139] as [number, number, number], // Slate 500
  background: [248, 250, 252] as [number, number, number], // Slate 50
  white: [255, 255, 255] as [number, number, number],
  tableHeader: [99, 102, 241] as [number, number, number],
  tableAlt: [241, 245, 249] as [number, number, number],
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

function getReadinessLabel(score: number): string {
  if (score >= 80) return 'Production-Ready';
  if (score >= 65) return 'High-Potential';
  if (score >= 50) return 'Development Stage';
  return 'Needs Work';
}

function getDecisionSignal(score: number): string {
  if (score >= 75) return 'GO';
  if (score >= 50) return 'ITERATE';
  return 'HOLD';
}

function addHeader(doc: jsPDF, pageNumber: { value: number }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, 15, pageWidth - MARGINS.right, 15);
  
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text('USAF v3.0 Analysis Report', MARGINS.left, 12);
  doc.text(`Page ${pageNumber.value}`, pageWidth - MARGINS.right, 12, { align: 'right' });
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(...COLORS.tableAlt);
  doc.setLineWidth(0.3);
  doc.line(MARGINS.left, pageHeight - 15, pageWidth - MARGINS.right, pageHeight - 15);
  
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    `Generated ${new Date().toLocaleDateString()} • Universal Script Analysis Framework`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
}

function checkPageBreak(doc: jsPDF, yPos: number, neededSpace: number, pageNumber: { value: number }): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (yPos + neededSpace > pageHeight - MARGINS.bottom) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber);
    addFooter(doc);
    return MARGINS.top + 10;
  }
  return yPos;
}

// ============= MAIN GENERATOR =============

export function generateSampleReportPDF(
  reportData: ReportData,
  title: string,
  activeLens: StakeholderLens
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageNumber = { value: 1 };
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGINS.left - MARGINS.right;
  
  // ============= COVER PAGE =============
  
  // Background gradient effect
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  // Title
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('USAF Analysis Report', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(FONTS.h2);
  doc.setFont('helvetica', 'normal');
  doc.text('Universal Script Analysis Framework v3.0', pageWidth / 2, 45, { align: 'center' });
  
  // Script Title
  doc.setFontSize(FONTS.title);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 100, { align: 'center' });
  
  // Logline
  if (reportData.scriptMetadata?.logline) {
    doc.setFontSize(FONTS.body);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'italic');
    const loglineLines = doc.splitTextToSize(reportData.scriptMetadata.logline, contentWidth - 20);
    doc.text(loglineLines, pageWidth / 2, 112, { align: 'center' });
  }
  
  // Score Box
  const score = reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  const boxY = 135;
  
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(pageWidth / 2 - 40, boxY, 80, 50, 5, 5, 'F');
  
  doc.setFontSize(36);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(`${Math.round(score)}`, pageWidth / 2, boxY + 25, { align: 'center' });
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(`${getReadinessLabel(score)} • ${getDecisionSignal(score)}`, pageWidth / 2, boxY + 40, { align: 'center' });
  
  // Metadata Grid
  const metaY = 200;
  const metadata = reportData.scriptMetadata;
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.text);
  
  const metaItems = [
    ['Genre', metadata?.genre || 'N/A'],
    ['Type', metadata?.scriptType || 'N/A'],
    ['Pages', metadata?.pageCount?.toString() || 'N/A'],
    ['Lens', LENS_CONFIG[activeLens].label],
  ];
  
  const metaColWidth = contentWidth / 4;
  metaItems.forEach((item, i) => {
    const x = MARGINS.left + (metaColWidth * i) + (metaColWidth / 2);
    doc.setFont('helvetica', 'bold');
    doc.text(item[0], x, metaY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(item[1], x, metaY + 6, { align: 'center' });
  });
  
  // Lens Scores Table
  doc.setFontSize(FONTS.h3);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Stakeholder Lens Scores', MARGINS.left, 230);
  
  if (reportData.lensScores) {
    const lensData = Object.entries(reportData.lensScores).map(([lens, lensScore]) => [
      LENS_CONFIG[lens as StakeholderLens]?.label || lens,
      `${Math.round(lensScore as number)}/100`,
      getDecisionSignal(lensScore as number),
    ]);
    
    autoTable(doc, {
      startY: 235,
      head: [['Stakeholder', 'Score', 'Signal']],
      body: lensData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.tableHeader, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.small },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
  }
  
  addFooter(doc);
  
  // ============= CATEGORY SCORES PAGE =============
  
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber);
  addFooter(doc);
  
  let yPos = MARGINS.top + 10;
  
  doc.setFontSize(FONTS.h1);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Scores', MARGINS.left, yPos);
  yPos += 15;
  
  if (reportData.categoryScores) {
    const categoryData = Object.entries(reportData.categoryScores).map(([category, catScore]) => [
      category,
      `${Math.round(catScore as number)}/100`,
      getReadinessLabel(catScore as number),
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Score', 'Status']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.tableHeader, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.small },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // ============= INSIGHTS PAGE =============
  
  yPos = checkPageBreak(doc, yPos, 50, pageNumber);
  
  doc.setFontSize(FONTS.h1);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Insights', MARGINS.left, yPos);
  yPos += 10;
  
  if (reportData.insights && reportData.insights.length > 0) {
    const insightData = reportData.insights.map((insight) => [
      insight.category,
      insight.title,
      insight.description,
      insight.actionable ? 'Yes' : 'No',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Type', 'Title', 'Description', 'Actionable']],
      body: insightData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.tableHeader, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.tiny },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 35 },
        2: { cellWidth: 85 },
        3: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // ============= TOP PARAMETERS PAGE =============
  
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber);
  addFooter(doc);
  
  yPos = MARGINS.top + 10;
  
  doc.setFontSize(FONTS.h1);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('Parameter Analysis', MARGINS.left, yPos);
  yPos += 10;
  
  if (reportData.parameterScores && reportData.parameterScores.length > 0) {
    // Top parameters
    const sortedParams = [...reportData.parameterScores].sort((a, b) => b.score - a.score);
    
    doc.setFontSize(FONTS.h3);
    doc.setTextColor(...COLORS.text);
    doc.text('Top Performers', MARGINS.left, yPos);
    yPos += 5;
    
    const topParams = sortedParams.slice(0, 10).map((p) => [
      p.displayName,
      p.category,
      `${Math.round(p.score)}/100`,
      p.maturity || 'N/A',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Parameter', 'Category', 'Score', 'Maturity']],
      body: topParams,
      theme: 'striped',
      headStyles: { fillColor: COLORS.success, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.tiny },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = checkPageBreak(doc, yPos, 60, pageNumber);
    
    // Areas for improvement
    doc.setFontSize(FONTS.h3);
    doc.setTextColor(...COLORS.text);
    doc.text('Areas for Development', MARGINS.left, yPos);
    yPos += 5;
    
    const bottomParams = sortedParams.slice(-10).reverse().map((p) => [
      p.displayName,
      p.category,
      `${Math.round(p.score)}/100`,
      p.riskLevel || 'N/A',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Parameter', 'Category', 'Score', 'Risk']],
      body: bottomParams,
      theme: 'striped',
      headStyles: { fillColor: COLORS.warning, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.tiny },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // ============= CHARACTERS PAGE =============
  
  if (reportData.characters && reportData.characters.length > 0) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber);
    addFooter(doc);
    
    yPos = MARGINS.top + 10;
    
    doc.setFontSize(FONTS.h1);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Character Analysis', MARGINS.left, yPos);
    yPos += 10;
    
    const charData = reportData.characters.map((char) => [
      char.name,
      char.description || 'N/A',
      char.dialogueCount?.toString() || '0',
      char.sceneCount?.toString() || '0',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Character', 'Description', 'Dialogue', 'Scenes']],
      body: charData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.tableHeader, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.tiny },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 100 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Character arcs section
    yPos = checkPageBreak(doc, yPos, 60, pageNumber);
    
    doc.setFontSize(FONTS.h3);
    doc.setTextColor(...COLORS.text);
    doc.text('Character Arcs & Development', MARGINS.left, yPos);
    yPos += 5;
    
    const arcData = reportData.characters
      .filter(char => char.arcSummary)
      .slice(0, 8)
      .map((char) => [
        char.name,
        char.arcSummary || 'No arc summary available',
      ]);
    
    if (arcData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Character', 'Arc Summary']],
        body: arcData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary, fontSize: FONTS.small },
        bodyStyles: { fontSize: FONTS.tiny },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 130 },
        },
        margin: { left: MARGINS.left, right: MARGINS.right },
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    }
  }
  
  // ============= SCENES PAGE =============
  
  if (reportData.scenes && reportData.scenes.length > 0) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber);
    addFooter(doc);
    
    yPos = MARGINS.top + 10;
    
    doc.setFontSize(FONTS.h1);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Scene Breakdown', MARGINS.left, yPos);
    yPos += 5;
    
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`${reportData.scenes.length} total scenes analyzed`, MARGINS.left, yPos);
    yPos += 10;
    
    // Scene statistics
    const intScenes = reportData.scenes.filter(s => s.intExt === 'INT').length;
    const extScenes = reportData.scenes.filter(s => s.intExt === 'EXT').length;
    const uniqueLocations = new Set(reportData.scenes.map(s => s.location).filter(Boolean)).size;
    
    const sceneStats = [
      ['Total Scenes', reportData.scenes.length.toString()],
      ['Interior Scenes', intScenes.toString()],
      ['Exterior Scenes', extScenes.toString()],
      ['Unique Locations', uniqueLocations.toString()],
    ];
    
    autoTable(doc, {
      startY: yPos,
      body: sceneStats,
      theme: 'plain',
      bodyStyles: { fontSize: FONTS.small },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 30 },
      },
      margin: { left: MARGINS.left },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Scene list (first 30)
    doc.setFontSize(FONTS.h3);
    doc.setTextColor(...COLORS.text);
    doc.text('Scene Details', MARGINS.left, yPos);
    yPos += 5;
    
    const sceneData = reportData.scenes.slice(0, 30).map((scene) => [
      scene.sceneNumber.toString(),
      scene.heading || 'N/A',
      scene.location || 'N/A',
      scene.emotionalTone || 'N/A',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Heading', 'Location', 'Tone']],
      body: sceneData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.tableHeader, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.tiny },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 75 },
        2: { cellWidth: 45 },
        3: { cellWidth: 30 },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
    });
    
    if (reportData.scenes.length > 30) {
      yPos = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(FONTS.tiny);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`... and ${reportData.scenes.length - 30} more scenes`, MARGINS.left, yPos);
    }
  }
  
  // ============= THEMES & MOTIFS PAGE =============
  
  if (reportData.scenes && reportData.scenes.length > 0) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber);
    addFooter(doc);
    
    yPos = MARGINS.top + 10;
    
    doc.setFontSize(FONTS.h1);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Themes & Motifs Analysis', MARGINS.left, yPos);
    yPos += 10;
    
    // Extract themes from scenes and insights
    const themePatterns = [
      { pattern: /love|romance|heart|passion/i, name: 'Love & Romance' },
      { pattern: /power|control|dominate|authority/i, name: 'Power & Control' },
      { pattern: /family|parent|child|sibling|home/i, name: 'Family Bonds' },
      { pattern: /death|mortality|dying|grave/i, name: 'Mortality' },
      { pattern: /freedom|escape|liberation|cage/i, name: 'Freedom vs Captivity' },
      { pattern: /truth|lie|deceit|honest|secret/i, name: 'Truth & Deception' },
      { pattern: /revenge|vengeance|payback/i, name: 'Revenge' },
      { pattern: /redemption|forgive|atone|save/i, name: 'Redemption' },
    ];
    
    const detectedThemes: { name: string; occurrences: number; scenes: number[] }[] = [];
    
    themePatterns.forEach(({ pattern, name }) => {
      const matchingScenes: number[] = [];
      let occurrences = 0;
      
      reportData.scenes.forEach(scene => {
        const text = `${scene.heading || ''} ${scene.description || ''} ${scene.emotionalTone || ''}`;
        const matches = text.match(pattern);
        if (matches) {
          matchingScenes.push(scene.sceneNumber);
          occurrences += matches.length;
        }
      });
      
      if (occurrences > 0) {
        detectedThemes.push({ name, occurrences, scenes: matchingScenes });
      }
    });
    
    detectedThemes.sort((a, b) => b.occurrences - a.occurrences);
    
    if (detectedThemes.length > 0) {
      const themeData = detectedThemes.slice(0, 10).map(theme => [
        theme.name,
        theme.occurrences.toString(),
        theme.scenes.length.toString(),
        theme.scenes.length >= 5 ? 'Strong' : theme.scenes.length >= 3 ? 'Moderate' : 'Emerging',
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Theme/Motif', 'Occurrences', 'Scenes', 'Strength']],
        body: themeData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary, fontSize: FONTS.small },
        bodyStyles: { fontSize: FONTS.small },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' },
        },
        margin: { left: MARGINS.left, right: MARGINS.right },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(FONTS.body);
      doc.setTextColor(...COLORS.textLight);
      doc.text('No prominent themes detected from scene analysis.', MARGINS.left, yPos);
      yPos += 15;
    }
    
    // Thematic insights from the insights array
    const thematicInsights = reportData.insights?.filter(i => 
      i.category.toLowerCase().includes('theme') || 
      i.category.toLowerCase().includes('conflict') ||
      i.category.toLowerCase().includes('character arc')
    ) || [];
    
    if (thematicInsights.length > 0) {
      yPos = checkPageBreak(doc, yPos, 50, pageNumber);
      
      doc.setFontSize(FONTS.h3);
      doc.setTextColor(...COLORS.text);
      doc.text('Thematic Insights', MARGINS.left, yPos);
      yPos += 5;
      
      const insightData = thematicInsights.slice(0, 8).map(insight => [
        insight.category,
        insight.title,
        insight.description.substring(0, 150) + (insight.description.length > 150 ? '...' : ''),
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Insight', 'Description']],
        body: insightData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.secondary, fontSize: FONTS.small },
        bodyStyles: { fontSize: FONTS.tiny },
        margin: { left: MARGINS.left, right: MARGINS.right },
      });
    }
  }
  
  // ============= BUDGET ESTIMATION PAGE =============
  
  if (reportData.scenes && reportData.scenes.length > 0) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber);
    addFooter(doc);
    
    yPos = MARGINS.top + 10;
    
    doc.setFontSize(FONTS.h1);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Budget & Production Estimation', MARGINS.left, yPos);
    yPos += 10;
    
    // Calculate budget metrics
    const intScenes = reportData.scenes.filter(s => s.intExt === 'INT').length;
    const extScenes = reportData.scenes.filter(s => s.intExt === 'EXT').length;
    const uniqueLocations = new Set(reportData.scenes.map(s => s.location).filter(Boolean)).size;
    const pageCount = reportData.scriptMetadata?.pageCount || 100;
    const shootingDays = Math.ceil(pageCount / 5);
    const characterCount = reportData.characters?.length || 0;
    
    // Simple budget calculation (in thousands)
    const locationCost = (intScenes * 5) + (extScenes * 15);
    const castCost = Math.min(characterCount, 3) * 50 * shootingDays * 0.8;
    const crewCost = shootingDays * 35;
    const postCost = pageCount * 7;
    const totalBudget = locationCost + castCost + crewCost + postCost;
    
    const getBudgetTier = (total: number) => {
      if (total < 500) return 'Micro Budget';
      if (total < 2000) return 'Low Budget';
      if (total < 20000) return 'Medium Budget';
      if (total < 100000) return 'High Budget';
      return 'Blockbuster';
    };
    
    const formatCurrency = (amount: number) => {
      if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}M`;
      return `$${amount}K`;
    };
    
    // Budget summary box
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(MARGINS.left, yPos, contentWidth, 40, 5, 5, 'F');
    
    doc.setFontSize(FONTS.h1);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estimated Budget: ${formatCurrency(totalBudget)}`, MARGINS.left + 10, yPos + 18);
    
    doc.setFontSize(FONTS.body);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`${getBudgetTier(totalBudget)} • ${shootingDays} Shooting Days • ${uniqueLocations} Locations`, MARGINS.left + 10, yPos + 30);
    
    yPos += 50;
    
    // Budget breakdown
    const budgetData = [
      ['Locations & Sets', formatCurrency(locationCost), `${intScenes} INT / ${extScenes} EXT scenes`],
      ['Cast & Talent', formatCurrency(castCost), `${characterCount} characters`],
      ['Crew & Equipment', formatCurrency(crewCost), `${shootingDays} days`],
      ['Post Production', formatCurrency(postCost), `${pageCount} pages`],
      ['TOTAL', formatCurrency(totalBudget), ''],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Estimate', 'Details']],
      body: budgetData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.success, fontSize: FONTS.small },
      bodyStyles: { fontSize: FONTS.small },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 80 },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
      didParseCell: (data) => {
        // Bold the total row
        if (data.row.index === budgetData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Production considerations
    yPos = checkPageBreak(doc, yPos, 50, pageNumber);
    
    doc.setFontSize(FONTS.h3);
    doc.setTextColor(...COLORS.text);
    doc.text('Production Considerations', MARGINS.left, yPos);
    yPos += 8;
    
    const considerations = [];
    if (extScenes > reportData.scenes.length * 0.5) {
      considerations.push('High exterior scene ratio - weather dependent scheduling');
    }
    if (uniqueLocations > 15) {
      considerations.push('Many unique locations - significant logistics overhead');
    }
    if (characterCount > 20) {
      considerations.push('Large cast - coordination complexity');
    }
    if (shootingDays > 30) {
      considerations.push('Extended shoot - crew fatigue management needed');
    }
    if (considerations.length === 0) {
      considerations.push('Standard production complexity');
    }
    
    considerations.forEach((item, i) => {
      doc.setFontSize(FONTS.small);
      doc.setTextColor(...COLORS.text);
      doc.text(`• ${item}`, MARGINS.left + 5, yPos + (i * 6));
    });
  }
  
  // ============= RISK & MATURITY PAGE =============
  
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber);
  addFooter(doc);
  
  yPos = MARGINS.top + 10;
  
  doc.setFontSize(FONTS.h1);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Assessment & Maturity', MARGINS.left, yPos);
  yPos += 15;
  
  const riskScore = reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  
  // Maturity stage
  const getMaturityStage = (s: number) => {
    if (s >= 75) return { stage: 'Production Ready (7-10/10)', description: 'Script is polished and ready for packaging with minor adjustments.' };
    if (s >= 55) return { stage: 'Development Territory (4-6/10)', description: 'Script has enough strengths that a focused rewrite can elevate it dramatically.' };
    if (s >= 35) return { stage: 'Early Development (2-4/10)', description: 'Core concept exists but foundational elements need significant work.' };
    return { stage: 'Concept Stage (0-2/10)', description: 'Ideas present but requires substantial development in all areas.' };
  };
  
  const maturity = getMaturityStage(riskScore);
  
  doc.setFontSize(FONTS.h2);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Current Stage: ' + maturity.stage, MARGINS.left, yPos);
  yPos += 8;
  
  doc.setFontSize(FONTS.body);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  const maturityLines = doc.splitTextToSize(maturity.description, contentWidth);
  doc.text(maturityLines, MARGINS.left, yPos);
  yPos += maturityLines.length * 5 + 15;
  
  // Risk categories
  doc.setFontSize(FONTS.h3);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Categories', MARGINS.left, yPos);
  yPos += 8;
  
  const getRiskLevel = (categoryScore: number) => {
    if (categoryScore >= 70) return 'Low';
    if (categoryScore >= 50) return 'Medium';
    return 'High';
  };
  
  const categoryScores = reportData.categoryScores || {};
  const riskData = [
    ['Creative Risk', getRiskLevel(categoryScores['Character'] || categoryScores['Characters & Arcs'] || 60), 'Character depth, tonal consistency, motivation clarity'],
    ['Market Risk', getRiskLevel(categoryScores['Market'] || categoryScores['Marketability'] || 60), 'Audience targeting, competitive positioning, timing'],
    ['Production Risk', getRiskLevel(categoryScores['Execution'] || categoryScores['Production Value'] || 70), 'Budget requirements, location complexity, VFX needs'],
    ['Structural Risk', getRiskLevel(categoryScores['Structure'] || 65), 'Pacing, act balance, narrative coherence'],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Risk Category', 'Level', 'Description']],
    body: riskData,
    theme: 'striped',
    headStyles: { fillColor: COLORS.warning, fontSize: FONTS.small },
    bodyStyles: { fontSize: FONTS.small },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 100 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Development recommendations
  yPos = checkPageBreak(doc, yPos, 60, pageNumber);
  
  doc.setFontSize(FONTS.h3);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Development Recommendations', MARGINS.left, yPos);
  yPos += 8;
  
  const recommendations = [];
  if (riskScore < 50) {
    recommendations.push('Focus on strengthening core narrative structure before detailed polish');
  }
  if (categoryScores['Character'] && categoryScores['Character'] < 60) {
    recommendations.push('Deepen character motivations and arc clarity');
  }
  if (categoryScores['Structure'] && categoryScores['Structure'] < 60) {
    recommendations.push('Review act balance and pacing rhythm');
  }
  if (categoryScores['Dialogue'] && categoryScores['Dialogue'] < 60) {
    recommendations.push('Polish dialogue for distinctiveness and subtext');
  }
  if (recommendations.length === 0) {
    recommendations.push('Script is in strong position - focus on final polish and packaging');
  }
  
  recommendations.slice(0, 5).forEach((rec, i) => {
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.text);
    doc.text(`${i + 1}. ${rec}`, MARGINS.left, yPos + (i * 7));
  });
  
  // ============= NARRATIVE STRUCTURE PAGE =============
  
  if (reportData.narrativeGraph && reportData.narrativeGraph.nodes && reportData.narrativeGraph.nodes.length > 0) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber);
    addFooter(doc);
    
    yPos = MARGINS.top + 10;
    
    doc.setFontSize(FONTS.h1);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Narrative Structure', MARGINS.left, yPos);
    yPos += 10;
    
    const nodes = reportData.narrativeGraph.nodes;
    const edges = reportData.narrativeGraph.edges;
    
    // Node statistics
    const actNodes = nodes.filter(n => n.type === 'act');
    const sequenceNodes = nodes.filter(n => n.type === 'sequence');
    const beatNodes = nodes.filter(n => n.type === 'beat');
    const sceneNodes = nodes.filter(n => n.type === 'scene');
    
    const structureStats = [
      ['Acts', actNodes.length.toString()],
      ['Sequences', sequenceNodes.length.toString()],
      ['Major Beats', beatNodes.length.toString()],
      ['Scene Nodes', sceneNodes.length.toString()],
      ['Total Connections', edges.length.toString()],
    ];
    
    autoTable(doc, {
      startY: yPos,
      body: structureStats,
      theme: 'plain',
      bodyStyles: { fontSize: FONTS.small },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 30 },
      },
      margin: { left: MARGINS.left },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Key narrative beats
    if (beatNodes.length > 0) {
      doc.setFontSize(FONTS.h3);
      doc.setTextColor(...COLORS.text);
      doc.text('Key Narrative Beats', MARGINS.left, yPos);
      yPos += 5;
      
      const beatData = beatNodes.slice(0, 12).map(beat => [
        beat.label,
        (beat.metadata?.description as string) || 'Story beat',
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Beat', 'Description']],
        body: beatData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary, fontSize: FONTS.small },
        bodyStyles: { fontSize: FONTS.tiny },
        margin: { left: MARGINS.left, right: MARGINS.right },
      });
    }
  }
  
  return doc;
}

export function downloadSampleReportPDF(
  reportData: ReportData,
  title: string,
  activeLens: StakeholderLens
): void {
  const doc = generateSampleReportPDF(reportData, title, activeLens);
  const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_USAF_Report.pdf`;
  doc.save(filename);
}

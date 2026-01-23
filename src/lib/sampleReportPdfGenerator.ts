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

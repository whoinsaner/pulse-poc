/**
 * USAF Framework PDF Generator
 * Generates a professional PDF matching the USAF specification structure
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { USAF_METADATA, USAF_SECTIONS, DECISION_SIGNALS } from './pulseV2Documentation';

// ============= CONSTANTS =============

const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Indigo
  secondary: [71, 85, 105] as [number, number, number], // Slate
  accent: [16, 185, 129] as [number, number, number], // Emerald
  text: [15, 23, 42] as [number, number, number],
  textLight: [100, 116, 139] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  go: [16, 185, 129] as [number, number, number], // Green
  iterate: [245, 158, 11] as [number, number, number], // Amber
  hold: [239, 68, 68] as [number, number, number], // Red
};

const FONTS = {
  title: 28,
  h1: 16,
  h2: 13,
  h3: 11,
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
  
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, 15, pageWidth - MARGINS.right, 15);
  
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text('USAF • Universal Script Analysis Framework', MARGINS.left, 12);
  doc.text(`Page ${pageNumber}`, pageWidth - MARGINS.right, 12, { align: 'right' });
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, pageHeight - 15, pageWidth - MARGINS.right, pageHeight - 15);
  
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text('USAF Framework Documentation', MARGINS.left, pageHeight - 10);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - MARGINS.right, pageHeight - 10, { align: 'right' });
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(FONTS.h1);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGINS.left, y);
  
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
  return y + 7;
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
  
  // Header band
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 110, 'F');
  
  // Title
  doc.setFontSize(36);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('USAF v3.0', pageWidth / 2, 50, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(USAF_METADATA.fullName, pageWidth / 2, 68, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const taglineLines = doc.splitTextToSize(USAF_METADATA.tagline, pageWidth - 60);
  doc.text(taglineLines, pageWidth / 2, 85, { align: 'center' });
  
  // Decision Signal boxes
  const boxY = 140;
  const boxWidth = 50;
  const boxHeight = 35;
  const gap = 10;
  const startX = (pageWidth - (boxWidth * 3 + gap * 2)) / 2;
  
  const signals = [
    { label: 'GO', color: COLORS.go, range: '75-100' },
    { label: 'ITERATE', color: COLORS.iterate, range: '50-74' },
    { label: 'HOLD', color: COLORS.hold, range: '0-49' },
  ];
  
  signals.forEach((signal, index) => {
    const x = startX + (boxWidth + gap) * index;
    
    doc.setFillColor(...signal.color);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 3, 3, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text(signal.label, x + boxWidth / 2, boxY + 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(signal.range, x + boxWidth / 2, boxY + 27, { align: 'center' });
  });
  
  // Key stats
  const statsY = 200;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Framework Highlights', pageWidth / 2, statsY, { align: 'center' });
  
  const highlights = [
    '12 Core Parameters with weighted scoring',
    '5-Level Maturity Scale for contextualized assessment',
    '9 Stakeholder Lenses for role-specific perspectives',
    'Format-agnostic evaluation across all narrative types',
    'Actionable decision signals: Go / Iterate / Hold',
  ];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  highlights.forEach((item, index) => {
    doc.text('✓  ' + item, pageWidth / 2, statsY + 15 + (index * 8), { align: 'center' });
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Generated: ' + new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
  }), pageWidth / 2, pageHeight - 25, { align: 'center' });
}

// ============= TABLE OF CONTENTS =============

function addTableOfContents(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  y = addSectionTitle(doc, 'Table of Contents', y);
  y += 8;
  
  const sections = Object.values(USAF_SECTIONS);
  const pageWidth = doc.internal.pageSize.getWidth();
  
  sections.forEach((section, index) => {
    const sectionData = section as { number: number; title: string; subsections?: Array<{ number?: string; id?: string; title: string }> };
    const title = `${sectionData.number}. ${sectionData.title}`;
    const page = index + 3;
    
    doc.setFontSize(FONTS.body);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(title, MARGINS.left, y);
    
    doc.setFont('helvetica', 'normal');
    doc.text(page.toString(), pageWidth - MARGINS.right, y, { align: 'right' });
    
    y += 8;
    
    // Add subsections for philosophy and advantages
    if (sectionData.subsections) {
      sectionData.subsections.forEach((sub) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textLight);
        doc.text(`   ${sub.number || sub.id} ${sub.title}`, MARGINS.left + 10, y);
        y += 6;
      });
    }
  });
}

// ============= CONTENT SECTIONS =============

function addSection1(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  const section = USAF_SECTIONS.whatIsUSAF;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 5;
  y = addParagraph(doc, section.content, y);
}

function addSection2(doc: jsPDF, pageNumber: { value: number }) {
  let y = checkPageBreak(doc, (doc as any).lastAutoTable?.finalY || 100, 80, pageNumber);
  
  const section = USAF_SECTIONS.whyNeeded;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 5;
  y = addParagraph(doc, section.content, y);
}

function addSection3(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  const section = USAF_SECTIONS.philosophy;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 5;
  y = addParagraph(doc, section.intro, y);
  y += 5;
  
  section.subsections.forEach((sub) => {
    y = checkPageBreak(doc, y, 50, pageNumber);
    y = addSubsectionTitle(doc, `${sub.number} ${sub.title}`, y);
    y = addParagraph(doc, sub.content, y);
    y += 3;
  });
}

function addSection4(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  const section = USAF_SECTIONS.parameterModel;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 5;
  y = addParagraph(doc, section.intro, y);
  y += 5;
  
  // Parameters table
  const tableData = section.parameters.map(p => [p.name, p.description]);
  
  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Focus Areas']],
    body: tableData,
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
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 95 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  y = addParagraph(doc, section.footer, y);
}

function addSection5(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  const section = USAF_SECTIONS.maturityScale;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 5;
  y = addParagraph(doc, section.intro, y);
  y += 5;
  
  // Maturity levels table
  const tableData = section.levels.map(l => [l.range, l.label, l.description]);
  
  autoTable(doc, {
    startY: y,
    head: [['Score Range', 'Maturity Level', 'Description']],
    body: tableData,
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
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 80 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  y = addParagraph(doc, section.footer, y);
}

function addSection6(doc: jsPDF, pageNumber: { value: number }) {
  let y = checkPageBreak(doc, (doc as any).lastAutoTable?.finalY || 150, 100, pageNumber);
  
  const section = USAF_SECTIONS.outputs;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 5;
  y = addParagraph(doc, section.intro, y);
  y += 3;
  
  section.items.forEach(item => {
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('•  ' + item.name, MARGINS.left + 5, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textLight);
    doc.text('— ' + item.description, MARGINS.left + 80, y);
    y += 7;
  });
  
  y += 3;
  y = addParagraph(doc, section.footer, y);
}

function addSection7(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);
  
  let y = MARGINS.top + 10;
  const section = USAF_SECTIONS.advantages;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 5;
  
  section.subsections.forEach((sub) => {
    y = checkPageBreak(doc, y, 40, pageNumber);
    y = addSubsectionTitle(doc, `${sub.number} ${sub.title}`, y);
    y = addParagraph(doc, sub.content, y);
    y += 3;
  });
}

function addSection8_9_10(doc: jsPDF, pageNumber: { value: number }) {
  let y = checkPageBreak(doc, (doc as any).lastAutoTable?.finalY || 150, 120, pageNumber);
  
  // Section 8
  const section8 = USAF_SECTIONS.bestFit;
  y = addSectionTitle(doc, `${section8.number}. ${section8.title}`, y);
  y += 5;
  y = addParagraph(doc, section8.content, y);
  y += 10;
  
  // Section 9
  y = checkPageBreak(doc, y, 60, pageNumber);
  const section9 = USAF_SECTIONS.whatIsNot;
  y = addSectionTitle(doc, `${section9.number}. ${section9.title}`, y);
  y += 5;
  y = addParagraph(doc, section9.content, y);
  y += 10;
  
  // Section 10
  y = checkPageBreak(doc, y, 80, pageNumber);
  const section10 = USAF_SECTIONS.summary;
  y = addSectionTitle(doc, `${section10.number}. ${section10.title}`, y);
  y += 5;
  y = addParagraph(doc, section10.content, y);
}

// ============= MAIN EXPORT FUNCTION =============

export function downloadPulseV2PDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageNumber = { value: 1 };

  // Generate all sections
  addCoverPage(doc);
  addTableOfContents(doc, pageNumber);
  addSection1(doc, pageNumber);
  addSection2(doc, pageNumber);
  addSection3(doc, pageNumber);
  addSection4(doc, pageNumber);
  addSection5(doc, pageNumber);
  addSection6(doc, pageNumber);
  addSection7(doc, pageNumber);
  addSection8_9_10(doc, pageNumber);

  // Download
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`USAF-Framework-Documentation-${dateStr}.pdf`);
}

// Backward compatibility alias
export const downloadUSAFPDF = downloadPulseV2PDF;

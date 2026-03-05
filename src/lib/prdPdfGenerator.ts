/**
 * Pulse v3 — Product Requirements Document PDF Generator
 * Generates a professional PRD with all product features described in business language.
 * No references to code files, functions, or implementation details.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============= CONSTANTS =============

const COLORS = {
  primary: [99, 102, 241] as [number, number, number],
  secondary: [71, 85, 105] as [number, number, number],
  accent: [16, 185, 129] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textLight: [100, 116, 139] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  go: [16, 185, 129] as [number, number, number],
  iterate: [245, 158, 11] as [number, number, number],
  hold: [239, 68, 68] as [number, number, number],
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

// ============= PRD CONTENT =============

const PRD_METADATA = {
  title: 'Pulse v3',
  subtitle: 'Product Requirements Document',
  version: '3.0',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
};

const PRD_SECTIONS = {
  productOverview: {
    number: 1,
    title: 'Product Overview',
    content: `Pulse is a stakeholder-adaptive AI script intelligence platform designed for entertainment industry professionals. It ingests screenplays, comic scripts, web series treatments, and other narrative formats, then delivers comprehensive analytical reports tailored to each stakeholder's decision-making priorities.`,
    subsections: [
      {
        title: 'Vision',
        content: 'Pulse transforms subjective script evaluation into structured, data-driven intelligence. By combining multi-agent AI analysis with stakeholder-specific perspectives, Pulse enables faster, more confident creative and business decisions across the entertainment value chain.',
      },
      {
        title: 'Target Users',
        content: 'Studio executives evaluating acquisition or greenlighting decisions. Producers assessing production feasibility and budget alignment. Directors analyzing visual storytelling potential. Writers seeking structured developmental feedback. Financiers and investors quantifying creative risk. OTT platform content strategists evaluating catalog fit.',
      },
      {
        title: 'Value Proposition',
        content: 'Pulse reduces script evaluation time from days to minutes while providing deeper, more consistent analysis than traditional coverage. Every report adapts its language, scoring weights, and recommendations to the specific stakeholder reviewing it — a studio executive sees ROI projections while a director sees visual storytelling opportunities in the same underlying analysis.',
      },
    ],
  },

  scriptIngestion: {
    number: 2,
    title: 'Script Ingestion & Parsing',
    content: 'Pulse accepts scripts in multiple industry-standard formats and extracts structured data through a streaming parsing pipeline.',
    subsections: [
      {
        title: 'Supported Input Formats',
        content: 'PDF (industry standard screenplay format), Final Draft (FDX), Fountain (plain-text markup), Highland, Microsoft Word (DOCX), and plain text (TXT). The system auto-detects format on upload and normalizes content into a canonical internal representation.',
      },
      {
        title: 'Streaming Extraction',
        content: 'Scripts are processed through a real-time streaming pipeline that progressively extracts scenes, characters, and dialogue as the document is parsed. Users see live progress updates during extraction, with the system identifying scene headings, character names, dialogue blocks, action lines, parentheticals, and transitions.',
      },
      {
        title: 'Extracted Data Layers',
        content: 'Scene-level data includes scene headings, interior/exterior designation, location, time of day, page ranges, and emotional tone. Character-level data captures name, description, dialogue count, scene appearances, relationship mappings, and arc summaries. Line-level data preserves every individual line with its type classification (dialogue, action, parenthetical, transition) and page number.',
      },
      {
        title: 'Script Type Classification',
        content: 'An AI classifier automatically determines the script type — Feature Film, Television Pilot, Episode, Short Film, Documentary, Comic Book, Web Series, Micro Drama, Stage Play, Audio Drama, Podcast Fiction, or Game Narrative — and activates the appropriate specialist analysis agents.',
      },
    ],
  },

  analysisEngine: {
    number: 3,
    title: 'Multi-Agent Analysis Engine',
    content: 'Pulse employs a multi-agent AI architecture where specialized agents evaluate different dimensions of the script in parallel.',
    subsections: [
      {
        title: '10 Core Analysis Agents',
        content: 'Concept & Hook Agent — evaluates premise originality, logline strength, and market positioning. Structure Agent — analyzes three-act architecture, pacing, and narrative momentum. Character Agent — assesses protagonist depth, arc completion, and ensemble dynamics. Dialogue Agent — evaluates voice distinctiveness, subtext density, and expository efficiency. Theme Agent — identifies thematic coherence, symbolic layering, and moral complexity. Emotional Impact Agent — measures audience engagement trajectory and cathartic payoff. Visual Storytelling Agent — analyzes cinematic potential, visual metaphors, and show-don\'t-tell ratio. Market Viability Agent — assesses commercial positioning, audience targeting, and competitive landscape. Production Feasibility Agent — evaluates budget implications, location requirements, and practical constraints. Innovation Agent — identifies creative originality, genre subversion, and trend alignment.',
      },
      {
        title: '6 Format-Specialist Agents',
        content: 'Comic Art Synergy Agent — evaluates panel composition, visual pacing, and artist-writer collaboration potential. Comic Panel Flow Agent — analyzes page-turn reveals, panel transitions, and reading rhythm. Web Series Retention Agent — assesses episode hooks, binge triggers, and platform-specific engagement patterns. Web Series Platform Agent — evaluates social sharing potential, comment-driving moments, and algorithm compatibility. Micro Drama Compression Agent — analyzes story economy, emotional density per minute, and vertical-format optimization. Lettering & Sound Design Agent — evaluates sound effect integration, caption strategy, and typographic storytelling.',
      },
      {
        title: '145+ Evaluation Parameters',
        content: 'Each agent evaluates multiple parameters within its domain. Parameters are scored on a 0–100 scale with associated confidence levels, supporting evidence, and written rationale. Scores map to three decision signals: GO (75–100) indicates the script excels in this dimension, ITERATE (50–74) indicates potential that needs development, and HOLD (0–49) indicates significant concerns requiring attention.',
      },
      {
        title: 'Maturity Assessment',
        content: 'Beyond quality scoring, each parameter receives a maturity classification: Draft (below 40), Developing (40–65), Polished (65–80), or Production-Ready (80+). This helps stakeholders understand not just how good something is, but how much work remains to bring it to the next level.',
      },
    ],
  },

  stakeholderLens: {
    number: 4,
    title: 'Stakeholder Lens System',
    content: 'The Stakeholder Lens System is Pulse\'s signature differentiator. It dynamically re-weights analysis scores and adapts report presentation based on who is reading the report.',
    subsections: [
      {
        title: '9 Stakeholder Lenses',
        content: 'Studio Executive — prioritizes commercial viability, franchise potential, and brand alignment. Producer — emphasizes production feasibility, budget efficiency, and talent packaging. Director — focuses on visual storytelling, performance opportunities, and creative vision. Writer — highlights craft elements, structural integrity, and character depth. Actor — surfaces role complexity, arc progression, and performance showcase moments. Financier — quantifies investment risk, revenue projections, and comparable performance. OTT Platform — evaluates streaming engagement, binge potential, and content catalog fit. Theatrical — assesses theatrical release viability, spectacle value, and audience draw. Investor — focuses on financial return potential, market timing, and risk-adjusted opportunity.',
      },
      {
        title: 'Dynamic Score Re-Weighting',
        content: 'Each lens applies a custom weight matrix to the 145+ parameters. When a Studio Executive views a report, commercial and market parameters carry 2–3× their base weight, while craft-level details are de-emphasized. When a Writer views the same report, structural and character parameters are amplified. The weighted score reflects what matters most to each stakeholder\'s decision.',
      },
      {
        title: 'Adaptive Report Navigation',
        content: 'Reports restructure their section ordering and prominence based on the active lens. A Financier sees budget estimates and market comparables first; a Director sees visual storytelling analysis and performance opportunities first. The vocabulary and framing of insights also adapts — the same underlying finding might be presented as a "budget risk" to a Producer or a "creative opportunity" to a Director.',
      },
      {
        title: 'Stakeholder-Specific Reports',
        content: 'Full stakeholder-specific reports can be generated on demand, providing a complete document tailored to a single lens. These include an adapted executive summary, re-weighted scores, filtered insights prioritized by relevance, and recommendations framed in role-appropriate language.',
      },
    ],
  },

  reportSystem: {
    number: 5,
    title: 'Report System',
    content: 'Pulse generates comprehensive, multi-section analytical reports that combine quantitative scoring with qualitative narrative.',
    subsections: [
      {
        title: 'Executive Summary',
        content: 'Every report opens with a concise executive summary including the overall verdict (GO / ITERATE / HOLD), a narrative assessment, key strengths and weaknesses, and priority recommendations. The summary adapts its language and emphasis based on the active stakeholder lens.',
      },
      {
        title: 'Parameter Breakdowns',
        content: 'Detailed scoring cards for each of the 145+ parameters, organized by category. Each card displays the numeric score, maturity level, confidence indicator, written rationale, and supporting evidence extracted from the script. Parameters are grouped into categories such as Story & Concept, Character & Dialogue, Craft & Execution, Commercial & Market, and Format-Specific.',
      },
      {
        title: 'Character Analysis',
        content: 'Deep-dive character profiles including arc visualization, relationship network mapping, dialogue pattern analysis, and psychological assessment. Character sections cover the protagonist, antagonist, and supporting cast with metrics on scene presence, dialogue volume, and narrative function.',
      },
      {
        title: 'Narrative Timeline',
        content: 'Visual and analytical representation of the story\'s temporal structure, including pacing analysis, tension curve mapping, act break identification, and scene-by-scene emotional trajectory.',
      },
      {
        title: 'Format-Specific Sections',
        content: 'Comic scripts receive dedicated sections on art synergy, panel flow, page-turn dynamics, and lettering strategy. Web series scripts include retention analysis, platform optimization, and episode hook assessment. Micro drama scripts get compression analysis, vertical-format evaluation, and engagement density metrics.',
      },
      {
        title: 'Insights & Recommendations',
        content: 'AI-generated actionable insights categorized by priority and tagged with related parameters. Recommendations include specific, implementable suggestions for improvement with estimated impact on overall scores.',
      },
    ],
  },

  exportSharing: {
    number: 6,
    title: 'Export & Sharing',
    content: 'Reports can be exported and shared in multiple formats to support different workflow needs.',
    subsections: [
      {
        title: 'PDF Report',
        content: 'A comprehensive, book-style PDF document with a clickable table of contents, formatted agent narratives, parameter score cards, character profiles, and all visualizations rendered as print-ready graphics. The PDF adapts its content based on the script type, including format-specific sections for comics, web series, and micro dramas.',
      },
      {
        title: 'Executive Summary PDF',
        content: 'A condensed, shareable document containing the verdict, overall scores, key strengths and weaknesses, and top-priority recommendations — designed for time-constrained stakeholders who need the bottom line without full detail.',
      },
      {
        title: 'Raw JSON Export',
        content: 'Complete analysis data in structured JSON format for integration with external tools, data pipelines, or custom dashboards. Includes all parameter scores, evidence, insights, and metadata.',
      },
    ],
  },

  supportedFormats: {
    number: 7,
    title: 'Supported Script Formats',
    content: 'Pulse supports analysis across a wide range of narrative formats, each with tailored evaluation criteria.',
    formats: [
      { name: 'Feature Film', description: 'Full-length theatrical screenplays (90–180 pages). Standard three-act structure analysis with commercial viability assessment.' },
      { name: 'Television Pilot', description: 'Series premiere episodes establishing world, characters, and ongoing narrative hooks. Evaluated for series potential and network/platform fit.' },
      { name: 'Television Episode', description: 'Individual episodes within an established series. Analyzed for continuity, character development progression, and episodic story completeness.' },
      { name: 'Short Film', description: 'Compact narrative screenplays (5–40 pages). Emphasis on economy of storytelling and festival/awards potential.' },
      { name: 'Comic Book', description: 'Sequential art scripts with panel descriptions, dialogue, and visual direction. Specialist agents evaluate art-writer synergy, panel flow, and page-turn reveals.' },
      { name: 'Web Series', description: 'Digital-first episodic content optimized for streaming platforms. Analysis includes retention hooks, binge triggers, social sharing potential, and platform algorithm compatibility.' },
      { name: 'Micro Drama', description: 'Ultra-short vertical-format narratives (1–5 minutes per episode). Evaluated for story compression, emotional density, and mobile viewing optimization.' },
      { name: 'Stage Play', description: 'Theatrical scripts analyzed for dialogue-driven storytelling, staging requirements, and live performance potential.' },
      { name: 'Audio Drama', description: 'Audio-only narrative scripts evaluated for soundscape potential, voice performance opportunities, and auditory storytelling craft.' },
      { name: 'Podcast Fiction', description: 'Serialized audio fiction with emphasis on episodic structure, listener retention, and sonic world-building.' },
      { name: 'Game Narrative', description: 'Interactive narrative scripts assessed for branching story structures, player agency, and ludic-narrative integration.' },
      { name: 'Documentary', description: 'Non-fiction narrative treatments evaluated for story arc, subject access, and factual storytelling effectiveness.' },
    ],
  },

  teamOrganization: {
    number: 8,
    title: 'Team & Organization',
    content: 'Pulse supports collaborative workflows through multi-tenant organization management.',
    subsections: [
      {
        title: 'Multi-Tenant Organizations',
        content: 'Each team operates within an isolated organization with its own scripts, reports, and configurations. Users belong to one or more organizations and can switch between them. Organization data is strictly isolated — no cross-organization data access is permitted.',
      },
      {
        title: 'Invitation System',
        content: 'Organization administrators can invite team members via email. Invitations include a secure, time-limited token that grants access upon acceptance. Invited users are automatically assigned to the organization with the appropriate role.',
      },
      {
        title: 'Role-Based Access',
        content: 'Three roles govern permissions within each organization: Admin — full control over organization settings, team management, agent configuration, and all scripts and reports. Analyst — can upload scripts, trigger analyses, view reports, and export data. Viewer — read-only access to reports and scripts shared within the organization.',
      },
    ],
  },

  authSecurity: {
    number: 9,
    title: 'Authentication & Security',
    content: 'Pulse implements defense-in-depth security across all system layers.',
    subsections: [
      {
        title: 'Authentication',
        content: 'Email-based authentication with email verification required before account activation. Secure session management with automatic token refresh. Password reset via verified email.',
      },
      {
        title: 'Data Isolation',
        content: 'Row-level security ensures every database query is scoped to the authenticated user\'s organization. Users can only access scripts, reports, and configurations belonging to their current organization. All API endpoints validate both authentication and authorization before processing requests.',
      },
      {
        title: 'Input Validation',
        content: 'All user inputs undergo server-side validation including UUID format verification, enum value checking, string length enforcement, and injection prevention. Edge functions validate authentication tokens and verify user membership before processing any request.',
      },
    ],
  },

  qualityModes: {
    number: 10,
    title: 'Quality Modes',
    content: 'Pulse offers two analysis depth levels to balance speed and thoroughness.',
    subsections: [
      {
        title: 'Standard Analysis',
        content: 'Fast evaluation using efficient AI models optimized for speed. Delivers comprehensive scoring across all parameters with complete reports typically generated within minutes. Suitable for initial screening, high-volume evaluation, and time-sensitive decisions.',
      },
      {
        title: 'Deep Analysis',
        content: 'Thorough evaluation using premium AI models with extended processing. Provides more nuanced rationale, deeper evidence extraction, and higher-confidence scoring. Recommended for final-stage evaluation, high-stakes decisions, and scripts under serious consideration for acquisition or production.',
      },
    ],
  },

  dataModel: {
    number: 11,
    title: 'Data Model Overview',
    content: 'Pulse organizes data around the following high-level entities, designed for traceability from raw script through final report.',
    entities: [
      { name: 'Script', description: 'The uploaded narrative document with metadata including title, genre, format, type classification, page count, and logline. Scripts support versioning to track revisions over time.' },
      { name: 'Scene', description: 'An individual scene extracted from the script, capturing heading, location, interior/exterior designation, time of day, page range, and emotional tone.' },
      { name: 'Character', description: 'A character identified within the script, with tracked attributes including dialogue frequency, scene appearances, relationship connections, and narrative arc summary.' },
      { name: 'Line', description: 'A single line of content from the script, classified by type (dialogue, action, parenthetical, transition) and linked to its scene and speaking character where applicable.' },
      { name: 'Analysis Run', description: 'A single execution of the analysis pipeline against a script, tracking status (pending, processing, completed, failed), quality mode, active stakeholder lens, and per-agent progress.' },
      { name: 'Parameter Score', description: 'An individual evaluation score produced by an agent for a specific parameter within an analysis run. Includes the numeric score, confidence level, written rationale, and supporting evidence.' },
      { name: 'Report', description: 'The synthesized output of an analysis run, containing the executive summary, overall score, full analytical data, and lens-specific score variations.' },
      { name: 'Stakeholder Report', description: 'A lens-specific derivative of a base report, with adapted executive summary, re-weighted scores, filtered insights, and role-appropriate recommendations.' },
      { name: 'Insight', description: 'An AI-generated observation or recommendation derived from the analysis, categorized by type, tagged with related parameters, and prioritized by actionability and impact.' },
      { name: 'Organization', description: 'A team workspace providing data isolation, shared access to scripts and reports, and centralized configuration management.' },
    ],
  },

  agentConfiguration: {
    number: 12,
    title: 'Agent & Model Configuration',
    content: 'Pulse provides administrative control over the analysis engine\'s behavior.',
    subsections: [
      {
        title: 'Agent Management',
        content: 'Each analysis agent can be individually activated or deactivated. Agents have versioned system prompts with change tracking, allowing administrators to refine evaluation criteria over time. Agent configurations include parameter assignments, display names, and category groupings.',
      },
      {
        title: 'Model Configuration',
        content: 'AI model assignments are configurable per agent, allowing different agents to use different models based on their complexity requirements. Configuration includes model selection, temperature settings, retry limits, and retry delay parameters. Multiple named configurations can be created and one designated as default.',
      },
      {
        title: 'Parser Configuration',
        content: 'Script parsing behavior is tunable through configurable settings including scene heading patterns, character name detection rules, and stopword lists. Stopwords can be managed per category to improve parsing accuracy for different script conventions.',
      },
    ],
  },

  dashboardAnalytics: {
    number: 13,
    title: 'Dashboard & Analytics',
    content: 'Pulse provides operational visibility through a centralized dashboard.',
    subsections: [
      {
        title: 'Dashboard Overview',
        content: 'The main dashboard displays key metrics at a glance: total scripts uploaded, analyses completed, reports generated, and team members active. Recent activity feeds show the latest uploads and completed analyses.',
      },
      {
        title: 'Script Library',
        content: 'A searchable, filterable library of all uploaded scripts within the organization. Scripts display key metadata (title, type, genre, page count, upload date) and link directly to their associated reports and analysis history.',
      },
      {
        title: 'Analysis History',
        content: 'Complete audit trail of all analysis runs including status, duration, quality mode, initiating user, and any error details. Failed analyses can be retried with configurable retry parameters.',
      },
    ],
  },
};

// ============= HELPER FUNCTIONS =============

function addHeader(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, 15, pageWidth - MARGINS.right, 15);
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Pulse v3 • Product Requirements Document', MARGINS.left, 12);
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
  doc.text('Pulse v3 — Confidential', MARGINS.left, pageHeight - 10);
  doc.text(PRD_METADATA.date, pageWidth - MARGINS.right, pageHeight - 10, { align: 'right' });
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

function addSectionWithSubsections(
  doc: jsPDF,
  section: { number: number; title: string; content: string; subsections: Array<{ title: string; content: string }> },
  pageNumber: { value: number },
  startNewPage: boolean = true
) {
  if (startNewPage) {
    doc.addPage();
    pageNumber.value++;
    addHeader(doc, pageNumber.value);
    addFooter(doc);
  }

  let y = startNewPage ? MARGINS.top + 10 : checkPageBreak(doc, (doc as any).lastAutoTable?.finalY || 100, 80, pageNumber);
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 3;
  y = addParagraph(doc, section.content, y);
  y += 3;

  section.subsections.forEach((sub) => {
    y = checkPageBreak(doc, y, 40, pageNumber);
    y = addSubsectionTitle(doc, sub.title, y);
    y = addParagraph(doc, sub.content, y);
    y += 3;
  });
}

// ============= COVER PAGE =============

function addCoverPage(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header band
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 100, 'F');

  doc.setFontSize(36);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('Pulse v3', pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Product Requirements Document', pageWidth / 2, 65, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Version ${PRD_METADATA.version} — ${PRD_METADATA.date}`, pageWidth / 2, 82, { align: 'center' });

  // Key metrics
  const metricsY = 130;
  const metrics = [
    { label: 'Analysis Agents', value: '16' },
    { label: 'Evaluation Parameters', value: '145+' },
    { label: 'Stakeholder Lenses', value: '9' },
    { label: 'Script Formats', value: '12' },
  ];

  const metricWidth = 40;
  const metricGap = 8;
  const totalMetricWidth = metrics.length * metricWidth + (metrics.length - 1) * metricGap;
  const metricStartX = (pageWidth - totalMetricWidth) / 2;

  metrics.forEach((metric, i) => {
    const x = metricStartX + i * (metricWidth + metricGap);
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(x, metricsY, metricWidth, 35, 3, 3, 'F');

    doc.setFontSize(20);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, x + metricWidth / 2, metricsY + 16, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.label, x + metricWidth / 2, metricsY + 27, { align: 'center' });
  });

  // Decision signals
  const signalY = 195;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Decision Signals', pageWidth / 2, signalY, { align: 'center' });

  const signals = [
    { label: 'GO', color: COLORS.go, desc: 'Score 75–100' },
    { label: 'ITERATE', color: COLORS.iterate, desc: 'Score 50–74' },
    { label: 'HOLD', color: COLORS.hold, desc: 'Score 0–49' },
  ];
  const boxWidth = 50;
  const boxGap = 10;
  const boxStartX = (pageWidth - (boxWidth * 3 + boxGap * 2)) / 2;

  signals.forEach((signal, i) => {
    const x = boxStartX + i * (boxWidth + boxGap);
    doc.setFillColor(...signal.color);
    doc.roundedRect(x, signalY + 8, boxWidth, 28, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text(signal.label, x + boxWidth / 2, signalY + 22, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(signal.desc, x + boxWidth / 2, signalY + 31, { align: 'center' });
  });

  // Tagline
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'italic');
  doc.text('Stakeholder-Adaptive AI Script Intelligence', pageWidth / 2, pageHeight - 30, { align: 'center' });
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

  const tocEntries = [
    { num: 1, title: 'Product Overview' },
    { num: 2, title: 'Script Ingestion & Parsing' },
    { num: 3, title: 'Multi-Agent Analysis Engine' },
    { num: 4, title: 'Stakeholder Lens System' },
    { num: 5, title: 'Report System' },
    { num: 6, title: 'Export & Sharing' },
    { num: 7, title: 'Supported Script Formats' },
    { num: 8, title: 'Team & Organization' },
    { num: 9, title: 'Authentication & Security' },
    { num: 10, title: 'Quality Modes' },
    { num: 11, title: 'Data Model Overview' },
    { num: 12, title: 'Agent & Model Configuration' },
    { num: 13, title: 'Dashboard & Analytics' },
  ];

  tocEntries.forEach((entry) => {
    doc.setFontSize(FONTS.body);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(`${entry.num}. ${entry.title}`, MARGINS.left, y);
    y += 9;
  });
}

// ============= CONTENT SECTIONS =============

function addSupportedFormatsSection(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);

  let y = MARGINS.top + 10;
  const section = PRD_SECTIONS.supportedFormats;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 3;
  y = addParagraph(doc, section.content, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [['Format', 'Description']],
    body: section.formats.map(f => [f.name, f.description]),
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
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 125 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
}

function addDataModelSection(doc: jsPDF, pageNumber: { value: number }) {
  doc.addPage();
  pageNumber.value++;
  addHeader(doc, pageNumber.value);
  addFooter(doc);

  let y = MARGINS.top + 10;
  const section = PRD_SECTIONS.dataModel;
  y = addSectionTitle(doc, `${section.number}. ${section.title}`, y);
  y += 3;
  y = addParagraph(doc, section.content, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [['Entity', 'Description']],
    body: section.entities.map(e => [e.name, e.description]),
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
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 125 },
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
}

// ============= MAIN EXPORT FUNCTION =============

export function downloadPrdPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageNumber = { value: 1 };

  addCoverPage(doc);
  addTableOfContents(doc, pageNumber);

  // Sections with subsections
  addSectionWithSubsections(doc, PRD_SECTIONS.productOverview, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.scriptIngestion, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.analysisEngine, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.stakeholderLens, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.reportSystem, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.exportSharing, pageNumber);

  // Table-based sections
  addSupportedFormatsSection(doc, pageNumber);

  addSectionWithSubsections(doc, PRD_SECTIONS.teamOrganization, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.authSecurity, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.qualityModes, pageNumber);

  addDataModelSection(doc, pageNumber);

  addSectionWithSubsections(doc, PRD_SECTIONS.agentConfiguration, pageNumber);
  addSectionWithSubsections(doc, PRD_SECTIONS.dashboardAnalytics, pageNumber);

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`Pulse-v3-PRD-${dateStr}.pdf`);
}

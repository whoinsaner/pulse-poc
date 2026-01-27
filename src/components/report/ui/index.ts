// Pulse Report UI Components
// Reusable components for the report section pages

export { AssessmentCard, AssessmentGrid } from './AssessmentCard';
export type { AssessmentItem, AssessmentStatus } from './AssessmentCard';

export { VerdictBox, InlineVerdict } from './VerdictBox';
export type { VerdictType } from './VerdictBox';

export { ScoreDisplay, ScoreBar, ScoreBadge, getScoreColor, getScoreBgColor, getScoreLabel } from './ScoreDisplay';

export { AnalysisTable, CategoryBreakdown, columnRenderers } from './AnalysisTable';
export type { TableColumn } from './AnalysisTable';

export { QuoteCallout, QuoteGrid, InlineQuote } from './QuoteCallout';

export { SectionHeader, SubSectionHeader } from './SectionHeader';

export { StrengthWeaknessList, StrengthWeaknessTags } from './StrengthWeaknessList';

export { RecommendationCard, TieredRecommendations } from './RecommendationCard';
export type { RecommendationPriority, RecommendationEffort } from './RecommendationCard';

// USAF Redesign Components
export { MaturityBadge, InlineMaturity } from './MaturityBadge';
export { DiagnosisSummary, CompactDiagnosis } from './DiagnosisSummary';
export type { DiagnosticParameter } from './DiagnosisSummary';
export { WeightedParameterBar, WeightedParameterList } from './WeightedParameterBar';
export type { WeightedParameter } from './WeightedParameterBar';
export { SectionNavigator, CrossLink } from './SectionNavigator';
export type { NavigationSection } from './SectionNavigator';
export { DevelopmentFocus, InlineDevelopmentFocus } from './DevelopmentFocus';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Scripts from "./pages/Scripts";
import Settings from "./pages/Settings";
import AcceptInvitation from "./pages/AcceptInvitation";
import ModelConfiguration from "./pages/ModelConfiguration";
import AgentConfiguration from "./pages/AgentConfiguration";
import ReportLayout from "./components/report/ReportLayout";
import ProjectSnapshot from "./pages/report/ProjectSnapshot";
import ConceptHook from "./pages/report/ConceptHook";
import PlotAnalysis from "./pages/report/PlotAnalysis";
import StructuralEngineering from "./pages/report/StructuralEngineering";
import ProtagonistAnalysis from "./pages/report/ProtagonistAnalysis";
import AntagonistAnalysis from "./pages/report/AntagonistAnalysis";
import SupportingCast from "./pages/report/SupportingCast";
import CharacterPsychology from "./pages/report/CharacterPsychology";
import DialogueSubtext from "./pages/report/DialogueSubtext";
import ThemeMoral from "./pages/report/ThemeMoral";
import VisualStorytelling from "./pages/report/VisualStorytelling";
import EmotionalResonance from "./pages/report/EmotionalResonance";
import Marketability from "./pages/report/Marketability";
import Production from "./pages/report/Production";
import AudienceStrategy from "./pages/report/AudienceStrategy";
import SceneEconomy from "./pages/report/SceneEconomy";
import ReportAnalysis from "./pages/report/ReportAnalysis";
import ReportInsights from "./pages/report/ReportInsights";
import ReportNarrative from "./pages/report/ReportNarrative";
import ReportCharacters from "./pages/report/ReportCharacters";
import ReportPlatform from "./pages/report/ReportPlatform";
import ReportComic from "./pages/report/ReportComic";
import WebSeriesAnalysis from "./pages/report/WebSeriesAnalysis";
import RetentionAnalysis from "./pages/report/RetentionAnalysis";
import HooksAnalysis from "./pages/report/HooksAnalysis";
import CompleteScorecard from "./pages/report/CompleteScorecard";
import RewritePriorities from "./pages/report/RewritePriorities";
import StakeholderReport from "./pages/report/StakeholderReport";
import SeriesBibleExtract from "./pages/report/SeriesBibleExtract";
import SampleReportLayout from "./pages/SampleReport";
import SampleScript from "./pages/SampleScript";
import SampleComicReportLayout from "./pages/SampleComicReport";
import SampleComicScript from "./pages/SampleComicScript";
import SampleWebSeriesReportLayout from "./pages/SampleWebSeriesReport";
import SampleMicroDramaReportLayout from "./pages/SampleMicroDramaReport";
import ComicGallery from "./pages/ComicGallery";
import MicroDramaAnalysis from "./pages/report/MicroDramaAnalysis";
// New USAF Redesign Pages
import ReportCover from "./pages/report/ReportCover";
import StoryDiagnosis from "./pages/report/StoryDiagnosis";
import StoryConceptHook from "./pages/report/StoryConceptHook";
import StoryConflictStakes from "./pages/report/StoryConflictStakes";
import StoryDevelopmentFocus from "./pages/report/StoryDevelopmentFocus";
import StoryStructure from "./pages/report/StoryStructure";
import CharacterDiagnosis from "./pages/report/CharacterDiagnosis";
import CharacterDevelopmentFocus from "./pages/report/CharacterDevelopmentFocus";
import CraftDiagnosis from "./pages/report/CraftDiagnosis";
import CraftDialogue from "./pages/report/CraftDialogue";
import CraftTheme from "./pages/report/CraftTheme";
import CraftVisual from "./pages/report/CraftVisual";
import CraftEmotional from "./pages/report/CraftEmotional";
import CraftDevelopmentFocus from "./pages/report/CraftDevelopmentFocus";
import CommercialMarket from "./pages/report/CommercialMarket";
import CommercialProduction from "./pages/report/CommercialProduction";
import CommercialDevelopmentFocus from "./pages/report/CommercialDevelopmentFocus";
import FormatDiagnosis from "./pages/report/FormatDiagnosis";
import ComicFormatDiagnosis from "./pages/report/ComicFormatDiagnosis";
import CommercialDiagnosis from "./pages/report/CommercialDiagnosis";
import DevelopmentPriorities from "./pages/report/DevelopmentPriorities";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import ParametersAgents from "./pages/ParametersAgents";
import FrameworkDocumentation from "./pages/FrameworkDocumentation";
import TestAnalysisPipeline from "./pages/TestAnalysisPipeline";
import TestComicAnalysis from "./pages/TestComicAnalysis";
import NotFound from "./pages/NotFound";

function ReportsRedirect() {
  const { runId } = useParams<{ runId: string }>();
  return <Navigate to={`/report/${runId}`} replace />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:runId" element={<ReportsRedirect />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/invite/:token" element={<AcceptInvitation />} />
            <Route path="/admin/models" element={<ModelConfiguration />} />
            <Route path="/admin/agents" element={<AgentConfiguration />} />
            <Route path="/report/:runId" element={<ReportLayout />}>
              {/* USAF Consolidated Routes (primary) */}
              <Route index element={<ReportCover />} />
              <Route path="story" element={<StoryDiagnosis />} />
              <Route path="story/concept" element={<StoryConceptHook />} />
              <Route path="story/structure" element={<StoryStructure />} />
              <Route path="story/conflict" element={<StoryConflictStakes />} />
              <Route path="story/focus" element={<StoryDevelopmentFocus />} />
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="characters/focus" element={<CharacterDevelopmentFocus />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/focus" element={<CraftDevelopmentFocus />} />
              <Route path="format" element={<FormatDiagnosis />} />
              <Route path="comic-format" element={<ComicFormatDiagnosis />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="commercial/focus" element={<CommercialDevelopmentFocus />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<SceneEconomy />} />
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="script" element={<SampleScript />} />
              
              {/* Legacy routes - redirect to consolidated pages */}
              <Route path="concept" element={<Navigate to="../story" replace />} />
              <Route path="plot" element={<Navigate to="../story" replace />} />
              <Route path="structure" element={<Navigate to="../story" replace />} />
              <Route path="protagonist" element={<Navigate to="../characters" replace />} />
              <Route path="antagonist" element={<Navigate to="../characters" replace />} />
              <Route path="supporting" element={<Navigate to="../characters" replace />} />
              <Route path="psychology" element={<Navigate to="../characters" replace />} />
              <Route path="dialogue" element={<Navigate to="../craft" replace />} />
              <Route path="theme" element={<Navigate to="../craft" replace />} />
              <Route path="visual" element={<Navigate to="../craft" replace />} />
              <Route path="emotional" element={<Navigate to="../craft" replace />} />
              <Route path="market" element={<Navigate to="../commercial" replace />} />
              <Route path="production" element={<Navigate to="../commercial" replace />} />
              <Route path="audience" element={<Navigate to="../commercial" replace />} />
              <Route path="rewrite" element={<Navigate to="../development" replace />} />
              <Route path="scenes" element={<Navigate to="../development" replace />} />
              
              {/* Still-active legacy routes */}
              <Route path="bible" element={<SeriesBibleExtract />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
              <Route path="characters-detail" element={<ReportCharacters />} />
              <Route path="platform" element={<ReportPlatform />} />
              <Route path="comic" element={<Navigate to="../comic-format" replace />} />
              <Route path="web-series" element={<Navigate to="../format" replace />} />
              <Route path="retention" element={<Navigate to="../format" replace />} />
              <Route path="hooks" element={<Navigate to="../format" replace />} />
              <Route path="stakeholder/:stakeholder" element={<StakeholderReport />} />
            </Route>
            {/* Feature Film Sample Report - USAF Redesign */}
            <Route path="/sample-report" element={<SampleReportLayout />}>
              {/* New USAF Consolidated Routes */}
              <Route index element={<ReportCover />} />
              <Route path="story" element={<StoryDiagnosis />} />
              <Route path="story/concept" element={<StoryConceptHook />} />
              <Route path="story/structure" element={<StoryStructure />} />
              <Route path="story/conflict" element={<StoryConflictStakes />} />
              <Route path="story/focus" element={<StoryDevelopmentFocus />} />
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="characters/focus" element={<CharacterDevelopmentFocus />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/focus" element={<CraftDevelopmentFocus />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="commercial/focus" element={<CommercialDevelopmentFocus />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<SceneEconomy />} />
              
              {/* Legacy routes - redirect to consolidated pages */}
              <Route path="concept" element={<Navigate to="/sample-report/story" replace />} />
              <Route path="plot" element={<Navigate to="/sample-report/story" replace />} />
              <Route path="structure" element={<Navigate to="/sample-report/story" replace />} />
              <Route path="protagonist" element={<Navigate to="/sample-report/characters" replace />} />
              <Route path="antagonist" element={<Navigate to="/sample-report/characters" replace />} />
              <Route path="supporting" element={<Navigate to="/sample-report/characters" replace />} />
              <Route path="psychology" element={<Navigate to="/sample-report/characters" replace />} />
              <Route path="dialogue" element={<Navigate to="/sample-report/craft" replace />} />
              <Route path="theme" element={<Navigate to="/sample-report/craft" replace />} />
              <Route path="visual" element={<Navigate to="/sample-report/craft" replace />} />
              <Route path="emotional" element={<Navigate to="/sample-report/craft" replace />} />
              <Route path="market" element={<Navigate to="/sample-report/commercial" replace />} />
              <Route path="production" element={<Navigate to="/sample-report/commercial" replace />} />
              <Route path="audience" element={<Navigate to="/sample-report/commercial" replace />} />
              <Route path="rewrite" element={<Navigate to="/sample-report/development" replace />} />
              
              {/* Reference pages */}
              <Route path="scenes" element={<SceneEconomy />} />
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="bible" element={<SeriesBibleExtract />} />
              <Route path="script" element={<SampleScript />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
              <Route path="characters-detail" element={<ReportCharacters />} />
              <Route path="platform" element={<ReportPlatform />} />
            </Route>
            <Route path="/sample-script" element={<SampleScript />} />
            {/* Comic Sample Report - USAF Redesign with Comic-Specific Format */}
            <Route path="/sample-comic-report" element={<SampleComicReportLayout />}>
              {/* New USAF Consolidated Routes */}
              <Route index element={<ReportCover />} />
              <Route path="story" element={<StoryDiagnosis />} />
              <Route path="story/concept" element={<StoryConceptHook />} />
              <Route path="story/structure" element={<StoryStructure />} />
              <Route path="story/conflict" element={<StoryConflictStakes />} />
              <Route path="story/focus" element={<StoryDevelopmentFocus />} />
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="characters/focus" element={<CharacterDevelopmentFocus />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/focus" element={<CraftDevelopmentFocus />} />
              <Route path="format" element={<ComicFormatDiagnosis />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="commercial/focus" element={<CommercialDevelopmentFocus />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<SceneEconomy />} />
              
              {/* Legacy routes - redirect to consolidated pages */}
              <Route path="concept" element={<Navigate to="/sample-comic-report/story" replace />} />
              <Route path="plot" element={<Navigate to="/sample-comic-report/story" replace />} />
              <Route path="structure" element={<Navigate to="/sample-comic-report/story" replace />} />
              <Route path="protagonist" element={<Navigate to="/sample-comic-report/characters" replace />} />
              <Route path="antagonist" element={<Navigate to="/sample-comic-report/characters" replace />} />
              <Route path="supporting" element={<Navigate to="/sample-comic-report/characters" replace />} />
              <Route path="psychology" element={<Navigate to="/sample-comic-report/characters" replace />} />
              <Route path="dialogue" element={<Navigate to="/sample-comic-report/craft" replace />} />
              <Route path="theme" element={<Navigate to="/sample-comic-report/craft" replace />} />
              <Route path="visual" element={<Navigate to="/sample-comic-report/craft" replace />} />
              <Route path="emotional" element={<Navigate to="/sample-comic-report/craft" replace />} />
              <Route path="comic" element={<Navigate to="/sample-comic-report/format" replace />} />
              <Route path="market" element={<Navigate to="/sample-comic-report/commercial" replace />} />
              <Route path="production" element={<Navigate to="/sample-comic-report/commercial" replace />} />
              <Route path="audience" element={<Navigate to="/sample-comic-report/commercial" replace />} />
              <Route path="rewrite" element={<Navigate to="/sample-comic-report/development" replace />} />
              
              {/* Reference pages */}
              <Route path="scenes" element={<SceneEconomy />} />
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="bible" element={<SeriesBibleExtract />} />
              <Route path="script" element={<SampleComicScript />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
              <Route path="characters-detail" element={<ReportCharacters />} />
              <Route path="platform" element={<ReportPlatform />} />
            </Route>
            <Route path="/sample-comic-script" element={<SampleComicScript />} />
            <Route path="/sample-web-series-report" element={<SampleWebSeriesReportLayout />}>
              {/* New USAF Redesign Routes (consolidated) */}
              <Route index element={<ReportCover />} />
              <Route path="story" element={<StoryDiagnosis />} />
              <Route path="story/concept" element={<StoryConceptHook />} />
              <Route path="story/structure" element={<StoryStructure />} />
              <Route path="story/conflict" element={<StoryConflictStakes />} />
              <Route path="story/focus" element={<StoryDevelopmentFocus />} />
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="characters/focus" element={<CharacterDevelopmentFocus />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/focus" element={<CraftDevelopmentFocus />} />
              <Route path="format" element={<FormatDiagnosis />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="commercial/focus" element={<CommercialDevelopmentFocus />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<SceneEconomy />} />
              
              {/* Legacy routes - redirect to new consolidated pages */}
              <Route path="concept" element={<Navigate to="/sample-web-series-report/story" replace />} />
              <Route path="plot" element={<Navigate to="/sample-web-series-report/story" replace />} />
              <Route path="structure" element={<Navigate to="/sample-web-series-report/story" replace />} />
              <Route path="protagonist" element={<Navigate to="/sample-web-series-report/characters" replace />} />
              <Route path="antagonist" element={<Navigate to="/sample-web-series-report/characters" replace />} />
              <Route path="supporting" element={<Navigate to="/sample-web-series-report/characters" replace />} />
              <Route path="psychology" element={<Navigate to="/sample-web-series-report/characters" replace />} />
              <Route path="dialogue" element={<Navigate to="/sample-web-series-report/craft" replace />} />
              <Route path="theme" element={<Navigate to="/sample-web-series-report/craft" replace />} />
              <Route path="visual" element={<Navigate to="/sample-web-series-report/craft" replace />} />
              <Route path="emotional" element={<Navigate to="/sample-web-series-report/craft" replace />} />
              <Route path="web-series" element={<Navigate to="/sample-web-series-report/format" replace />} />
              <Route path="retention" element={<Navigate to="/sample-web-series-report/format" replace />} />
              <Route path="hooks" element={<Navigate to="/sample-web-series-report/format" replace />} />
              <Route path="market" element={<Navigate to="/sample-web-series-report/commercial" replace />} />
              <Route path="production" element={<Navigate to="/sample-web-series-report/commercial" replace />} />
              <Route path="audience" element={<Navigate to="/sample-web-series-report/commercial" replace />} />
              <Route path="rewrite" element={<Navigate to="/sample-web-series-report/development" replace />} />
              
              {/* Reference pages - keep as is */}
              <Route path="scenes" element={<SceneEconomy />} />
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="bible" element={<SeriesBibleExtract />} />
              <Route path="script" element={<SampleScript />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
            </Route>
            <Route path="/sample-micro-drama-report" element={<SampleMicroDramaReportLayout />}>
              <Route index element={<ProjectSnapshot />} />
              <Route path="concept" element={<ConceptHook />} />
              <Route path="plot" element={<PlotAnalysis />} />
              <Route path="structure" element={<StructuralEngineering />} />
              <Route path="protagonist" element={<ProtagonistAnalysis />} />
              <Route path="antagonist" element={<AntagonistAnalysis />} />
              <Route path="psychology" element={<CharacterPsychology />} />
              <Route path="dialogue" element={<DialogueSubtext />} />
              <Route path="theme" element={<ThemeMoral />} />
              <Route path="emotional" element={<EmotionalResonance />} />
              <Route path="micro-drama" element={<MicroDramaAnalysis />} />
              <Route path="market" element={<Marketability />} />
              <Route path="production" element={<Production />} />
              <Route path="audience" element={<AudienceStrategy />} />
              <Route path="rewrite" element={<RewritePriorities />} />
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="bible" element={<SeriesBibleExtract />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="characters" element={<ReportCharacters />} />
            </Route>
            <Route path="/comic-gallery" element={<ComicGallery />} />
            <Route path="/team" element={<Team />} />
            <Route path="/parameters" element={<ParametersAgents />} />
            <Route path="/documentation" element={<FrameworkDocumentation />} />
            <Route path="/test-pipeline" element={<TestAnalysisPipeline />} />
            <Route path="/test-comic-pipeline" element={<TestComicAnalysis />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

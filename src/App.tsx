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
import SettingsLayout from "./components/SettingsLayout";
import ProfileSettings from "./pages/settings/ProfileSettings";
import OrganizationSettings from "./pages/settings/OrganizationSettings";
import FeaturesSettings from "./pages/settings/FeaturesSettings";
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
import SampleSeriesReportLayout from "./pages/SampleSeriesReport";
import SampleSeriesScript from "./pages/SampleSeriesScript";
import SampleMicroDramaReportLayout from "./pages/SampleMicroDramaReport";
import ComicGallery from "./pages/ComicGallery";
import MicroDramaAnalysis from "./pages/report/MicroDramaAnalysis";
import ReportScript from "./pages/report/ReportScript";
// New USAF Redesign Pages
import ReportCover from "./pages/report/ReportCover";
import StoryDiagnosis from "./pages/report/StoryDiagnosis";
import StoryConceptHook from "./pages/report/StoryConceptHook";
import StoryConflictStakes from "./pages/report/StoryConflictStakes";

import StoryStructure from "./pages/report/StoryStructure";
import CharacterDiagnosis from "./pages/report/CharacterDiagnosis";

import CraftDiagnosis from "./pages/report/CraftDiagnosis";
import CraftDialogue from "./pages/report/CraftDialogue";
import CraftTheme from "./pages/report/CraftTheme";
import CraftVisual from "./pages/report/CraftVisual";
import CraftEmotional from "./pages/report/CraftEmotional";

import CommercialMarket from "./pages/report/CommercialMarket";
import CommercialProduction from "./pages/report/CommercialProduction";

import FormatDiagnosis from "./pages/report/FormatDiagnosis";
import FormatRouter from "./pages/report/FormatRouter";
import ComicFormatDiagnosis from "./pages/report/ComicFormatDiagnosis";
import ComicPanelFlow from "./pages/report/ComicPanelFlow";
import ComicLettering from "./pages/report/ComicLettering";
import ComicPageTurns from "./pages/report/ComicPageTurns";
import ComicArtSynergy from "./pages/report/ComicArtSynergy";
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
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/profile" replace />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="organization" element={<OrganizationSettings />} />
              <Route path="team" element={<Team />} />
              <Route path="models" element={<ModelConfiguration />} />
              <Route path="agents" element={<AgentConfiguration />} />
              <Route path="parameters" element={<ParametersAgents />} />
              <Route path="test-pipeline" element={<TestAnalysisPipeline />} />
              <Route path="features" element={<FeaturesSettings />} />
            </Route>
            <Route path="/invite/:token" element={<AcceptInvitation />} />
            <Route path="/report/:runId" element={<ReportLayout />}>
              {/* USAF Consolidated Routes (primary) */}
              <Route index element={<ReportCover />} />
              <Route path="story" element={<StoryDiagnosis />} />
              <Route path="story/concept" element={<StoryConceptHook />} />
              <Route path="story/structure" element={<StoryStructure />} />
              <Route path="story/conflict" element={<StoryConflictStakes />} />
              <Route path="story/focus" element={<Navigate to="../story" replace />} />
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="characters/focus" element={<Navigate to="../characters" replace />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/focus" element={<Navigate to="../craft" replace />} />
              <Route path="craft/scenes" element={<SceneEconomy />} />
              <Route path="format" element={<FormatRouter />} />
              <Route path="comic-format" element={<ComicFormatDiagnosis />} />
              <Route path="format/panel-flow" element={<ComicPanelFlow />} />
              <Route path="format/lettering" element={<ComicLettering />} />
              <Route path="format/page-turns" element={<ComicPageTurns />} />
              <Route path="format/art-synergy" element={<ComicArtSynergy />} />
              <Route path="format/web-series" element={<WebSeriesAnalysis />} />
              <Route path="format/retention" element={<RetentionAnalysis />} />
              <Route path="format/hooks" element={<HooksAnalysis />} />
              <Route path="format/micro-drama" element={<MicroDramaAnalysis />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="commercial/focus" element={<Navigate to="../commercial" replace />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<Navigate to="../craft/scenes" replace />} />
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="script" element={<ReportScript />} />
              
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
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/scenes" element={<SceneEconomy />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<Navigate to="../craft/scenes" replace />} />
              
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
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/scenes" element={<SceneEconomy />} />
              <Route path="format" element={<ComicFormatDiagnosis />} />
              <Route path="format/panel-flow" element={<ComicPanelFlow />} />
              <Route path="format/lettering" element={<ComicLettering />} />
              <Route path="format/page-turns" element={<ComicPageTurns />} />
              <Route path="format/art-synergy" element={<ComicArtSynergy />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<Navigate to="../craft/scenes" replace />} />
              
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
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/scenes" element={<SceneEconomy />} />
              <Route path="format" element={<FormatDiagnosis />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<Navigate to="../craft/scenes" replace />} />
              
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
            <Route path="/sample-series-script" element={<SampleSeriesScript />} />
            <Route path="/sample-series-report" element={<SampleSeriesReportLayout />}>
              {/* USAF Consolidated Routes */}
              <Route index element={<ReportCover />} />
              <Route path="story" element={<StoryDiagnosis />} />
              <Route path="story/concept" element={<StoryConceptHook />} />
              <Route path="story/structure" element={<StoryStructure />} />
              <Route path="story/conflict" element={<StoryConflictStakes />} />
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/scenes" element={<SceneEconomy />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<Navigate to="../craft/scenes" replace />} />
              
              {/* Reference pages */}
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="bible" element={<SeriesBibleExtract />} />
              <Route path="script" element={<SampleSeriesScript />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
            </Route>
            <Route path="/sample-micro-drama-report" element={<SampleMicroDramaReportLayout />}>
              {/* USAF Consolidated Routes */}
              <Route index element={<ReportCover />} />
              <Route path="story" element={<StoryDiagnosis />} />
              <Route path="story/concept" element={<StoryConceptHook />} />
              <Route path="story/structure" element={<StoryStructure />} />
              <Route path="story/conflict" element={<StoryConflictStakes />} />
              <Route path="characters" element={<CharacterDiagnosis />} />
              <Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
              <Route path="characters/antagonist" element={<AntagonistAnalysis />} />
              <Route path="characters/cast" element={<SupportingCast />} />
              <Route path="craft" element={<CraftDiagnosis />} />
              <Route path="craft/dialogue" element={<CraftDialogue />} />
              <Route path="craft/theme" element={<CraftTheme />} />
              <Route path="craft/visual" element={<CraftVisual />} />
              <Route path="craft/emotional" element={<CraftEmotional />} />
              <Route path="craft/scenes" element={<SceneEconomy />} />
              <Route path="format" element={<FormatDiagnosis />} />
              <Route path="format/micro-drama" element={<MicroDramaAnalysis />} />
              <Route path="commercial" element={<CommercialDiagnosis />} />
              <Route path="commercial/market" element={<CommercialMarket />} />
              <Route path="commercial/production" element={<CommercialProduction />} />
              <Route path="development" element={<DevelopmentPriorities />} />
              <Route path="development/rewrite" element={<RewritePriorities />} />
              <Route path="development/scenes" element={<Navigate to="../craft/scenes" replace />} />
              
              {/* Legacy routes - redirect to USAF equivalents */}
              <Route path="concept" element={<Navigate to="/sample-micro-drama-report/story" replace />} />
              <Route path="plot" element={<Navigate to="/sample-micro-drama-report/story" replace />} />
              <Route path="structure" element={<Navigate to="/sample-micro-drama-report/story" replace />} />
              <Route path="protagonist" element={<Navigate to="/sample-micro-drama-report/characters" replace />} />
              <Route path="antagonist" element={<Navigate to="/sample-micro-drama-report/characters" replace />} />
              <Route path="psychology" element={<Navigate to="/sample-micro-drama-report/characters" replace />} />
              <Route path="dialogue" element={<Navigate to="/sample-micro-drama-report/craft" replace />} />
              <Route path="theme" element={<Navigate to="/sample-micro-drama-report/craft" replace />} />
              <Route path="emotional" element={<Navigate to="/sample-micro-drama-report/craft" replace />} />
              <Route path="micro-drama" element={<Navigate to="/sample-micro-drama-report/format" replace />} />
              <Route path="market" element={<Navigate to="/sample-micro-drama-report/commercial" replace />} />
              <Route path="production" element={<Navigate to="/sample-micro-drama-report/commercial" replace />} />
              <Route path="audience" element={<Navigate to="/sample-micro-drama-report/commercial" replace />} />
              <Route path="rewrite" element={<Navigate to="/sample-micro-drama-report/development" replace />} />
              
              {/* Reference pages */}
              <Route path="scorecard" element={<CompleteScorecard />} />
              <Route path="bible" element={<SeriesBibleExtract />} />
              <Route path="script" element={<SampleScript />} />
              <Route path="narrative" element={<ReportNarrative />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
            </Route>
            <Route path="/comic-gallery" element={<ComicGallery />} />
            {/* Legacy redirects */}
            <Route path="/admin/models" element={<Navigate to="/settings/models" replace />} />
            <Route path="/admin/agents" element={<Navigate to="/settings/agents" replace />} />
            <Route path="/team" element={<Navigate to="/settings/team" replace />} />
            <Route path="/parameters" element={<Navigate to="/settings/parameters" replace />} />
            <Route path="/test-pipeline" element={<Navigate to="/settings/test-pipeline" replace />} />
            <Route path="/test-comic-pipeline" element={<TestComicAnalysis />} />
            <Route path="*" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

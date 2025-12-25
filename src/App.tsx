import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Scripts from "./pages/Scripts";
import ReportLayout from "./components/report/ReportLayout";
import ReportOverview from "./pages/report/ReportOverview";
import ReportAnalysis from "./pages/report/ReportAnalysis";
import ReportInsights from "./pages/report/ReportInsights";
import ReportNarrative from "./pages/report/ReportNarrative";
import ReportCharacters from "./pages/report/ReportCharacters";
import ReportPlatform from "./pages/report/ReportPlatform";
import ReportComic from "./pages/report/ReportComic";
import SampleReportLayout from "./pages/SampleReport";
import SampleScript from "./pages/SampleScript";
import SampleComicReportLayout from "./pages/SampleComicReport";
import SampleComicScript from "./pages/SampleComicScript";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import ParametersAgents from "./pages/ParametersAgents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Route path="/report/:runId" element={<ReportLayout />}>
              <Route index element={<ReportOverview />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
              <Route path="characters" element={<ReportCharacters />} />
              <Route path="platform" element={<ReportPlatform />} />
              <Route path="comic" element={<ReportComic />} />
            </Route>
            <Route path="/sample-report" element={<SampleReportLayout />}>
              <Route index element={<ReportOverview />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
              <Route path="characters" element={<ReportCharacters />} />
              <Route path="platform" element={<ReportPlatform />} />
            </Route>
            <Route path="/sample-script" element={<SampleScript />} />
            <Route path="/sample-comic-report" element={<SampleComicReportLayout />}>
              <Route index element={<ReportOverview />} />
              <Route path="comic" element={<ReportComic />} />
              <Route path="analysis" element={<ReportAnalysis />} />
              <Route path="insights" element={<ReportInsights />} />
              <Route path="narrative" element={<ReportNarrative />} />
              <Route path="characters" element={<ReportCharacters />} />
              <Route path="platform" element={<ReportPlatform />} />
            </Route>
            <Route path="/sample-comic-script" element={<SampleComicScript />} />
            <Route path="/team" element={<Team />} />
            <Route path="/parameters" element={<ParametersAgents />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

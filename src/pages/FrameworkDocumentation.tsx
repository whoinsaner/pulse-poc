import { useState } from 'react';
import { 
  Download, 
  FileText, 
  BookOpen, 
  Users, 
  Layers, 
  Target,
  ChevronRight,
  Eye,
  Zap,
  BarChart3,
  Sparkles,
  CheckCircle,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { downloadFrameworkPDF } from '@/lib/pdfGenerator';
import { downloadPulseV2PDF } from '@/lib/pulseV2PdfGenerator';
import { USAF_SECTIONS, USAF_METADATA, DECISION_SIGNALS } from '@/lib/pulseV2Documentation';
import {
  FRAMEWORK_METADATA,
  EXECUTIVE_SUMMARY,
  getAgentsByCategory,
  getStakeholderDocumentation,
  getCategoryList,
  getParametersByCategory,
} from '@/lib/frameworkDocumentation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function FrameworkDocumentation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingUSAF, setIsGeneratingUSAF] = useState(false);
  const [activeSection, setActiveSection] = useState('usaf');

  const agentCategories = getAgentsByCategory();
  const stakeholders = getStakeholderDocumentation();
  const categories = getCategoryList();
  const paramsByCategory = getParametersByCategory();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      downloadFrameworkPDF();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadUSAFPDF = async () => {
    setIsGeneratingUSAF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      downloadPulseV2PDF();
      toast.success('USAF Framework PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating USAF PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingUSAF(false);
    }
  };

  const sections = [
    { id: 'usaf', label: 'USAF', icon: Sparkles },
    { id: 'overview', label: 'Technical', icon: Eye },
    { id: 'agents', label: 'Agents', icon: Zap },
    { id: 'parameters', label: 'Parameters', icon: BarChart3 },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="secondary">v{FRAMEWORK_METADATA.version}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Universal Script Analysis Framework
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Comprehensive documentation for the USAF framework. Download the complete PDF for external stakeholder sharing.
              </p>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="gap-2"
            >
              <Download className="h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Download PDF Documentation'}
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-background/50 backdrop-blur">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{FRAMEWORK_METADATA.totalAgents}</div>
                <div className="text-sm text-muted-foreground">Specialized Agents</div>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{FRAMEWORK_METADATA.totalParameters}</div>
                <div className="text-sm text-muted-foreground">Evaluation Parameters</div>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{FRAMEWORK_METADATA.totalStakeholderLenses}</div>
                <div className="text-sm text-muted-foreground">Stakeholder Lenses</div>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{FRAMEWORK_METADATA.supportedScriptTypes}</div>
                <div className="text-sm text-muted-foreground">Script Types</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid grid-cols-5 w-full max-w-xl mb-8">
            {sections.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center gap-2"
              >
                <section.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* USAF Tab */}
          <TabsContent value="usaf" className="space-y-6">
            {/* Decision Signals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  USAF Decision Signals
                </CardTitle>
                <CardDescription>
                  Clear, actionable recommendations for every script evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-center">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <div className="font-bold text-success text-lg">GO</div>
                    <div className="text-xs text-muted-foreground mt-1">{DECISION_SIGNALS.go.scoreRange}</div>
                    <p className="text-sm text-muted-foreground mt-2">{DECISION_SIGNALS.go.description}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/30 text-center">
                    <ArrowRight className="h-8 w-8 text-chart-4 mx-auto mb-2" />
                    <div className="font-bold text-chart-4 text-lg">ITERATE</div>
                    <div className="text-xs text-muted-foreground mt-1">{DECISION_SIGNALS.iterate.scoreRange}</div>
                    <p className="text-sm text-muted-foreground mt-2">{DECISION_SIGNALS.iterate.description}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <div className="font-bold text-destructive text-lg">HOLD</div>
                    <div className="text-xs text-muted-foreground mt-1">{DECISION_SIGNALS.hold.scoreRange}</div>
                    <p className="text-sm text-muted-foreground mt-2">{DECISION_SIGNALS.hold.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 12 Core Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  12 Core Parameters
                </CardTitle>
                <CardDescription>
                  {USAF_SECTIONS.parameterModel.intro}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {USAF_SECTIONS.parameterModel.parameters.map((param, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="font-medium text-sm">{param.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{param.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maturity Scale */}
            <Card>
              <CardHeader>
                <CardTitle>Maturity Scale</CardTitle>
                <CardDescription>{USAF_SECTIONS.maturityScale.intro}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {USAF_SECTIONS.maturityScale.levels.map((level, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                      <Badge variant="outline" className="font-mono">{level.range}</Badge>
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Download CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
                <div className="flex items-center gap-4">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="font-semibold">Download USAF Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional PDF with the complete 10-section framework specification
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleDownloadUSAFPDF}
                  disabled={isGeneratingUSAF}
                  className="gap-2"
                >
                  <Download className="h-5 w-5" />
                  {isGeneratingUSAF ? 'Generating...' : 'Download USAF PDF'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    {EXECUTIVE_SUMMARY.trim()}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  4-Stage Pipeline Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  {[
                    { stage: 'Stage 1', title: 'Intake & Normalization', desc: 'Format conversion to canonical representation' },
                    { stage: 'Stage 2', title: 'Classification & Routing', desc: 'Script type detection and agent activation' },
                    { stage: 'Stage 3', title: 'Core Analysis', desc: 'Parallel agent evaluation (10+ agents)' },
                    { stage: 'Stage 4', title: 'Meta Synthesis', desc: 'Insight generation and lens weighting' },
                  ].map((item, index) => (
                    <div key={item.stage} className="w-full max-w-md">
                      <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
                        <div className="text-xs font-medium opacity-80">{item.stage}</div>
                        <div className="font-bold">{item.title}</div>
                        <div className="text-xs opacity-80 mt-1">{item.desc}</div>
                      </div>
                      {index < 3 && (
                        <div className="flex justify-center py-2">
                          <ChevronRight className="h-6 w-6 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            {Object.entries(agentCategories).map(([category, agents]) => (
              agents.length > 0 && (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()} Agents</span>
                      <Badge>{agents.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {agents.map((agent) => (
                        <div 
                          key={agent.id} 
                          className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{agent.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {agent.parameters.length} params
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {agent.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parameter Categories</CardTitle>
                <CardDescription>
                  {FRAMEWORK_METADATA.totalParameters} parameters across {categories.length} categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {categories.map((category) => {
                      const params = paramsByCategory[category];
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">{category}</h3>
                            <Badge variant="secondary">{params.length} parameters</Badge>
                          </div>
                          <div className="grid gap-2">
                            {params.slice(0, 5).map((param) => (
                              <div 
                                key={param.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-card"
                              >
                                <div>
                                  <div className="font-medium text-sm">{param.displayName}</div>
                                  <div className="text-xs text-muted-foreground truncate max-w-md">
                                    {param.description.substring(0, 80)}...
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  {param.weight.toFixed(1)}x
                                </Badge>
                              </div>
                            ))}
                            {params.length > 5 && (
                              <div className="text-center text-sm text-muted-foreground py-2">
                                +{params.length - 5} more parameters in this category
                              </div>
                            )}
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stakeholders Tab */}
          <TabsContent value="stakeholders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  9 Stakeholder Lenses
                </CardTitle>
                <CardDescription>
                  Role-specific perspectives that re-weight parameters based on professional priorities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stakeholders.map((stakeholder) => (
                    <div 
                      key={stakeholder.id}
                      className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{stakeholder.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {stakeholder.focus}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {stakeholder.keyMetrics.map((metric) => (
                          <Badge key={metric} variant="secondary" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Download CTA */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-4">
              <FileText className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">Download Complete Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Professional PDF with all {FRAMEWORK_METADATA.totalAgents} agents, {FRAMEWORK_METADATA.totalParameters} parameters, and {FRAMEWORK_METADATA.totalStakeholderLenses} stakeholder lenses
                </p>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="gap-2"
            >
              <Download className="h-5 w-5" />
              {isGenerating ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

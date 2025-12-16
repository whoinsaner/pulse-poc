-- Create enums for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'viewer');
CREATE TYPE public.script_format AS ENUM ('pdf', 'fdx', 'fountain', 'highland', 'txt');
CREATE TYPE public.script_type AS ENUM ('feature', 'pilot', 'episode', 'short', 'documentary');
CREATE TYPE public.analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.stakeholder_lens AS ENUM ('studio_executive', 'producer', 'actor', 'director', 'writer', 'financier', 'ott_platform', 'theatrical');

-- Organizations table (multi-tenant)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (RBAC - separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  current_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scripts table
CREATE TABLE public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  logline TEXT,
  genre TEXT,
  script_type script_type NOT NULL DEFAULT 'feature',
  format script_format NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  page_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Script versions table
CREATE TABLE public.script_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_url TEXT NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(script_id, version_number)
);

-- Scenes table (parsed from scripts)
CREATE TABLE public.scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  heading TEXT NOT NULL,
  location TEXT,
  time_of_day TEXT,
  int_ext TEXT,
  page_start NUMERIC(5,2),
  page_end NUMERIC(5,2),
  description TEXT,
  emotional_tone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Characters table
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dialogue_count INTEGER DEFAULT 0,
  scene_count INTEGER DEFAULT 0,
  first_appearance INTEGER,
  description TEXT,
  arc_summary TEXT,
  relationships JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Narrative graphs (story structure relationships)
CREATE TABLE public.narrative_graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  graph_type TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master parameters table (analysis criteria)
CREATE TABLE public.parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  agent_source TEXT NOT NULL,
  default_weight NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stakeholder lens weights
CREATE TABLE public.lens_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lens stakeholder_lens NOT NULL,
  parameter_id UUID NOT NULL REFERENCES public.parameters(id) ON DELETE CASCADE,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  UNIQUE(lens, parameter_id)
);

-- Analysis runs table
CREATE TABLE public.analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status analysis_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  agent_progress JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parameter scores (agent outputs)
CREATE TABLE public.parameter_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
  parameter_id UUID NOT NULL REFERENCES public.parameters(id) ON DELETE CASCADE,
  score NUMERIC(4,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  confidence NUMERIC(3,2) DEFAULT 0.8,
  evidence JSONB DEFAULT '[]'::jsonb,
  rationale TEXT,
  agent_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(analysis_run_id, parameter_id)
);

-- Insights table (synthesized recommendations)
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  actionable BOOLEAN DEFAULT true,
  supporting_evidence JSONB DEFAULT '[]'::jsonb,
  related_parameters UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports table (immutable generated reports)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  overall_score NUMERIC(4,2),
  lens_scores JSONB DEFAULT '{}'::jsonb,
  executive_summary TEXT,
  full_report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narrative_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lens_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parameter_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _org_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- Function to check if user belongs to org
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- Function to get user's current org
CREATE OR REPLACE FUNCTION public.get_user_current_org(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_organization_id
  FROM public.profiles
  WHERE user_id = _user_id
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), id));

CREATE POLICY "Admins can update their organizations"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), id, 'admin'));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their orgs"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'admin'));

CREATE POLICY "Users can insert their own role on org creation"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their orgs"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.user_belongs_to_org(auth.uid(), current_organization_id));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for invitations
CREATE POLICY "Users can view invitations for their orgs"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id) OR email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), organization_id, 'admin'));

CREATE POLICY "Admins can delete invitations"
  ON public.invitations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'admin'));

-- RLS Policies for scripts
CREATE POLICY "Users can view scripts in their org"
  ON public.scripts FOR SELECT
  TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Analysts and admins can create scripts"
  ON public.scripts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), organization_id, 'admin') OR 
    public.has_role(auth.uid(), organization_id, 'analyst')
  );

CREATE POLICY "Analysts and admins can update scripts"
  ON public.scripts FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), organization_id, 'admin') OR 
    public.has_role(auth.uid(), organization_id, 'analyst')
  );

CREATE POLICY "Admins can delete scripts"
  ON public.scripts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'admin'));

-- RLS Policies for script_versions
CREATE POLICY "Users can view script versions in their org"
  ON public.script_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scripts s
      WHERE s.id = script_id
      AND public.user_belongs_to_org(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "Analysts and admins can create script versions"
  ON public.script_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scripts s
      WHERE s.id = script_id
      AND (public.has_role(auth.uid(), s.organization_id, 'admin') OR public.has_role(auth.uid(), s.organization_id, 'analyst'))
    )
  );

-- RLS Policies for scenes
CREATE POLICY "Users can view scenes in their org"
  ON public.scenes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scripts s
      WHERE s.id = script_id
      AND public.user_belongs_to_org(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "System can insert scenes"
  ON public.scenes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for characters
CREATE POLICY "Users can view characters in their org"
  ON public.characters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scripts s
      WHERE s.id = script_id
      AND public.user_belongs_to_org(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "System can insert characters"
  ON public.characters FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for narrative_graphs
CREATE POLICY "Users can view narrative graphs in their org"
  ON public.narrative_graphs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scripts s
      WHERE s.id = script_id
      AND public.user_belongs_to_org(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "System can insert narrative graphs"
  ON public.narrative_graphs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for parameters (readable by all authenticated)
CREATE POLICY "All authenticated users can view parameters"
  ON public.parameters FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for lens_weights (readable by all authenticated)
CREATE POLICY "All authenticated users can view lens weights"
  ON public.lens_weights FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for analysis_runs
CREATE POLICY "Users can view analysis runs in their org"
  ON public.analysis_runs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scripts s
      WHERE s.id = script_id
      AND public.user_belongs_to_org(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "Analysts and admins can create analysis runs"
  ON public.analysis_runs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scripts s
      WHERE s.id = script_id
      AND (public.has_role(auth.uid(), s.organization_id, 'admin') OR public.has_role(auth.uid(), s.organization_id, 'analyst'))
    )
  );

CREATE POLICY "System can update analysis runs"
  ON public.analysis_runs FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for parameter_scores
CREATE POLICY "Users can view parameter scores in their org"
  ON public.parameter_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_runs ar
      JOIN public.scripts s ON s.id = ar.script_id
      WHERE ar.id = analysis_run_id
      AND public.user_belongs_to_org(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "System can insert parameter scores"
  ON public.parameter_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for insights
CREATE POLICY "Users can view insights in their org"
  ON public.insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_runs ar
      JOIN public.scripts s ON s.id = ar.script_id
      WHERE ar.id = analysis_run_id
      AND public.user_belongs_to_org(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "System can insert insights"
  ON public.insights FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for reports
CREATE POLICY "Users can view reports in their org"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "System can insert reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default parameters
INSERT INTO public.parameters (name, display_name, description, category, agent_source, default_weight) VALUES
  ('structural_integrity', 'Structural Integrity', 'Overall 3-act structure adherence and pacing', 'Structure', 'StructureAgent', 1.0),
  ('inciting_incident', 'Inciting Incident', 'Clarity and timing of the inciting incident', 'Structure', 'StructureAgent', 0.9),
  ('midpoint_turn', 'Midpoint Turn', 'Effectiveness of the midpoint reversal', 'Structure', 'StructureAgent', 0.85),
  ('climax_resolution', 'Climax & Resolution', 'Satisfaction of climax and resolution', 'Structure', 'StructureAgent', 0.95),
  ('protagonist_arc', 'Protagonist Arc', 'Completeness of protagonist transformation', 'Character', 'CharacterAgent', 1.0),
  ('character_distinctiveness', 'Character Distinctiveness', 'Uniqueness of character voices and traits', 'Character', 'CharacterAgent', 0.9),
  ('character_motivation', 'Character Motivation', 'Clarity and believability of motivations', 'Character', 'CharacterAgent', 0.95),
  ('supporting_characters', 'Supporting Characters', 'Depth and utility of supporting cast', 'Character', 'CharacterAgent', 0.8),
  ('central_conflict', 'Central Conflict', 'Clarity and stakes of main conflict', 'Conflict', 'ConflictAgent', 1.0),
  ('escalation', 'Escalation', 'Progressive raising of stakes', 'Conflict', 'ConflictAgent', 0.9),
  ('obstacles', 'Obstacles', 'Variety and challenge of obstacles', 'Conflict', 'ConflictAgent', 0.85),
  ('thematic_coherence', 'Thematic Coherence', 'Consistency of theme throughout', 'Theme', 'ThemeAgent', 0.9),
  ('thematic_depth', 'Thematic Depth', 'Profundity and universality of themes', 'Theme', 'ThemeAgent', 0.85),
  ('dialogue_authenticity', 'Dialogue Authenticity', 'Natural and character-appropriate dialogue', 'Dialogue', 'DialogueAgent', 0.9),
  ('subtext', 'Subtext', 'Layers of meaning beneath dialogue', 'Dialogue', 'DialogueAgent', 0.8),
  ('dialogue_efficiency', 'Dialogue Efficiency', 'Economy and purpose of dialogue', 'Dialogue', 'DialogueAgent', 0.85),
  ('world_consistency', 'World Consistency', 'Internal logic and rule adherence', 'World', 'WorldLogicAgent', 0.9),
  ('world_building', 'World Building', 'Richness of world details', 'World', 'WorldLogicAgent', 0.8),
  ('emotional_engagement', 'Emotional Engagement', 'Ability to evoke emotional response', 'Emotion', 'EmotionalArcAgent', 1.0),
  ('emotional_variety', 'Emotional Variety', 'Range of emotional beats', 'Emotion', 'EmotionalArcAgent', 0.85),
  ('genre_fit', 'Genre Fit', 'Alignment with genre expectations', 'Market', 'MarketAgent', 0.9),
  ('originality', 'Originality', 'Fresh perspective or unique angle', 'Market', 'MarketAgent', 0.85),
  ('commercial_viability', 'Commercial Viability', 'Market potential and audience appeal', 'Market', 'MarketAgent', 0.95),
  ('budget_feasibility', 'Budget Feasibility', 'Realistic production scope', 'Execution', 'ExecutionAgent', 0.9),
  ('technical_demands', 'Technical Demands', 'VFX, stunts, and technical complexity', 'Execution', 'ExecutionAgent', 0.8),
  ('casting_appeal', 'Casting Appeal', 'Attractiveness of roles for talent', 'Execution', 'ExecutionAgent', 0.85);

-- Insert lens weights for each stakeholder
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'studio_executive', id, 
  CASE name
    WHEN 'commercial_viability' THEN 1.5
    WHEN 'budget_feasibility' THEN 1.4
    WHEN 'casting_appeal' THEN 1.3
    WHEN 'genre_fit' THEN 1.2
    WHEN 'protagonist_arc' THEN 1.1
    ELSE 1.0
  END
FROM public.parameters;

INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'producer', id,
  CASE name
    WHEN 'budget_feasibility' THEN 1.5
    WHEN 'technical_demands' THEN 1.4
    WHEN 'structural_integrity' THEN 1.2
    WHEN 'commercial_viability' THEN 1.2
    ELSE 1.0
  END
FROM public.parameters;

INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'actor', id,
  CASE name
    WHEN 'protagonist_arc' THEN 1.5
    WHEN 'character_distinctiveness' THEN 1.4
    WHEN 'character_motivation' THEN 1.4
    WHEN 'dialogue_authenticity' THEN 1.3
    WHEN 'emotional_engagement' THEN 1.2
    ELSE 1.0
  END
FROM public.parameters;

INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'director', id,
  CASE name
    WHEN 'structural_integrity' THEN 1.4
    WHEN 'emotional_engagement' THEN 1.3
    WHEN 'world_building' THEN 1.3
    WHEN 'climax_resolution' THEN 1.2
    ELSE 1.0
  END
FROM public.parameters;

INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'writer', id,
  CASE name
    WHEN 'dialogue_authenticity' THEN 1.4
    WHEN 'thematic_depth' THEN 1.4
    WHEN 'subtext' THEN 1.3
    WHEN 'character_distinctiveness' THEN 1.3
    WHEN 'originality' THEN 1.2
    ELSE 1.0
  END
FROM public.parameters;

INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'financier', id,
  CASE name
    WHEN 'commercial_viability' THEN 1.6
    WHEN 'budget_feasibility' THEN 1.5
    WHEN 'genre_fit' THEN 1.3
    WHEN 'casting_appeal' THEN 1.2
    ELSE 1.0
  END
FROM public.parameters;

INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'ott_platform', id,
  CASE name
    WHEN 'emotional_engagement' THEN 1.4
    WHEN 'protagonist_arc' THEN 1.3
    WHEN 'escalation' THEN 1.3
    WHEN 'originality' THEN 1.2
    WHEN 'world_building' THEN 1.2
    ELSE 1.0
  END
FROM public.parameters;

INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'theatrical', id,
  CASE name
    WHEN 'emotional_engagement' THEN 1.5
    WHEN 'climax_resolution' THEN 1.4
    WHEN 'world_building' THEN 1.3
    WHEN 'technical_demands' THEN 1.2
    ELSE 1.0
  END
FROM public.parameters;

-- Create storage bucket for scripts
INSERT INTO storage.buckets (id, name, public) VALUES ('scripts', 'scripts', false);

-- Storage policies for scripts bucket
CREATE POLICY "Users can upload scripts to their org"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'scripts');

CREATE POLICY "Users can view scripts in their org"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'scripts');

CREATE POLICY "Users can delete their scripts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'scripts');
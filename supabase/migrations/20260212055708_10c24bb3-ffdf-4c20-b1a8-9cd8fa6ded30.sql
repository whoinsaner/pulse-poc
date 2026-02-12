
-- Update agent_source in parameters table to match edge function agent names
UPDATE public.parameters SET agent_source = 'PanelFlowAgent' WHERE agent_source = 'ComicVisualAgent';
UPDATE public.parameters SET agent_source = 'LetteringBalloonAgent' WHERE agent_source = 'ComicDialogueAgent';
UPDATE public.parameters SET agent_source = 'PageTurnImpactAgent' WHERE agent_source = 'ComicPacingAgent';
UPDATE public.parameters SET agent_source = 'ArtScriptSynergyAgent' WHERE agent_source = 'ComicArtDirectionAgent';

-- Add comic-specific parameters for analysis
INSERT INTO public.parameters (name, display_name, description, category, agent_source) VALUES
-- Comic Visual Agent parameters
('visual_storytelling', 'Visual Storytelling', 'How effectively the script uses visual medium to tell the story', 'Comic Visuals', 'ComicVisualAgent'),
('panel_composition', 'Panel Composition', 'Variety and effectiveness of panel layouts and compositions', 'Comic Visuals', 'ComicVisualAgent'),
('page_layout', 'Page Layout', 'Flow and pacing of page designs, use of splash pages and spreads', 'Comic Visuals', 'ComicVisualAgent'),
('action_clarity', 'Action Clarity', 'How clearly action sequences are described for artists', 'Comic Visuals', 'ComicVisualAgent'),
-- Comic Dialogue Agent parameters
('balloon_efficiency', 'Balloon Efficiency', 'Conciseness of dialogue that fits speech balloons without overcrowding', 'Comic Dialogue', 'ComicDialogueAgent'),
('caption_voice', 'Caption Voice', 'Distinctive and consistent narrator/caption voice', 'Comic Dialogue', 'ComicDialogueAgent'),
('sound_effects', 'Sound Effects', 'Creative and effective use of SFX to enhance action', 'Comic Dialogue', 'ComicDialogueAgent'),
-- Comic Pacing Agent parameters
('panel_to_panel_flow', 'Panel-to-Panel Flow', 'How smoothly the reader''s eye moves through the story', 'Comic Pacing', 'ComicPacingAgent'),
('issue_structure', 'Issue Structure', 'Effective use of comic issue format (22-24 pages typically)', 'Comic Pacing', 'ComicPacingAgent'),
('cliffhangers', 'Cliffhangers', 'Strength of page-turn reveals and issue endings', 'Comic Pacing', 'ComicPacingAgent'),
-- Comic Art Direction Agent parameters
('artist_guidance', 'Artist Guidance', 'Clarity and detail of visual descriptions for artists', 'Comic Art Direction', 'ComicArtDirectionAgent'),
('reference_clarity', 'Reference Clarity', 'Clear character and setting descriptions for consistent art', 'Comic Art Direction', 'ComicArtDirectionAgent'),
('style_consistency', 'Style Consistency', 'Maintaining visual tone throughout the script', 'Comic Art Direction', 'ComicArtDirectionAgent')
ON CONFLICT (name) DO NOTHING;

-- Allow org members to delete characters for their scripts
CREATE POLICY "Org members can delete characters via script"
ON public.characters
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM scripts s
  WHERE s.id = characters.script_id
  AND user_belongs_to_org(auth.uid(), s.organization_id)
));

-- Allow org members to delete scenes for their scripts
CREATE POLICY "Org members can delete scenes via script"
ON public.scenes
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM scripts s
  WHERE s.id = scenes.script_id
  AND user_belongs_to_org(auth.uid(), s.organization_id)
));

-- Allow org members to delete narrative_graphs for their scripts
CREATE POLICY "Org members can delete narrative_graphs via script"
ON public.narrative_graphs
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM scripts s
  WHERE s.id = narrative_graphs.script_id
  AND user_belongs_to_org(auth.uid(), s.organization_id)
));

-- Insert lens_weights for investor lens for all existing parameters
-- The investor lens prioritizes market, financial, and readiness parameters
INSERT INTO lens_weights (lens, parameter_id, weight)
SELECT 
  'investor'::stakeholder_lens,
  p.id,
  CASE 
    -- High priority for investor: Market, Execution, Investor Readiness parameters
    WHEN p.agent_source IN ('MarketAgent', 'InvestorReadinessAgent') THEN 1.3
    WHEN p.agent_source = 'ExecutionAgent' THEN 1.2
    -- Medium priority: Concept (IP potential), Structure (story quality)
    WHEN p.agent_source IN ('ConceptAgent', 'StructureAgent') THEN 1.1
    -- Standard weight for other agents
    ELSE 1.0
  END as weight
FROM parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'investor'::stakeholder_lens
);
-- Enable realtime for analysis_runs table to track live progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_runs;
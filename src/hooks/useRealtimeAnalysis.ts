import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AnalysisStatus, AgentProgress } from '@/types/database';

interface AnalysisRun {
  id: string;
  script_id: string;
  status: AnalysisStatus;
  agent_progress: Record<string, AgentProgress> | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  stakeholder_lens: string | null;
  scripts?: {
    title: string;
    genre: string | null;
    script_type: string;
  };
}

interface UseRealtimeAnalysisOptions {
  analysisRunId?: string;
  scriptId?: string;
  onStatusChange?: (status: AnalysisStatus) => void;
  onComplete?: (analysis: AnalysisRun) => void;
  onError?: (error: string) => void;
}

export function useRealtimeAnalysis({
  analysisRunId,
  scriptId,
  onStatusChange,
  onComplete,
  onError
}: UseRealtimeAnalysisOptions) {
  const [analysis, setAnalysis] = useState<AnalysisRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial analysis data
  const fetchAnalysis = useCallback(async () => {
    if (!analysisRunId && !scriptId) {
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('analysis_runs')
        .select(`
          id,
          script_id,
          status,
          agent_progress,
          error_message,
          created_at,
          started_at,
          completed_at,
          stakeholder_lens,
          scripts (
            title,
            genre,
            script_type
          )
        `);

      if (analysisRunId) {
        query = query.eq('id', analysisRunId);
      } else if (scriptId) {
        query = query.eq('script_id', scriptId).order('created_at', { ascending: false }).limit(1);
      }

      const { data, error: fetchError } = await query.maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
          const analysisData: AnalysisRun = {
            ...data,
            agent_progress: data.agent_progress as unknown as Record<string, AgentProgress> | null,
            scripts: data.scripts as AnalysisRun['scripts']
          };
        setAnalysis(analysisData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analysis';
      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  }, [analysisRunId, scriptId, onError]);

  // Set up polling (realtime removed from analysis_runs for security)
  useEffect(() => {
    fetchAnalysis();

    if (!analysisRunId && !scriptId) return;

    // Poll every 3 seconds while analysis is in progress
    const intervalId = setInterval(async () => {
      try {
        let query = supabase
          .from('analysis_runs')
          .select('id, script_id, status, agent_progress, error_message, created_at, started_at, completed_at, stakeholder_lens');

        if (analysisRunId) {
          query = query.eq('id', analysisRunId);
        } else if (scriptId) {
          query = query.eq('script_id', scriptId).order('created_at', { ascending: false }).limit(1);
        }

        const { data } = await query.maybeSingle();
        if (!data) return;

        setAnalysis(prev => {
          const updated: AnalysisRun = {
            ...prev,
            ...data,
            agent_progress: data.agent_progress as unknown as Record<string, AgentProgress> | null,
            scripts: prev?.scripts,
          };

          // Trigger callbacks on status change
          if (prev && data.status !== prev.status) {
            onStatusChange?.(data.status as AnalysisStatus);

            if (data.status === 'completed') {
              onComplete?.(updated);
            }

            if (data.status === 'failed' && data.error_message) {
              onError?.(data.error_message);
            }
          }

          // Stop polling when terminal
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(intervalId);
          }

          return updated;
        });
      } catch {
        // Silently continue polling
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [analysisRunId, scriptId, fetchAnalysis, onStatusChange, onComplete, onError]);

  // Manual refresh
  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchAnalysis();
  }, [fetchAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    refresh,
    agentProgress: analysis?.agent_progress || {},
    status: analysis?.status || 'pending'
  };
}

export default useRealtimeAnalysis;

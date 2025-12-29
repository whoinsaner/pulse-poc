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

  // Set up realtime subscription
  useEffect(() => {
    fetchAnalysis();

    if (!analysisRunId && !scriptId) return;

    // Subscribe to changes
    const channel = supabase
      .channel(`analysis-${analysisRunId || scriptId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_runs',
          filter: analysisRunId 
            ? `id=eq.${analysisRunId}` 
            : `script_id=eq.${scriptId}`
        },
        (payload) => {
          console.log('[Realtime] Analysis update received:', payload);
          
          const newData = payload.new as {
            id: string;
            script_id: string;
            status: AnalysisStatus;
            agent_progress: Record<string, AgentProgress> | null;
            error_message: string | null;
            created_at: string;
            started_at: string | null;
            completed_at: string | null;
          };
          
          setAnalysis(prev => {
            if (!prev) return null;
            
            const updated: AnalysisRun = {
              ...prev,
              ...newData,
              agent_progress: newData.agent_progress as Record<string, AgentProgress> | null
            };
            
            // Trigger callbacks
            if (newData.status !== prev.status) {
              onStatusChange?.(newData.status);
              
              if (newData.status === 'completed') {
                onComplete?.(updated);
              }
              
              if (newData.status === 'failed' && newData.error_message) {
                onError?.(newData.error_message);
              }
            }
            
            return updated;
          });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Unsubscribing from analysis updates');
      supabase.removeChannel(channel);
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

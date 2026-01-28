/**
 * Parameter Synchronization Utility
 * 
 * Ensures the parameters database table stays aligned with
 * the canonical parameter definitions in parameterDefinitions.ts
 */

import { supabase } from "@/integrations/supabase/client";
import { CORE_PARAMETERS, COMIC_PARAMETERS, WEB_SERIES_PARAMETERS, ParameterDefinition } from "./parameterDefinitions";

export interface ParameterSyncResult {
  success: boolean;
  seeded: string[];
  updated: string[];
  errors: string[];
}

export interface ParameterSyncStatus {
  inDatabase: boolean;
  isFrameworkDefined: boolean;
  needsUpdate: boolean;
}

// Combine all parameters from the framework
export const ALL_FRAMEWORK_PARAMETERS: ParameterDefinition[] = [
  ...CORE_PARAMETERS,
  ...COMIC_PARAMETERS,
  ...WEB_SERIES_PARAMETERS,
];

/**
 * Get sync status for all framework parameters
 */
export async function getParameterSyncStatus(): Promise<Record<string, ParameterSyncStatus>> {
  const { data: dbParams, error } = await supabase
    .from("parameters")
    .select("id, name, display_name, category, agent_source, description, default_weight");

  if (error) {
    console.error("Error fetching parameter sync status:", error);
    return {};
  }

  const dbParamMap = new Map(
    (dbParams || []).map((p) => [p.name, p])
  );

  const status: Record<string, ParameterSyncStatus> = {};

  // Check all framework parameters
  for (const param of ALL_FRAMEWORK_PARAMETERS) {
    const dbParam = dbParamMap.get(param.name);
    const needsUpdate = dbParam && (
      dbParam.display_name !== param.displayName ||
      dbParam.category !== param.category ||
      dbParam.agent_source !== param.agentSource ||
      Math.abs((dbParam.default_weight || 1) - param.weight) > 0.01
    );
    
    status[param.name] = {
      inDatabase: !!dbParam,
      isFrameworkDefined: true,
      needsUpdate: !!needsUpdate,
    };
  }

  // Also check for orphaned database parameters not in framework
  for (const [paramName] of dbParamMap) {
    if (!status[paramName]) {
      status[paramName] = {
        inDatabase: true,
        isFrameworkDefined: false,
        needsUpdate: false,
      };
    }
  }

  return status;
}

/**
 * Sync a single parameter from framework to database
 */
export async function syncParameterToDatabase(
  param: ParameterDefinition
): Promise<{ success: boolean; action: "created" | "updated" | "skipped"; error?: string }> {
  try {
    // Check if parameter exists
    const { data: existing, error: checkError } = await supabase
      .from("parameters")
      .select("id, name, display_name, category, agent_source")
      .eq("name", param.name)
      .maybeSingle();

    if (checkError) {
      return { success: false, action: "skipped", error: checkError.message };
    }

    if (!existing) {
      // Create new parameter - use service role through edge function
      // For now, log that it needs to be seeded
      console.log(`[ParameterSync] Parameter ${param.name} needs to be seeded (no INSERT permission)`);
      return { success: false, action: "skipped", error: "Parameters table requires service role for INSERT" };
    }

    // Parameter exists - check if update needed
    const needsUpdate = 
      existing.display_name !== param.displayName ||
      existing.category !== param.category ||
      existing.agent_source !== param.agentSource;

    if (needsUpdate) {
      console.log(`[ParameterSync] Parameter ${param.name} needs update (no UPDATE permission)`);
      return { success: false, action: "skipped", error: "Parameters table requires service role for UPDATE" };
    }

    return { success: true, action: "skipped" };
  } catch (err) {
    return { success: false, action: "skipped", error: String(err) };
  }
}

/**
 * Get a list of framework parameters missing from the database
 */
export async function getMissingParameters(): Promise<ParameterDefinition[]> {
  const status = await getParameterSyncStatus();
  return ALL_FRAMEWORK_PARAMETERS.filter((param) => !status[param.name]?.inDatabase);
}

/**
 * Get a list of parameters that need updates
 */
export async function getParametersNeedingUpdate(): Promise<ParameterDefinition[]> {
  const status = await getParameterSyncStatus();
  return ALL_FRAMEWORK_PARAMETERS.filter((param) => status[param.name]?.needsUpdate);
}

/**
 * Get count of parameters by category from the framework
 */
export function getFrameworkParameterCounts(): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  
  for (const param of ALL_FRAMEWORK_PARAMETERS) {
    if (!byCategory[param.category]) {
      byCategory[param.category] = 0;
    }
    byCategory[param.category]++;
  }

  return {
    total: ALL_FRAMEWORK_PARAMETERS.length,
    byCategory,
  };
}

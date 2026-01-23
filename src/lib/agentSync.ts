/**
 * Agent Configuration Synchronization Utility
 * 
 * Ensures the agent_configurations database table stays aligned with
 * the canonical agent definitions in scriptFramework.ts
 */

import { supabase } from "@/integrations/supabase/client";
import { ALL_AGENTS, AgentDefinition } from "./scriptFramework";

export interface SyncResult {
  success: boolean;
  seeded: string[];
  updated: string[];
  deactivated: string[];
  errors: string[];
}

export interface AgentSyncStatus {
  inDatabase: boolean;
  isActive: boolean;
  hasCustomPrompt: boolean;
  frameworkVersion: boolean;
}

/**
 * Get the default system prompt for an agent based on its definition
 */
function getDefaultSystemPrompt(agent: AgentDefinition): string {
  const paramList = agent.parameters.join(", ");
  return `You are the ${agent.name} agent. ${agent.description}

Analyze the provided script and evaluate the following parameters: ${paramList}.

For each parameter, provide:
1. A score from 0-10
2. A confidence level (0-1)
3. A rationale explaining your assessment
4. Supporting evidence from the script

Return your analysis as a valid JSON object.`;
}

/**
 * Check if an agent exists in the database
 */
export async function checkAgentExists(agentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("agent_configurations")
    .select("id")
    .eq("agent_name", agentId)
    .eq("is_system", true)
    .maybeSingle();

  if (error) {
    console.error(`Error checking agent ${agentId}:`, error);
    return false;
  }

  return !!data;
}

/**
 * Get sync status for all framework agents
 */
export async function getAgentSyncStatus(): Promise<Record<string, AgentSyncStatus>> {
  const { data: dbAgents, error } = await supabase
    .from("agent_configurations")
    .select("agent_name, is_active, system_prompt, version")
    .eq("is_system", true);

  if (error) {
    console.error("Error fetching agent sync status:", error);
    return {};
  }

  const dbAgentMap = new Map(
    (dbAgents || []).map((a) => [a.agent_name, a])
  );

  const status: Record<string, AgentSyncStatus> = {};

  for (const agent of ALL_AGENTS) {
    const dbAgent = dbAgentMap.get(agent.id);
    status[agent.id] = {
      inDatabase: !!dbAgent,
      isActive: dbAgent?.is_active ?? false,
      hasCustomPrompt: (dbAgent?.version ?? 1) > 1,
      frameworkVersion: true,
    };
  }

  // Also check for legacy agents not in framework
  for (const [agentName, dbAgent] of dbAgentMap) {
    if (!status[agentName]) {
      status[agentName] = {
        inDatabase: true,
        isActive: dbAgent.is_active,
        hasCustomPrompt: (dbAgent.version ?? 1) > 1,
        frameworkVersion: false,
      };
    }
  }

  return status;
}

/**
 * Sync a single agent from framework to database
 */
export async function syncAgentToDatabase(
  agent: AgentDefinition,
  forceUpdate = false
): Promise<{ success: boolean; action: "created" | "updated" | "skipped"; error?: string }> {
  try {
    // Check if agent exists
    const { data: existing, error: checkError } = await supabase
      .from("agent_configurations")
      .select("id, version, system_prompt")
      .eq("agent_name", agent.id)
      .eq("is_system", true)
      .maybeSingle();

    if (checkError) {
      return { success: false, action: "skipped", error: checkError.message };
    }

    const defaultPrompt = getDefaultSystemPrompt(agent);

    if (!existing) {
      // Create new agent
      const { error: insertError } = await supabase
        .from("agent_configurations")
        .insert({
          agent_name: agent.id,
          display_name: agent.name,
          category: agent.category,
          description: agent.description,
          parameters: agent.parameters,
          system_prompt: defaultPrompt,
          is_system: true,
          is_active: true,
          version: 1,
        });

      if (insertError) {
        return { success: false, action: "skipped", error: insertError.message };
      }

      return { success: true, action: "created" };
    }

    // Agent exists - only update if forced or prompt hasn't been customized
    if (forceUpdate || existing.version === 1) {
      const { error: updateError } = await supabase
        .from("agent_configurations")
        .update({
          display_name: agent.name,
          category: agent.category,
          description: agent.description,
          parameters: agent.parameters,
          // Only update prompt if not customized
          ...(existing.version === 1 ? { system_prompt: defaultPrompt } : {}),
        })
        .eq("id", existing.id);

      if (updateError) {
        return { success: false, action: "skipped", error: updateError.message };
      }

      return { success: true, action: "updated" };
    }

    return { success: true, action: "skipped" };
  } catch (err) {
    return { success: false, action: "skipped", error: String(err) };
  }
}

/**
 * Sync all framework agents to database
 * - Seeds missing agents
 * - Updates metadata for agents without custom prompts
 * - Does NOT overwrite customized prompts
 */
export async function syncAgentsFromFramework(forceUpdate = false): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    seeded: [],
    updated: [],
    deactivated: [],
    errors: [],
  };

  console.log(`[AgentSync] Starting sync of ${ALL_AGENTS.length} framework agents...`);

  for (const agent of ALL_AGENTS) {
    const syncResult = await syncAgentToDatabase(agent, forceUpdate);

    if (!syncResult.success) {
      result.errors.push(`${agent.id}: ${syncResult.error}`);
      result.success = false;
    } else if (syncResult.action === "created") {
      result.seeded.push(agent.id);
    } else if (syncResult.action === "updated") {
      result.updated.push(agent.id);
    }
  }

  console.log(`[AgentSync] Sync complete:`, {
    seeded: result.seeded.length,
    updated: result.updated.length,
    errors: result.errors.length,
  });

  return result;
}

/**
 * Deactivate agents that are in the database but not in the framework
 */
export async function deactivateLegacyAgents(): Promise<string[]> {
  const frameworkAgentIds = new Set(ALL_AGENTS.map((a) => a.id));

  const { data: dbAgents, error } = await supabase
    .from("agent_configurations")
    .select("id, agent_name")
    .eq("is_system", true)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching agents for deactivation:", error);
    return [];
  }

  const toDeactivate = (dbAgents || []).filter(
    (a) => !frameworkAgentIds.has(a.agent_name)
  );

  const deactivated: string[] = [];

  for (const agent of toDeactivate) {
    const { error: updateError } = await supabase
      .from("agent_configurations")
      .update({ is_active: false })
      .eq("id", agent.id);

    if (!updateError) {
      deactivated.push(agent.agent_name);
    }
  }

  return deactivated;
}

/**
 * Get a list of framework agents that are missing from the database
 */
export async function getMissingAgents(): Promise<AgentDefinition[]> {
  const status = await getAgentSyncStatus();
  return ALL_AGENTS.filter((agent) => !status[agent.id]?.inDatabase);
}

/**
 * Get a list of legacy agents (in DB but not in framework)
 */
export async function getLegacyAgents(): Promise<string[]> {
  const status = await getAgentSyncStatus();
  return Object.entries(status)
    .filter(([_, s]) => s.inDatabase && !s.frameworkVersion)
    .map(([name]) => name);
}
